build:
	cp -R ../proto .
	docker build -t aws-grpc-chat-server .
	rm -R proto/

start:
	docker run -d -p 9000:9000 aws-grpc-chat-server