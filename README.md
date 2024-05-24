# aws-grpc-chat

Acronym &mdash; Title: gRPC

Authors: Tomasz Bochnak, Mateusz Kleszcz, Maciej Nessel, Tomasz Ostafin

Year, Group: 4, 4

## Introduction
Live video streaming services are becoming more and more popular. Most of them are accompanied with a chat which allows the audience to share comments among each other and with the streamer. Some of these live streams achieve a high number of viewers, with millions commenting live at the same time. This requires modern infrastructure and legacy solutions like HTTP polling or WebSockets may not work as desired in a high load environment like this one. On the other hand, gRPC solves the issues other technologies are facing by supporting load balancing and providing server streaming.

## Theoretical background/technology stack
The example streaming app with the chat is going to be deployed on AWS. The architecture will look something like this:

Additionally to gRPC, the following technologies will be used:
- Docker
- Kubernetes
- Helm

## Case study concept description
Clients will enter a web page on which a chat is present. They will automatically connect to it and will be able to see live comments in real time as well as write them to the chat. Each client may connect to a different server as the traffic will be load balanced behind the scenes.

## Solution architecture
![aws architecture](./docs/aws-architecture.png "AWS Architecture")

![workflow](./docs/workflow.png "Workflow")

[Source](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html#deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer-architecture)

## Environment configuration description
The architecture will be deployed using the CloudFormation templates. All you need is an AWS account.

## Installation method
Besides the technologies mentioned earlier, uou need to install the AWS CLI package and run `aws configure` in your terminal to set it up.

## How to reporduce - step by step
### Infrastructure as Code approach
AWS Cloudformation templates are used to deploy this application. They can be found in the `aws` directory.

## Demo deployment steps
### Configuration set-up
Run the following script to deploy services on AWS:
```bash
scripts/deploy.sh
```
If necessary update the /etc/hosts file by appending the IP address of the Application Load Balancer.

To start EKS cluster monitoring run:
```bash
scripts/start-monitoring.sh
```

### Data preparation
Mock files with sample comments will be used to simulate huge traffic loads. Additionally, real clients will be able to write to the chat and their messages will be displayed in real time to others.

### Execution procedure
Run the [client](./app/helloworld_client_ssl.py) to connect to the server and receive responses.

### Results presentation

## Summary &mdash; conclusions

## References
[Deploy a gRPC-based application on an Amazon EKS cluster and access it with an Application Load Balancer](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html)
