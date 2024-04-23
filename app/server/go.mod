module github.com/tostafin/aws-grpc-chat

go 1.22.2

require (
	github.com/tostafin/aws-grpc-chat/proto v0.0.0-00010101000000-000000000000
	google.golang.org/grpc v1.63.2
)

require (
	golang.org/x/net v0.24.0 // indirect
	golang.org/x/sys v0.19.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240412170617-26222e5d3d56 // indirect
	google.golang.org/protobuf v1.33.0 // indirect
)

replace github.com/tostafin/aws-grpc-chat/proto => ../proto
