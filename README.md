# aws-grpc-chat

## Prerequisites
- AWS CLI (run `aws configure` to set it up)
- Docker
- Kubernetes
- Helm


## Deployment
1. Build and push the gRPC server Docker image to Amazon ECR (replace <AWS_ACCOUNT_ID> with your AWS account ID):
    ```
    aws ecr create-repository --repository-name helloworld-grpc
    ```
    ```
    docker build -t <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/helloworld-grpc:1.0 .
    ```
    ```
    aws ecr get-login-password --region us-east-1 --no-cli-auto-prompt | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
    ```
    ```
    docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/helloworld-grpc:1.0
    ```

2. Deploy the [domain CloudFormation stack](./aws/domain-cfn-template.yaml):
    1. Update the `DomainName` parameter with the desired domain name.
    2. Run the following to start the deployment:
        ```
        aws cloudformation deploy --template-file ./aws/domain-cfn-template.yaml \
        --stack-name suu-domain \
        --capabilities CAPABILITY_NAMED_IAM \
        --region us-east-1 \
        --profile default
        ```
    3. **During** the deployment add a CNAME record to the Route 53 hosted zone:
        1. Go to the Certificate Manager service, then to *List certificates* and select your certificate.
        2. Copy the CNAME key and value.
        3. Go to the Route 53 service, then to *Hosted zones* and click on *Create record*.
        4. Paste the CNAME key into *Record name*, paste the CNAME value into *Value* and switch the *Record type* to *CNAME - ...*

3. Deploy the [infra CloudFormation stack](./aws/infra-cfn-template.yaml) (network, EKS cluster and node group):
    ```
    aws cloudformation deploy --template-file ./aws/infra-cfn-template.yaml \
    --stack-name suu-infra \
    --capabilities CAPABILITY_NAMED_IAM \
    --region us-east-1 \
    --profile default
    ```

4. Update the kubeconfig:
    ```
    aws eks update-kubeconfig --region us-east-1 --name suu-eks-cluster
    ```

5. Install the AWS Load Balancer Controller:
    ```
    helm repo add eks https://aws.github.io/eks-charts
    ```
    ```
    helm repo update eks
    ```
    ```
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=suu-eks-cluster \
    --set serviceAccount.create=true \
    --set serviceAccount.name=aws-load-balancer-controller 
    ```

6. Update the [manifest file](./aws/kubernetes/grpc.yaml) with the correct ECR image URL and domain name. Then apply it:
    ```
    kubectl apply -f ./aws/kubernetes/grpc.yaml
    ```

7. Configure Route 53:
    - Update the /etc/hosts file by appending the IP address of the Application Load Balancer.
    - Alternatively, add an A record with the domain name linked to the Load Balancer DNS name.
