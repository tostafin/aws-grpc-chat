#!/bin/bash
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3

export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

export GRPC_SERVER_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/aws-grpc-server:1.0
export GRPC_CLIENT_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/aws-grpc-client:1.0
export GRPC_ENVOY_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/aws-grpc-client-envoy:1.0

export DOMAIN_NAME="mnessel.pl"
#
## --- AWS ECR ---
#aws ecr get-login-password --region us-east-1 --no-cli-auto-prompt | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
#
#echo "Building and Pushing GRPC Server to ECR..."
#aws ecr create-repository --repository-name aws-grpc-server
#cp -R app/proto app/server && docker build -t ${GRPC_SERVER_IMAGE} app/server && rm -R app/server/proto/
#docker push ${GRPC_SERVER_IMAGE}
#
#echo "Building and Pushing GRPC Client to ECR..."
#aws ecr create-repository --repository-name aws-grpc-client
#docker build -t ${GRPC_CLIENT_IMAGE} app/client
#docker push ${GRPC_CLIENT_IMAGE}
#
#echo "Building and Pushing Envoy Proxy to ECR..."
#aws ecr create-repository --repository-name aws-grpc-client-envoy
#docker build -t ${GRPC_ENVOY_IMAGE} app/envoy
#docker push ${GRPC_ENVOY_IMAGE}
#
#
## --- AWS CLOUDFORMATION ---
#echo "Deploying Domain CloudFormation Stack..."
#aws cloudformation deploy --template-file ./aws/domain-cfn-template.yaml \
#--stack-name suu-domain \
#--capabilities CAPABILITY_NAMED_IAM \
#--region us-east-1 \
#--profile default \
#--parameter-overrides DomainName=${DOMAIN_NAME}
#
#echo "Deploying Infra CloudFormation Stack..."
#    aws cloudformation deploy --template-file ./aws/infra-cfn-template.yaml \
#    --stack-name suu-infra \
#    --capabilities CAPABILITY_NAMED_IAM \
#    --region us-east-1 \
#    --profile default
#
#
## --- KUBERNETES LB ---
#echo "Updating Kubeconfig..."
#aws eks update-kubeconfig --region us-east-1 --name suu-eks-cluster
#
#echo "Installing the AWS Load Balancer Controller..."
#helm repo add eks https://aws.github.io/eks-charts
#helm repo update eks
#helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
#    -n kube-system \
#    --set clusterName=suu-eks-cluster \
#    --set serviceAccount.create=true \
#    --set serviceAccount.name=aws-load-balancer-controller
#
#
## --- KUBERNETES MANIFEST ---
#echo "Deploying EKS manifests..."
##kubectl apply -f ./aws/kubernetes/grpc.yaml # Without environment variables
#envsubst < ./aws/kubernetes/grpc.yaml | kubectl apply -f - # With environment variables
#
#
## --- KUBERNETES MONITORING ---
#echo "Deploying Monitoring..."
#helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
#
#kubectl create namespace monitoring
#
#helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --set grafana.adminPassword=admin

echo "Done!"
echo "You can access the application at https://${DOMAIN_NAME}/app"
echo "To show monitoring dashboard run: scripts/start-monitoring.sh script. User: admin, Password: admin"
