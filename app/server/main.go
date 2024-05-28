package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/go-redis/redis/v8"
	"google.golang.org/protobuf/proto"
	pb "github.com/tostafin/aws-grpc-chat/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	port         = flag.Int("port", 9000, "The server port")
	redisClient  *redis.Client
	redisWriteClient  *redis.Client
	defaultChatID = "default_chat"
)

type connection struct {
	pb.UnimplementedBroadcastServer
	stream pb.Broadcast_CreateStreamServer
	id     string
	chatID string
	active bool
	error  chan error
}

type broadcastServer struct {
	pb.UnimplementedBroadcastServer
	connections []*connection
}

func (p *broadcastServer) CreateStream(user *pb.User, stream pb.Broadcast_CreateStreamServer) error {
	if err := userValidations(user); err != nil {
		log.Println("error with creating stream:", err)
		return err
	}

	chatID := user.ChatId

	conn := &connection{
		stream: stream,
		id:     user.Id,
		chatID: chatID,
		active: true,
		error:  make(chan error),
	}

	messages, err := fetchLastMessages(chatID, 100)
	if err != nil {
		log.Println("error fetching last messages:", err)
		return err
	}
	for i := len(messages) - 1; i >= 0; i-- {
		if err := stream.Send(messages[i]); err != nil {
			log.Println("error sending message:", err)
			return err
		}
	}

	p.connections = append(p.connections, conn)
	log.Println("new stream created for user:", conn.id, "in chat:", conn.chatID)

	go func() {
		<-stream.Context().Done()
		log.Println("client closed connection:", conn.id, "in chat:", conn.chatID)
		conn.active = false
		conn.error <- fmt.Errorf("stream context done")
	}()

	return <-conn.error
}

func messageValidation(msg *pb.Message) error {
	if msg == nil {
		return fmt.Errorf("message is not provided")
	}
	if msg.UserId == "" {
		return fmt.Errorf("user id is empty")
	}
	if msg.Content == "" {
		return fmt.Errorf("message content is empty")
	}
	if msg.Timestamp == nil {
		return fmt.Errorf("message timestamp is not provided")
	}
	return nil
}

func userValidations(u *pb.User) error {
	if u == nil {
		return fmt.Errorf("user is not provided")
	}
	if u.Id == "" {
		return fmt.Errorf("id is empty")
	}

	return nil
}

func (s *broadcastServer) BroadcastMessage(ctx context.Context, msg *pb.Message) (*pb.Close, error) {
	if err := messageValidation(msg); err != nil {
		log.Printf("error with message validation %v - error: %v \n", msg, err)
		return &pb.Close{}, err
	}

	if err := saveAndPublishMessage(msg); err != nil {
		log.Printf("error saving and publishing message to redis %v - error: %v \n", msg, err)
		return &pb.Close{}, err
	}

	return &pb.Close{}, nil
}

func saveAndPublishMessage(msg *pb.Message) error {
	data, err := proto.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %v", err)
	}

	chatKey := "chat_messages:" + msg.ChatId
	chatChannel := "chat_channel:" + msg.ChatId

	_, err = redisWriteClient.TxPipelined(context.Background(), func(pipe redis.Pipeliner) error {
		pipe.LPush(context.Background(), chatKey, data)
		pipe.Publish(context.Background(), chatChannel, data)
		return nil
	})

	return err
}

func fetchLastMessages(chatID string, count int64) ([]*pb.Message, error) {
	chatKey := "chat_messages:" + chatID
	result, err := redisClient.LRange(context.Background(), chatKey, -count, -1).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch messages from redis: %v", err)
	}

	messages := make([]*pb.Message, 0, len(result))
	for _, data := range result {
		var msg pb.Message
		if err := proto.Unmarshal([]byte(data), &msg); err != nil {
			return nil, fmt.Errorf("failed to unmarshal message: %v", err)
		}
		messages = append(messages, &msg)
	}

	return messages, nil
}

func main() {
	flag.Parse()

	redisReadHost := getEnv("REDIS_READ_HOST", "localhost")
	redisClient = redis.NewClient(&redis.Options{
		Addr: redisReadHost + ":6379",
		DB:   0,
	})

	redisWriteHost := getEnv("REDIS_WRITE_HOST", "localhost")
	redisWriteClient = redis.NewClient(&redis.Options{
		Addr: redisWriteHost + ":6379",
		DB:   0,
	})

	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))

	if err != nil {
		log.Fatalf("failed to listen %v", err)
	}

	grpcServer := grpc.NewServer()

	s := &broadcastServer{
		connections: []*connection{},
	}

	pb.RegisterBroadcastServer(grpcServer, s)

	reflection.Register(grpcServer)

	go handleRedisPubSub(s)

	log.Println("server listening at", listener.Addr().String())

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}


func handleRedisPubSub(s *broadcastServer) {
	pubsub := redisClient.PSubscribe(context.Background(), "chat_channel:*")
	ch := pubsub.Channel()

	for msg := range ch {
		var pbMsg pb.Message
		if err := proto.Unmarshal([]byte(msg.Payload), &pbMsg); err != nil {
			log.Println("failed to unmarshal pubsub message:", err)
			continue
		}

		for _, conn := range s.connections {
			if conn.active && conn.chatID == pbMsg.ChatId {
				go func(conn *connection, pbMsg *pb.Message) {
					if err := conn.stream.Send(pbMsg); err != nil {
						log.Println("error sending message to stream:", err)
						conn.active = false
						conn.error <- err
					}
				}(conn, &pbMsg)
			}
		}
	}
}

func getEnv(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}
