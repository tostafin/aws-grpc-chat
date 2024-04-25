#!/bin/sh
set -e

cat /tmpl/envoy.yaml | envsubst \$LISTEN_PORT,\$SERVICE_DISCOVERY_ADDRESS,\$SERVICE_DISCOVERY_PORT > /etc/envoy.yaml

/usr/local/bin/envoy -c /etc/envoy.yaml