package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"sync"

	pb "github.com/tostafin/aws-grpc-chat/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var (
	port = flag.Int("port", 9000, "The server port")
)

type connection struct {
	pb.UnimplementedBroadcastServer
	stream pb.Broadcast_CreateStreamServer
	id     string
	active bool
	error  chan error
}

type broadcastServer struct {
	logger *log.Logger
	pb.UnimplementedBroadcastServer
	connections []*connection
}

func (p *broadcastServer) CreateStream(user *pb.User, stream pb.Broadcast_CreateStreamServer) error {
	if err := userValidations(user); err != nil {
		log.Println("error with creating stream:", err)
		return err
	}

	conn := &connection{
		stream: stream,
		id:     user.Id,
		active: true,
		error:  make(chan error),
	}

	p.connections = append(p.connections, conn)
	log.Println("new stream created for user:", conn.id) // Log when a new stream is created

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
	wait := sync.WaitGroup{}
	done := make(chan int)

	if err := messageValidation(msg); err != nil {
		log.Printf("error with message validation %v - error: %v \n", msg, err)
		return &pb.Close{}, err
	}

	for _, conn := range s.connections {
		wait.Add(1)

		go func(msg *pb.Message, conn *connection) {
			defer wait.Done()

			if conn.active {
				log.Printf("sending message from: %v to: %v \n", msg.UserId, conn.id) // message is sent
				if err := conn.stream.Send(msg); err != nil {
					log.Println("error with stream:", conn.stream, err)
					conn.active = false
					conn.error <- err
				}
			}
		}(msg, conn)
	}

	go func() {
		wait.Wait()
		close(done)
	}()

	<-done
	return &pb.Close{}, nil
}

func main() {
	flag.Parse()

	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))

	if err != nil {
		log.Fatalf("failed to listen %v", err)
	}

	// Create a new gRPC server
	grpcServer := grpc.NewServer()

	s := &broadcastServer{
		connections: []*connection{},
	}

	// Register the pool with the gRPC server
	pb.RegisterBroadcastServer(grpcServer, s)

	reflection.Register(grpcServer)

	log.Println("server listening at", listener.Addr().String())

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
