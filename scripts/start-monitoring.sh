#!/bin/bash
set -e
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3

echo "Starting Monitoring..."
echo "To login to Grafana, use the following credentials:"
echo "Username: admin"
echo "Password: admin"
while true; do
  if kubectl get pods -n monitoring | grep ^prometheus-grafana | grep Running; then
    break
  fi
  echo "Waiting for prometheus-grafana pod to be ready..."
  sleep 5
done
grafana_pod=$(kubectl get pods -n monitoring | grep ^prometheus-grafana | awk '{print $1}' | head -n 1)
echo "Grafana pod: ${grafana_pod}"
kubectl --namespace monitoring port-forward ${grafana_pod} 3000