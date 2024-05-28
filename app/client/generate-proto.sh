#!/bin/sh

OUT_DIR="./src/generated"

protoc \
    --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
    --ts_opt=esModuleInterop=true \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="service=grpc-web:${OUT_DIR}" \
    --proto_path="../proto/" \
    broadcast.proto