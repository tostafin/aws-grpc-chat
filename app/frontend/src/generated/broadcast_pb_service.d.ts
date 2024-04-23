// package: 
// file: broadcast.proto

import * as broadcast_pb from "./broadcast_pb";
import {grpc} from "@improbable-eng/grpc-web";

type BroadcastCreateStream = {
  readonly methodName: string;
  readonly service: typeof Broadcast;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof broadcast_pb.User;
  readonly responseType: typeof broadcast_pb.Message;
};

type BroadcastBroadcastMessage = {
  readonly methodName: string;
  readonly service: typeof Broadcast;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof broadcast_pb.Message;
  readonly responseType: typeof broadcast_pb.Close;
};

export class Broadcast {
  static readonly serviceName: string;
  static readonly CreateStream: BroadcastCreateStream;
  static readonly BroadcastMessage: BroadcastBroadcastMessage;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class BroadcastClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  createStream(requestMessage: broadcast_pb.User, metadata?: grpc.Metadata): ResponseStream<broadcast_pb.Message>;
  broadcastMessage(
    requestMessage: broadcast_pb.Message,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: broadcast_pb.Close|null) => void
  ): UnaryResponse;
  broadcastMessage(
    requestMessage: broadcast_pb.Message,
    callback: (error: ServiceError|null, responseMessage: broadcast_pb.Close|null) => void
  ): UnaryResponse;
}

