FROM envoyproxy/envoy:v1.22.5


COPY start-envoy.sh /start-envoy.sh
COPY envoy.yaml /tmpl/envoy.yaml

RUN chmod +x /start-envoy.sh
RUN apt-get update && \
    apt-get install gettext -y
ENTRYPOINT ["/start-envoy.sh"]