FROM golang:1.22.2 as builder

RUN mkdir /proto
COPY proto/ /proto 

WORKDIR /build

# Download Go modules
COPY go.* ./
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy

COPY . ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /aws-grpc-chat-server

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/reference/dockerfile/#expose


FROM scratch
WORKDIR /app

COPY --from=builder /aws-grpc-chat-server /aws-grpc-chat-server

EXPOSE 9000

CMD [ "/aws-grpc-chat-server"]
