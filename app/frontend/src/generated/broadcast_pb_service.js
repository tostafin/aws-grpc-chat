// package: 
// file: broadcast.proto

var broadcast_pb = require("./broadcast_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Broadcast = (function () {
  function Broadcast() {}
  Broadcast.serviceName = "Broadcast";
  return Broadcast;
}());

Broadcast.CreateStream = {
  methodName: "CreateStream",
  service: Broadcast,
  requestStream: false,
  responseStream: true,
  requestType: broadcast_pb.User,
  responseType: broadcast_pb.Message
};

Broadcast.BroadcastMessage = {
  methodName: "BroadcastMessage",
  service: Broadcast,
  requestStream: false,
  responseStream: false,
  requestType: broadcast_pb.Message,
  responseType: broadcast_pb.Close
};

exports.Broadcast = Broadcast;

function BroadcastClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

BroadcastClient.prototype.createStream = function createStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(Broadcast.CreateStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

BroadcastClient.prototype.broadcastMessage = function broadcastMessage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(Broadcast.BroadcastMessage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.BroadcastClient = BroadcastClient;

