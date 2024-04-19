package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"

	"github.com/tostafin/aws-grpc-chat/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type Connection struct {
	proto.UnimplementedBroadcastServer
	stream proto.Broadcast_CreateStreamServer
	id     string
	active bool
	error  chan error
}

type Pool struct {
	logger *log.Logger
	proto.UnimplementedBroadcastServer
	Connection []*Connection
}

func (p *Pool) CreateStream(pconn *proto.Connect, stream proto.Broadcast_CreateStreamServer) error {
	conn := &Connection{
		stream: stream,
		id:     pconn.User.Id,
		active: true,
		error:  make(chan error),
	}

	p.Connection = append(p.Connection, conn)
	log.Printf("New stream created for user: %s\n", conn.id) // Log when a new stream is created

	return <-conn.error
}

func (s *Pool) BroadcastMessage(ctx context.Context, msg *proto.Message) (*proto.Close, error) {
	wait := sync.WaitGroup{}
	done := make(chan int)

	for _, conn := range s.Connection {
		wait.Add(1)

		go func(msg *proto.Message, conn *Connection) {
			defer wait.Done()

			if conn.active {
				log.Printf("Sending message to: %v from %v\n", conn.id, msg.Id) // Log when a message is sent
				err := conn.stream.Send(msg)
				if err != nil {
					log.Printf("Error with Stream: %v - Error: %v\n", conn.stream, err)
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
	return &proto.Close{}, nil
}

func main() {
	// Create a new gRPC server
	grpcServer := grpc.NewServer()

	// Create a new connection pool
	var conn []*Connection

	pool := &Pool{
		Connection: conn,
	}

	// Register the pool with the gRPC server
	proto.RegisterBroadcastServer(grpcServer, pool)

	reflection.Register(grpcServer)

	listener, err := net.Listen("tcp", ":9001")

	if err != nil {
		log.Fatalf("Error creating the server %v", err)
	}

	fmt.Println("Server started at port :9001")

	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Error creating the server %v", err)
	}
}
