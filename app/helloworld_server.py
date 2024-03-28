import grpc
from concurrent import futures
import helloworld_pb2_grpc as pb2_grpc
import helloworld_pb2 as pb2
from grpc_reflection.v1alpha import reflection
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__name__)


class helloworldService(pb2_grpc.helloworldServicer):
    def __init__(self, *args, **kwargs):
        pass

    def GetServerResponse(self, request, context):
        message = request.message
        result = f'Thanks for talking to gRPC server!!! Welcome to hello world. Received message is {message}'
        result = {'message': result, 'received': True}
        logger.info("Received message from client")
        return pb2.MessageResponse(**result)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_helloworldServicer_to_server(helloworldService(), server)
    SERVICE_NAMES = (
        pb2.DESCRIPTOR.services_by_name['helloworld'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    server.add_insecure_port('[::]:9000')
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    logger.info('Started server on port 9000')
    serve()
