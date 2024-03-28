# aws-grpc-chat

## Prerequisites
Install:
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)
* [Helm](https://helm.sh/docs/intro/install/)


## Deployment
1. Build and push the gRPC server’s Docker image to Amazon ECR:
    ```
    aws ecr create-repository --repository-name helloworld-grpc
    docker build -t <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/helloworld-grpc:1.0 .
    aws ecr get-login-password --region us-east-1 --no-cli-auto-prompt | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
    docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/helloworld-grpc:1.0
    ```

2. Deploy domain CloudFormation stack:
   Update DomainName parameter in `./aws/domain-cfn-template.yaml` file with the desired domain name.
    ```
    aws cloudformation deploy --template-file ./aws/domain-cfn-template.yaml \
    --stack-name suu-domain \
    --capabilities CAPABILITY_NAMED_IAM \
    --region us-east-1 \
    --profile default
    ```
    During deployment add CNAME record to Route 53 hosted zone: [DNS Validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)

3. Deploy CloudFormation stack with network, EKS cluster and node group:
    ```
    aws cloudformation deploy --template-file ./aws/infra-cfn-template.yaml \
    --stack-name suu-infra \
    --capabilities CAPABILITY_NAMED_IAM \
    --region us-east-1 \
    --profile default
    ```

4. Update kubeconfig:
    ```
    aws eks update-kubeconfig --region us-east-1 --name suu-eks-cluster
    ```

5. AWS Load Balancer Controller:
    ```
      helm repo add eks https://aws.github.io/eks-charts
      helm repo update eks
      helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
      -n kube-system \
      --set clusterName=suu-eks-cluster \
      --set serviceAccount.create=true \
      --set serviceAccount.name=aws-load-balancer-controller 
    ```

6. Apply manifest:
    Update the `./kubernetes/grpc.yaml` file with the correct ECR image URL and domain name. Then apply the manifest:
    ```
      kubectl apply -f ./aws/kubernetes/grpc.yaml
    ```

7. Configure Route 53 by adding an A record with the domain name linked to the Load Balancer DNS name. Alternatively, you can update the /etc/hosts file by appending the IP address of the Application Load Balancer (ALB).