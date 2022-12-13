"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinePlusAppleStack = void 0;
const cdk = require("aws-cdk-lib");
const ecs = require("aws-cdk-lib/aws-ecs");
const ecr_assets = require("aws-cdk-lib/aws-ecr-assets");
const ecr = require("aws-cdk-lib/aws-ecr");
const elb = require("aws-cdk-lib/aws-elasticloadbalancingv2");
/**
 * AWS Relational Database Service -- lets us specify the exact relational
 * database tech later (we use Postgres)
 */
const rds = require("aws-cdk-lib/aws-rds");
/**
 * AWS Elastic Compute 2 (as opposed to Elastic Compute Classic which didn't use VPC)
 * We use it as our webserver running our Remix app.
 */
const ec2 = require("aws-cdk-lib/aws-ec2");
/**
 * AWSIdentity & Access Management
 * In AWS, everything is deny by default. So we need to give explicit permissions
 * for every resource we define here (our VPC, EC2 Instance, SNS topics, db) to
 * read/write from every other resource. Useful for security (because it greatly
 * lowers attack surface) and also for making explicit the dependency graph in
 * our infrastructure.
 */
const iam = require("aws-cdk-lib/aws-iam");
/**
 * AWS Amazon Certificate Manager.
 * Our Webserver needs to present a TLS certificate with every request from users
 * on the internet so they know they can trust the website is what it says it is.
 * It ultimately comes down to trusting a certificate authority (CA) which signs
 * the certificate. Amazon has their own which we use, but others typically use
 * Let's Encrypt.
 */
const acm = require("aws-cdk-lib/aws-certificatemanager");
const path = require("path");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_ecs_1 = require("aws-cdk-lib/aws-ecs");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
class PinePlusAppleStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        /**
         * Set up a VPC for our services so we can pick and choose what we expose
         * to the internet.
         *
         * Only our EC2 instance needs to be exposed to the internet. It'll host
         * the remix app which has API endpoints which will then call
         * lambdas/postgres/publish events to SNS, etc.
         *
         * For more advanced use cases we can set up more subnets to isolate related
         * services from each other but for now we'll stick everything that doesn't
         * need to be exposed to the internet to the same `PRIVATE_ISOLATED` subnet.
         */
        const VirtualPrivateCloud = new ec2.Vpc(this, "PpaVpc", {
            /**
             * NAT Gateways are prohibitvely expensive and are meant for communication
             * between internal subnets and other VPCs or external services, which
             * we don't need.
             */
            natGateways: 0,
            subnetConfiguration: [
                {
                    name: "ppa-public-subnet-for-ingress",
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: "ppa-isolated-subnet-for-internal-services",
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 28,
                },
            ],
        });
        /**
         * When we create the Fargate cluster to run our web server, we need to provide
         * it a docker file. The docker file will install all the necessary software
         * like node, the prisma CLI, npm, etc.
         */
        const WebServerDockerImage = new ecr_assets.DockerImageAsset(this, "PinePlusAppleWebServerDockerImage", {
            directory: path.join(__dirname, "../../www"),
            networkMode: ecr_assets.NetworkMode.HOST,
        });
        /**
         * Set up a container registry to host the code for our Remix app. When we push
         * to the main or dev branch on GitHub, an action will trigger to run
         * linters, tests, typechecks, and build the app (both the client and server
         * bundles including all static assets, client-side JS code, and index.html file).
         *
         * After the checks and build have passed. The GitHub action will then run the
         * steps in the Dockerfile at /www/Dockerfile to generate an image with a
         * specific version of Node installed and the bundled source code.
         *
         * For a remix app specifically, it will serve assets from the /public/build
         * folder and the server-side code will be in the /build folder (under the
         * www/ directory in this repo.)
         *
         * To keep things secure we'll have to provide explicit permission to the
         * GitHub action running under the GitHub repo we push to to push to this ECR
         * repo.
         */
        const WebsiteContainerRegistry = new ecr.Repository(this, "PpaWebsiteContainerRegistry", {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            /**
             * From the docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr-readme.html#authorization-token
             *
             * "Amazon ECR image scanning helps in identifying software vulnerabilities
             * in your container images. You can manually scan container images stored
             * in Amazon ECR, or you can configure your repositories to scan images
             * when you push them to a repository. To create a new repository to scan
             * on push, simply enable imageScanOnPush".
             *
             * TODO: in the future you can add a handler for the `onImageScanCompleted`
             * event to notify you in some way: either through a Slack/GitHub/Jira/Email
             * integration or something else
             */
            imageScanOnPush: true,
        });
        const ElasticContainerForServices = new ecs.Cluster(this, "PpaEcsCluster", {
            vpc: VirtualPrivateCloud,
            containerInsights: true,
        });
        const LoadBalancerSecurityGroup = new ec2.SecurityGroup(this, "PpaLoadBalancerSecurityGroup", {
            vpc: VirtualPrivateCloud,
        });
        const WebsiteLoadBalancer = new elb.ApplicationLoadBalancer(this, "PpaWebsiteLoadBalancer", {
            vpc: VirtualPrivateCloud,
            internetFacing: true,
            deletionProtection: false,
            securityGroup: LoadBalancerSecurityGroup,
        });
        const HttpTrafficListener = WebsiteLoadBalancer.addListener("PpaWebsiteHttpTrafficListener", {
            port: 80,
            open: true,
            /**
             * For requests made over regular HTTP, we'll redirect them to HTTPS.
             * This essentially forces all traffic to be HTTPS except for the initial
             * request for the TLS certificate. We can, later on, even secure that
             * request for some browsers by adding this website to the HSTS preload
             * list.
             */
            defaultAction: elb.ListenerAction.redirect({
                port: "443",
                protocol: elb.ApplicationProtocol.HTTPS,
            }),
        });
        const HttpsTrafficListener = WebsiteLoadBalancer.addListener("PpaWebsiteSecureHttpsTrafficListener", {
            port: 443,
            protocol: elb.ApplicationProtocol.HTTPS,
            open: true,
            sslPolicy: elb.SslPolicy.RECOMMENDED,
            certificates: [
                acm.Certificate.fromCertificateArn(this, "PpaWebsiteTlsCertificate", "arn:aws:acm:us-west-2:409465725920:certificate/cf696149-a6f0-4597-b5c8-62c658ac1ec8"),
            ],
        });
        const HttpTargetGroup = HttpsTrafficListener.addTargets("PpaWebsiteTcpListenerTarget", {
            protocol: elb.ApplicationProtocol.HTTP,
            protocolVersion: elb.ApplicationProtocolVersion.HTTP1,
        });
        const taskDefinition = new ecs.FargateTaskDefinition(this, "ppa-fargate-task-definition", {
            runtimePlatform: {
                cpuArchitecture: ecs.CpuArchitecture.ARM64,
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
            },
        });
        const container = taskDefinition.addContainer("web-server", {
            image: ecs.ContainerImage.fromEcrRepository(WebsiteContainerRegistry),
        });
        container.addPortMappings({
            containerPort: 8081,
        });
        const FargateServiceSecurityGroup = new aws_ec2_1.SecurityGroup(this, "ppa-fargate-service-security-group-for-http-traffic", {
            vpc: VirtualPrivateCloud,
        });
        FargateServiceSecurityGroup.addIngressRule(ec2.Peer.securityGroupId(LoadBalancerSecurityGroup.securityGroupId), ec2.Port.tcp(80), "Allow inbound connections from the Application Load Balancer");
        const WebsiteFargateService = new aws_ecs_1.FargateService(this, "PpaWebsiteFargateService", {
            cluster: ElasticContainerForServices,
            assignPublicIp: false,
            taskDefinition,
            securityGroups: [FargateServiceSecurityGroup],
        });
        HttpTargetGroup.addTarget(WebsiteFargateService);
        /**
         * From the documentation:
         *
         * "The aws-actions/configure-aws-credentials action receives a JWT from the
         * GitHub OIDC provider, and then requests an access token from AWS."
         *
         * Documentation link: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#requesting-the-access-token
         */
        const GithubActionsCodeDeployOidcProvider = new iam.OpenIdConnectProvider(this, "GithubActionsOidcProvider", {
            url: `https://token.actions.githubusercontent.com`,
            clientIds: ["sts.amazonaws.com"],
        });
        /**
         * We need GH to be able to do the following:
         *
         * 1. Upload a generated image to the ECR repo we set up above.
         * 2. Deploy the
         */
        const GitHubActionsCodeDeployIamRole = new iam.Role(this, "GitHubActionsCodeDeployIamRole", {
            assumedBy: new iam.WebIdentityPrincipal(GithubActionsCodeDeployOidcProvider.openIdConnectProviderArn),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodeDeployDeployerAccess"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
            ],
        });
        /**
         * We pull the `bitnami/node:18` image from the public Amazon container
         * registry so we should ensure the IAM role the GitHub action is assuming
         * has permission to pull from it.
         */
        ecr.PublicGalleryAuthorizationToken.grantRead(GitHubActionsCodeDeployIamRole);
        /**
         * Ensure the IAM role the GitHub action is assuming has permission to
         * push to our ECR repo.
         */
        // WebsiteContainerRegistry.grantPullPush(GitHubActionsCodeDeployIamRole);
        // const WebsiteFargateService =
        //   new ecsp.ApplicationLoadBalancedFargateService(
        //     this,
        //     "PinePlusAppleWebsite",
        //     {
        //       taskImageOptions: {
        //         image:
        //           ecs.ContainerImage.fromDockerImageAsset(WebServerDockerImage),
        //       },
        //       vpc: VirtualPrivateCloud,
        //       certificate: WebsiteTlsCertificate,
        //     }
        //   );
        const dbCredentialsSecretName = "ppa-llc-prod-postgres-credentials";
        const DatabaseCredentials = rds.Credentials.fromGeneratedSecret("postgres", {
            secretName: dbCredentialsSecretName,
        });
        const DatabaseInstance = new rds.DatabaseInstance(this, "ppa-db-prod", {
            vpc: VirtualPrivateCloud,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_14_4,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
            credentials: DatabaseCredentials,
            multiAz: false,
            allocatedStorage: 100,
            maxAllocatedStorage: 105,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: cdk.Duration.days(1),
            deleteAutomatedBackups: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            deletionProtection: false,
            // Constraints: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbinstance.html#cfn-rds-dbinstance-dbname
            databaseName: "ppa_db_prod",
            publiclyAccessible: false,
        });
        /**
         * The only thing connecting to our DB should be our compute instance.
         * They're on the same VPC, but the EC2 is exposed publicly since it has
         * to host our app and serve public traffic.
         */
        DatabaseInstance.connections.allowFrom(ec2.Peer.securityGroupId(LoadBalancerSecurityGroup.securityGroupId), ec2.Port.tcp(5432));
        new cdk.CfnOutput(this, "ppa_db_endpoint", {
            value: DatabaseInstance.instanceEndpoint.hostname,
        });
        new cdk.CfnOutput(this, "ppa_db_credentials", {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            value: dbCredentialsSecretName,
        });
        // const bucket = new s3.Bucket(this, "ProductImages", {
        //   versioned: true,
        // });
        // const OrderReceivedEmailLambda = new cdk.aws_lambda.Function(
        //   this,
        //   "OrderReceivedEmailLambda",
        //   {
        //     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        //     handler: "index.order_received_emailer_lambda",
        //     code: cdk.aws_lambda.Code.fromAsset(path.join(__dirname, "lambdas")),
        //   }
        // );
        // OrderReceivedEmailLambda.addToRolePolicy(
        //   new iam.PolicyStatement({
        //     effect: iam.Effect.ALLOW,
        //     actions: [
        //       "ses:SendEmail",
        //       "ses:SendRawEmail",
        //       "ses:SendTemplatedEmail",
        //     ],
        //     resources: [
        //       `arn:aws:ses:${process.env.CDK_DEFAULT_REGION}:${
        //         cdk.Stack.of(this).account
        //       }:identity/${process.env.SES_EMAIL_FROM}`,
        //     ],
        //   })
        // );
        // const OrderReceived;
        // The code that defines your stack goes here
        // example resource
        // const queue = new sqs.Queue(this, 'ServicesQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
    }
}
exports.PinePlusAppleStack = PinePlusAppleStack;
const app = new cdk.App();
new PinePlusAppleStack(app, "PinePlusAppleBusinessStack");
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGluZXBsdXNhcHBsZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpbmVwbHVzYXBwbGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBU25DLDJDQUEyQztBQUszQyx5REFBeUQ7QUFDekQsMkNBQTJDO0FBSTNDLDhEQUE4RDtBQVU5RDs7O0dBR0c7QUFDSCwyQ0FBMkM7QUFDM0M7OztHQUdHO0FBQ0gsMkNBQTJDO0FBQzNDOzs7Ozs7O0dBT0c7QUFDSCwyQ0FBMkM7QUFDM0M7Ozs7Ozs7R0FPRztBQUNILDBEQUEwRDtBQUUxRCw2QkFBNkI7QUFDN0IsaURBQW9EO0FBQ3BELGlEQUFxRDtBQUVyRCw4Q0FBOEM7QUFFOUMsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCOzs7Ozs7Ozs7OztXQVdHO1FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUN0RDs7OztlQUlHO1lBQ0gsV0FBVyxFQUFFLENBQUM7WUFDZCxtQkFBbUIsRUFBRTtnQkFDbkI7b0JBQ0UsSUFBSSxFQUFFLCtCQUErQjtvQkFDckMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTTtvQkFDakMsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLDJDQUEyQztvQkFDakQsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO29CQUMzQyxRQUFRLEVBQUUsRUFBRTtpQkFDYjthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUg7Ozs7V0FJRztRQUNILE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxVQUFVLENBQUMsZ0JBQWdCLENBQzFELElB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bURBQW1EO1FBQ25ELFNBQVM7UUFDVCxPQUFPO1FBQ1AsS0FBSztRQUVMLHVCQUF1QjtRQUV2Qiw2Q0FBNkM7UUFFN0MsbUJBQW1CO1FBQ25CLHVEQUF1RDtRQUN2RCxpREFBaUQ7UUFDakQsTUFBTTtJQUNSLENBQUM7Q0FDRjtBQWhYRCxnREFnWEM7QUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUxQixJQUFJLGtCQUFrQixDQUFDLEdBQUcsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBRTFELEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbi8qKlxuICogQVdTIFNpbXBsZSBTdG9yYWdlIFNlcnZpY2UgLSB3ZSBzdG9yZSBQREZzIG9mIGN1c3RvbWVyIGludm9pY2VzLCBQREZzIG9mXG4gKiBzaGlwcGluZyBsYWJlbHMsIGFuZCBpbWFnZXMgb2YgcHJvZHVjdHMuXG4gKi9cbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcblxuaW1wb3J0ICogYXMgYXBwcnVubmVyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBwcnVubmVyXCI7XG5cbmltcG9ydCAqIGFzIGVjcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjc1wiO1xuaW1wb3J0ICogYXMgZWNzcCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjcy1wYXR0ZXJuc1wiO1xuXG5pbXBvcnQgKiBhcyBjb2RlZGVwbG95IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZWRlcGxveVwiO1xuXG5pbXBvcnQgKiBhcyBlY3JfYXNzZXRzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWNyLWFzc2V0c1wiO1xuaW1wb3J0ICogYXMgZWNyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWNyXCI7XG5cbmltcG9ydCAqIGFzIHMzZGVwbG95IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudFwiO1xuXG5pbXBvcnQgKiBhcyBlbGIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyXCI7XG5cbi8qKlxuICogQVdTIFNpbXBsZSBOb3RpZmljYXRpb24gU2VydmljZSAtLSBXaGVuIHNvbWV0aGluZyBoYXBwZW5zIGxpa2UgYW4gb3JkZXIgaXMgcGxhY2VkLFxuICogYSBwYXltZW50IGlzIHByb2Nlc3NlZCwgb3IgYSB1c2VyIGFiYW5kb25zIHRoZWlyIGNhcnQsIHdlIHdhbnQgdG8gYmUgYWJsZSB0b1xuICogcHJvcGFnYXRlIHRoYXQgZXZlbnQgdGhyb3VnaG91dCBvdXIgYnVzaW5lc3MncyBpbmZyYXN0cnVjdHVyZSBzbyB0aGF0IHdlIGNhblxuICogcmVzcG9uZCBhY2NvcmRpbmdseTogdXBkYXRlIG91ciBEQiB3aGVuIGEgcGF5bWVudCBpcyBwcm9jZXNzZWQsIHNlbmQgYW4gZW1haWxcbiAqIHdoZW4gYSBzaGlwcGluZyBsYWJlbCBpcyBwcmludGVkLCBldGMuXG4gKi9cbmltcG9ydCAqIGFzIHNucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXNuc1wiO1xuLyoqXG4gKiBBV1MgUmVsYXRpb25hbCBEYXRhYmFzZSBTZXJ2aWNlIC0tIGxldHMgdXMgc3BlY2lmeSB0aGUgZXhhY3QgcmVsYXRpb25hbFxuICogZGF0YWJhc2UgdGVjaCBsYXRlciAod2UgdXNlIFBvc3RncmVzKVxuICovXG5pbXBvcnQgKiBhcyByZHMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1yZHNcIjtcbi8qKlxuICogQVdTIEVsYXN0aWMgQ29tcHV0ZSAyIChhcyBvcHBvc2VkIHRvIEVsYXN0aWMgQ29tcHV0ZSBDbGFzc2ljIHdoaWNoIGRpZG4ndCB1c2UgVlBDKVxuICogV2UgdXNlIGl0IGFzIG91ciB3ZWJzZXJ2ZXIgcnVubmluZyBvdXIgUmVtaXggYXBwLlxuICovXG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1lYzJcIjtcbi8qKlxuICogQVdTSWRlbnRpdHkgJiBBY2Nlc3MgTWFuYWdlbWVudFxuICogSW4gQVdTLCBldmVyeXRoaW5nIGlzIGRlbnkgYnkgZGVmYXVsdC4gU28gd2UgbmVlZCB0byBnaXZlIGV4cGxpY2l0IHBlcm1pc3Npb25zXG4gKiBmb3IgZXZlcnkgcmVzb3VyY2Ugd2UgZGVmaW5lIGhlcmUgKG91ciBWUEMsIEVDMiBJbnN0YW5jZSwgU05TIHRvcGljcywgZGIpIHRvXG4gKiByZWFkL3dyaXRlIGZyb20gZXZlcnkgb3RoZXIgcmVzb3VyY2UuIFVzZWZ1bCBmb3Igc2VjdXJpdHkgKGJlY2F1c2UgaXQgZ3JlYXRseVxuICogbG93ZXJzIGF0dGFjayBzdXJmYWNlKSBhbmQgYWxzbyBmb3IgbWFraW5nIGV4cGxpY2l0IHRoZSBkZXBlbmRlbmN5IGdyYXBoIGluXG4gKiBvdXIgaW5mcmFzdHJ1Y3R1cmUuXG4gKi9cbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuLyoqXG4gKiBBV1MgQW1hem9uIENlcnRpZmljYXRlIE1hbmFnZXIuXG4gKiBPdXIgV2Vic2VydmVyIG5lZWRzIHRvIHByZXNlbnQgYSBUTFMgY2VydGlmaWNhdGUgd2l0aCBldmVyeSByZXF1ZXN0IGZyb20gdXNlcnNcbiAqIG9uIHRoZSBpbnRlcm5ldCBzbyB0aGV5IGtub3cgdGhleSBjYW4gdHJ1c3QgdGhlIHdlYnNpdGUgaXMgd2hhdCBpdCBzYXlzIGl0IGlzLlxuICogSXQgdWx0aW1hdGVseSBjb21lcyBkb3duIHRvIHRydXN0aW5nIGEgY2VydGlmaWNhdGUgYXV0aG9yaXR5IChDQSkgd2hpY2ggc2lnbnNcbiAqIHRoZSBjZXJ0aWZpY2F0ZS4gQW1hem9uIGhhcyB0aGVpciBvd24gd2hpY2ggd2UgdXNlLCBidXQgb3RoZXJzIHR5cGljYWxseSB1c2VcbiAqIExldCdzIEVuY3J5cHQuXG4gKi9cbmltcG9ydCAqIGFzIGFjbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlclwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IFNlY3VyaXR5R3JvdXAgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0IHsgRmFyZ2F0ZVNlcnZpY2UgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjc1wiO1xuXG4vLyBpbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5cbmV4cG9ydCBjbGFzcyBQaW5lUGx1c0FwcGxlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdXAgYSBWUEMgZm9yIG91ciBzZXJ2aWNlcyBzbyB3ZSBjYW4gcGljayBhbmQgY2hvb3NlIHdoYXQgd2UgZXhwb3NlXG4gICAgICogdG8gdGhlIGludGVybmV0LlxuICAgICAqXG4gICAgICogT25seSBvdXIgRUMyIGluc3RhbmNlIG5lZWRzIHRvIGJlIGV4cG9zZWQgdG8gdGhlIGludGVybmV0LiBJdCdsbCBob3N0XG4gICAgICogdGhlIHJlbWl4IGFwcCB3aGljaCBoYXMgQVBJIGVuZHBvaW50cyB3aGljaCB3aWxsIHRoZW4gY2FsbFxuICAgICAqIGxhbWJkYXMvcG9zdGdyZXMvcHVibGlzaCBldmVudHMgdG8gU05TLCBldGMuXG4gICAgICpcbiAgICAgKiBGb3IgbW9yZSBhZHZhbmNlZCB1c2UgY2FzZXMgd2UgY2FuIHNldCB1cCBtb3JlIHN1Ym5ldHMgdG8gaXNvbGF0ZSByZWxhdGVkXG4gICAgICogc2VydmljZXMgZnJvbSBlYWNoIG90aGVyIGJ1dCBmb3Igbm93IHdlJ2xsIHN0aWNrIGV2ZXJ5dGhpbmcgdGhhdCBkb2Vzbid0XG4gICAgICogbmVlZCB0byBiZSBleHBvc2VkIHRvIHRoZSBpbnRlcm5ldCB0byB0aGUgc2FtZSBgUFJJVkFURV9JU09MQVRFRGAgc3VibmV0LlxuICAgICAqL1xuICAgIGNvbnN0IFZpcnR1YWxQcml2YXRlQ2xvdWQgPSBuZXcgZWMyLlZwYyh0aGlzLCBcIlBwYVZwY1wiLCB7XG4gICAgICAvKipcbiAgICAgICAqIE5BVCBHYXRld2F5cyBhcmUgcHJvaGliaXR2ZWx5IGV4cGVuc2l2ZSBhbmQgYXJlIG1lYW50IGZvciBjb21tdW5pY2F0aW9uXG4gICAgICAgKiBiZXR3ZWVuIGludGVybmFsIHN1Ym5ldHMgYW5kIG90aGVyIFZQQ3Mgb3IgZXh0ZXJuYWwgc2VydmljZXMsIHdoaWNoXG4gICAgICAgKiB3ZSBkb24ndCBuZWVkLlxuICAgICAgICovXG4gICAgICBuYXRHYXRld2F5czogMCxcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwicHBhLXB1YmxpYy1zdWJuZXQtZm9yLWluZ3Jlc3NcIixcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJwcGEtaXNvbGF0ZWQtc3VibmV0LWZvci1pbnRlcm5hbC1zZXJ2aWNlc1wiLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfSVNPTEFURUQsXG4gICAgICAgICAgY2lkck1hc2s6IDI4LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFdoZW4gd2UgY3JlYXRlIHRoZSBGYXJnYXRlIGNsdXN0ZXIgdG8gcnVuIG91ciB3ZWIgc2VydmVyLCB3ZSBuZWVkIHRvIHByb3ZpZGVcbiAgICAgKiBpdCBhIGRvY2tlciBmaWxlLiBUaGUgZG9ja2VyIGZpbGUgd2lsbCBpbnN0YWxsIGFsbCB0aGUgbmVjZXNzYXJ5IHNvZnR3YXJlXG4gICAgICogbGlrZSBub2RlLCB0aGUgcHJpc21hIENMSSwgbnBtLCBldGMuXG4gICAgICovXG4gICAgY29uc3QgV2ViU2VydmVyRG9ja2VySW1hZ2UgPSBuZXcgZWNyX2Fzc2V0cy5Eb2NrZXJJbWFnZUFzc2V0KFxuICAgICAgdGhpcyxcbiAgICAgIFwiUGluZVBsdXNBcHBsZVdlYlNlcnZlckRvY2tlckltYWdlXCIsXG4gICAgICB7XG4gICAgICAgIGRpcmVjdG9yeTogcGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi93d3dcIiksXG4gICAgICAgIG5ldHdvcmtNb2RlOiBlY3JfYXNzZXRzLk5ldHdvcmtNb2RlLkhPU1QsXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8qKlxuICAgICAqIFNldCB1cCBhIGNvbnRhaW5lciByZWdpc3RyeSB0byBob3N0IHRoZSBjb2RlIGZvciBvdXIgUmVtaXggYXBwLiBXaGVuIHdlIHB1c2hcbiAgICAgKiB0byB0aGUgbWFpbiBvciBkZXYgYnJhbmNoIG9uIEdpdEh1YiwgYW4gYWN0aW9uIHdpbGwgdHJpZ2dlciB0byBydW5cbiAgICAgKiBsaW50ZXJzLCB0ZXN0cywgdHlwZWNoZWNrcywgYW5kIGJ1aWxkIHRoZSBhcHAgKGJvdGggdGhlIGNsaWVudCBhbmQgc2VydmVyXG4gICAgICogYnVuZGxlcyBpbmNsdWRpbmcgYWxsIHN0YXRpYyBhc3NldHMsIGNsaWVudC1zaWRlIEpTIGNvZGUsIGFuZCBpbmRleC5odG1sIGZpbGUpLlxuICAgICAqXG4gICAgICogQWZ0ZXIgdGhlIGNoZWNrcyBhbmQgYnVpbGQgaGF2ZSBwYXNzZWQuIFRoZSBHaXRIdWIgYWN0aW9uIHdpbGwgdGhlbiBydW4gdGhlXG4gICAgICogc3RlcHMgaW4gdGhlIERvY2tlcmZpbGUgYXQgL3d3dy9Eb2NrZXJmaWxlIHRvIGdlbmVyYXRlIGFuIGltYWdlIHdpdGggYVxuICAgICAqIHNwZWNpZmljIHZlcnNpb24gb2YgTm9kZSBpbnN0YWxsZWQgYW5kIHRoZSBidW5kbGVkIHNvdXJjZSBjb2RlLlxuICAgICAqXG4gICAgICogRm9yIGEgcmVtaXggYXBwIHNwZWNpZmljYWxseSwgaXQgd2lsbCBzZXJ2ZSBhc3NldHMgZnJvbSB0aGUgL3B1YmxpYy9idWlsZFxuICAgICAqIGZvbGRlciBhbmQgdGhlIHNlcnZlci1zaWRlIGNvZGUgd2lsbCBiZSBpbiB0aGUgL2J1aWxkIGZvbGRlciAodW5kZXIgdGhlXG4gICAgICogd3d3LyBkaXJlY3RvcnkgaW4gdGhpcyByZXBvLilcbiAgICAgKlxuICAgICAqIFRvIGtlZXAgdGhpbmdzIHNlY3VyZSB3ZSdsbCBoYXZlIHRvIHByb3ZpZGUgZXhwbGljaXQgcGVybWlzc2lvbiB0byB0aGVcbiAgICAgKiBHaXRIdWIgYWN0aW9uIHJ1bm5pbmcgdW5kZXIgdGhlIEdpdEh1YiByZXBvIHdlIHB1c2ggdG8gdG8gcHVzaCB0byB0aGlzIEVDUlxuICAgICAqIHJlcG8uXG4gICAgICovXG4gICAgY29uc3QgV2Vic2l0ZUNvbnRhaW5lclJlZ2lzdHJ5ID0gbmV3IGVjci5SZXBvc2l0b3J5KFxuICAgICAgdGhpcyxcbiAgICAgIFwiUHBhV2Vic2l0ZUNvbnRhaW5lclJlZ2lzdHJ5XCIsXG4gICAgICB7XG4gICAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGcm9tIHRoZSBkb2NzOiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vY2RrL2FwaS92Mi9kb2NzL2F3cy1jZGstbGliLmF3c19lY3ItcmVhZG1lLmh0bWwjYXV0aG9yaXphdGlvbi10b2tlblxuICAgICAgICAgKlxuICAgICAgICAgKiBcIkFtYXpvbiBFQ1IgaW1hZ2Ugc2Nhbm5pbmcgaGVscHMgaW4gaWRlbnRpZnlpbmcgc29mdHdhcmUgdnVsbmVyYWJpbGl0aWVzXG4gICAgICAgICAqIGluIHlvdXIgY29udGFpbmVyIGltYWdlcy4gWW91IGNhbiBtYW51YWxseSBzY2FuIGNvbnRhaW5lciBpbWFnZXMgc3RvcmVkXG4gICAgICAgICAqIGluIEFtYXpvbiBFQ1IsIG9yIHlvdSBjYW4gY29uZmlndXJlIHlvdXIgcmVwb3NpdG9yaWVzIHRvIHNjYW4gaW1hZ2VzXG4gICAgICAgICAqIHdoZW4geW91IHB1c2ggdGhlbSB0byBhIHJlcG9zaXRvcnkuIFRvIGNyZWF0ZSBhIG5ldyByZXBvc2l0b3J5IHRvIHNjYW5cbiAgICAgICAgICogb24gcHVzaCwgc2ltcGx5IGVuYWJsZSBpbWFnZVNjYW5PblB1c2hcIi5cbiAgICAgICAgICpcbiAgICAgICAgICogVE9ETzogaW4gdGhlIGZ1dHVyZSB5b3UgY2FuIGFkZCBhIGhhbmRsZXIgZm9yIHRoZSBgb25JbWFnZVNjYW5Db21wbGV0ZWRgXG4gICAgICAgICAqIGV2ZW50IHRvIG5vdGlmeSB5b3UgaW4gc29tZSB3YXk6IGVpdGhlciB0aHJvdWdoIGEgU2xhY2svR2l0SHViL0ppcmEvRW1haWxcbiAgICAgICAgICogaW50ZWdyYXRpb24gb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgICovXG4gICAgICAgIGltYWdlU2Nhbk9uUHVzaDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgRWxhc3RpY0NvbnRhaW5lckZvclNlcnZpY2VzID0gbmV3IGVjcy5DbHVzdGVyKHRoaXMsIFwiUHBhRWNzQ2x1c3RlclwiLCB7XG4gICAgICB2cGM6IFZpcnR1YWxQcml2YXRlQ2xvdWQsXG4gICAgICBjb250YWluZXJJbnNpZ2h0czogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IExvYWRCYWxhbmNlclNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAoXG4gICAgICB0aGlzLFxuICAgICAgXCJQcGFMb2FkQmFsYW5jZXJTZWN1cml0eUdyb3VwXCIsXG4gICAgICB7XG4gICAgICAgIHZwYzogVmlydHVhbFByaXZhdGVDbG91ZCxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgV2Vic2l0ZUxvYWRCYWxhbmNlciA9IG5ldyBlbGIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIoXG4gICAgICB0aGlzLFxuICAgICAgXCJQcGFXZWJzaXRlTG9hZEJhbGFuY2VyXCIsXG4gICAgICB7XG4gICAgICAgIHZwYzogVmlydHVhbFByaXZhdGVDbG91ZCxcbiAgICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsIC8vIFRoaXMgaXMgZm9yIHRoZSB3ZWJzaXRlIHNvIGl0IG5lZWRzIHRvIGJlIGludGVybmV0IGZhY2luZy5cbiAgICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgc2VjdXJpdHlHcm91cDogTG9hZEJhbGFuY2VyU2VjdXJpdHlHcm91cCxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgSHR0cFRyYWZmaWNMaXN0ZW5lciA9IFdlYnNpdGVMb2FkQmFsYW5jZXIuYWRkTGlzdGVuZXIoXG4gICAgICBcIlBwYVdlYnNpdGVIdHRwVHJhZmZpY0xpc3RlbmVyXCIsXG4gICAgICB7XG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yIHJlcXVlc3RzIG1hZGUgb3ZlciByZWd1bGFyIEhUVFAsIHdlJ2xsIHJlZGlyZWN0IHRoZW0gdG8gSFRUUFMuXG4gICAgICAgICAqIFRoaXMgZXNzZW50aWFsbHkgZm9yY2VzIGFsbCB0cmFmZmljIHRvIGJlIEhUVFBTIGV4Y2VwdCBmb3IgdGhlIGluaXRpYWxcbiAgICAgICAgICogcmVxdWVzdCBmb3IgdGhlIFRMUyBjZXJ0aWZpY2F0ZS4gV2UgY2FuLCBsYXRlciBvbiwgZXZlbiBzZWN1cmUgdGhhdFxuICAgICAgICAgKiByZXF1ZXN0IGZvciBzb21lIGJyb3dzZXJzIGJ5IGFkZGluZyB0aGlzIHdlYnNpdGUgdG8gdGhlIEhTVFMgcHJlbG9hZFxuICAgICAgICAgKiBsaXN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZGVmYXVsdEFjdGlvbjogZWxiLkxpc3RlbmVyQWN0aW9uLnJlZGlyZWN0KHtcbiAgICAgICAgICBwb3J0OiBcIjQ0M1wiLFxuICAgICAgICAgIHByb3RvY29sOiBlbGIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQUyxcbiAgICAgICAgfSksXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IEh0dHBzVHJhZmZpY0xpc3RlbmVyID0gV2Vic2l0ZUxvYWRCYWxhbmNlci5hZGRMaXN0ZW5lcihcbiAgICAgIFwiUHBhV2Vic2l0ZVNlY3VyZUh0dHBzVHJhZmZpY0xpc3RlbmVyXCIsXG4gICAgICB7XG4gICAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgcHJvdG9jb2w6IGVsYi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFBTLFxuICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICBzc2xQb2xpY3k6IGVsYi5Tc2xQb2xpY3kuUkVDT01NRU5ERUQsXG4gICAgICAgIGNlcnRpZmljYXRlczogW1xuICAgICAgICAgIGFjbS5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4oXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgXCJQcGFXZWJzaXRlVGxzQ2VydGlmaWNhdGVcIixcbiAgICAgICAgICAgIFwiYXJuOmF3czphY206dXMtd2VzdC0yOjQwOTQ2NTcyNTkyMDpjZXJ0aWZpY2F0ZS9jZjY5NjE0OS1hNmYwLTQ1OTctYjVjOC02MmM2NThhYzFlYzhcIlxuICAgICAgICAgICksXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IEh0dHBUYXJnZXRHcm91cCA9IEh0dHBzVHJhZmZpY0xpc3RlbmVyLmFkZFRhcmdldHMoXG4gICAgICBcIlBwYVdlYnNpdGVUY3BMaXN0ZW5lclRhcmdldFwiLFxuICAgICAge1xuICAgICAgICBwcm90b2NvbDogZWxiLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICAgICAgcHJvdG9jb2xWZXJzaW9uOiBlbGIuQXBwbGljYXRpb25Qcm90b2NvbFZlcnNpb24uSFRUUDEsXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IHRhc2tEZWZpbml0aW9uID0gbmV3IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24oXG4gICAgICB0aGlzLFxuICAgICAgXCJwcGEtZmFyZ2F0ZS10YXNrLWRlZmluaXRpb25cIixcbiAgICAgIHtcbiAgICAgICAgcnVudGltZVBsYXRmb3JtOiB7XG4gICAgICAgICAgY3B1QXJjaGl0ZWN0dXJlOiBlY3MuQ3B1QXJjaGl0ZWN0dXJlLkFSTTY0LFxuICAgICAgICAgIG9wZXJhdGluZ1N5c3RlbUZhbWlseTogZWNzLk9wZXJhdGluZ1N5c3RlbUZhbWlseS5MSU5VWCxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gdGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKFwid2ViLXNlcnZlclwiLCB7XG4gICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21FY3JSZXBvc2l0b3J5KFdlYnNpdGVDb250YWluZXJSZWdpc3RyeSksXG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHtcbiAgICAgIGNvbnRhaW5lclBvcnQ6IDgwODEsXG4gICAgfSk7XG5cbiAgICBjb25zdCBGYXJnYXRlU2VydmljZVNlY3VyaXR5R3JvdXAgPSBuZXcgU2VjdXJpdHlHcm91cChcbiAgICAgIHRoaXMsXG4gICAgICBcInBwYS1mYXJnYXRlLXNlcnZpY2Utc2VjdXJpdHktZ3JvdXAtZm9yLWh0dHAtdHJhZmZpY1wiLFxuICAgICAge1xuICAgICAgICB2cGM6IFZpcnR1YWxQcml2YXRlQ2xvdWQsXG4gICAgICB9XG4gICAgKTtcblxuICAgIEZhcmdhdGVTZXJ2aWNlU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGVjMi5QZWVyLnNlY3VyaXR5R3JvdXBJZChMb2FkQmFsYW5jZXJTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCksXG4gICAgICBlYzIuUG9ydC50Y3AoODApLFxuICAgICAgXCJBbGxvdyBpbmJvdW5kIGNvbm5lY3Rpb25zIGZyb20gdGhlIEFwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXJcIlxuICAgICk7XG5cbiAgICBjb25zdCBXZWJzaXRlRmFyZ2F0ZVNlcnZpY2UgPSBuZXcgRmFyZ2F0ZVNlcnZpY2UoXG4gICAgICB0aGlzLFxuICAgICAgXCJQcGFXZWJzaXRlRmFyZ2F0ZVNlcnZpY2VcIixcbiAgICAgIHtcbiAgICAgICAgY2x1c3RlcjogRWxhc3RpY0NvbnRhaW5lckZvclNlcnZpY2VzLFxuICAgICAgICBhc3NpZ25QdWJsaWNJcDogZmFsc2UsXG4gICAgICAgIHRhc2tEZWZpbml0aW9uLFxuICAgICAgICBzZWN1cml0eUdyb3VwczogW0ZhcmdhdGVTZXJ2aWNlU2VjdXJpdHlHcm91cF0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIEh0dHBUYXJnZXRHcm91cC5hZGRUYXJnZXQoV2Vic2l0ZUZhcmdhdGVTZXJ2aWNlKTtcblxuICAgIC8qKlxuICAgICAqIEZyb20gdGhlIGRvY3VtZW50YXRpb246XG4gICAgICpcbiAgICAgKiBcIlRoZSBhd3MtYWN0aW9ucy9jb25maWd1cmUtYXdzLWNyZWRlbnRpYWxzIGFjdGlvbiByZWNlaXZlcyBhIEpXVCBmcm9tIHRoZVxuICAgICAqIEdpdEh1YiBPSURDIHByb3ZpZGVyLCBhbmQgdGhlbiByZXF1ZXN0cyBhbiBhY2Nlc3MgdG9rZW4gZnJvbSBBV1MuXCJcbiAgICAgKlxuICAgICAqIERvY3VtZW50YXRpb24gbGluazogaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vYWN0aW9ucy9kZXBsb3ltZW50L3NlY3VyaXR5LWhhcmRlbmluZy15b3VyLWRlcGxveW1lbnRzL2NvbmZpZ3VyaW5nLW9wZW5pZC1jb25uZWN0LWluLWFtYXpvbi13ZWItc2VydmljZXMjcmVxdWVzdGluZy10aGUtYWNjZXNzLXRva2VuXG4gICAgICovXG4gICAgY29uc3QgR2l0aHViQWN0aW9uc0NvZGVEZXBsb3lPaWRjUHJvdmlkZXIgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlcihcbiAgICAgIHRoaXMsXG4gICAgICBcIkdpdGh1YkFjdGlvbnNPaWRjUHJvdmlkZXJcIixcbiAgICAgIHtcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly90b2tlbi5hY3Rpb25zLmdpdGh1YnVzZXJjb250ZW50LmNvbWAsXG4gICAgICAgIGNsaWVudElkczogW1wic3RzLmFtYXpvbmF3cy5jb21cIl0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8qKlxuICAgICAqIFdlIG5lZWQgR0ggdG8gYmUgYWJsZSB0byBkbyB0aGUgZm9sbG93aW5nOlxuICAgICAqXG4gICAgICogMS4gVXBsb2FkIGEgZ2VuZXJhdGVkIGltYWdlIHRvIHRoZSBFQ1IgcmVwbyB3ZSBzZXQgdXAgYWJvdmUuXG4gICAgICogMi4gRGVwbG95IHRoZVxuICAgICAqL1xuICAgIGNvbnN0IEdpdEh1YkFjdGlvbnNDb2RlRGVwbG95SWFtUm9sZSA9IG5ldyBpYW0uUm9sZShcbiAgICAgIHRoaXMsXG4gICAgICBcIkdpdEh1YkFjdGlvbnNDb2RlRGVwbG95SWFtUm9sZVwiLFxuICAgICAge1xuICAgICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uV2ViSWRlbnRpdHlQcmluY2lwYWwoXG4gICAgICAgICAgR2l0aHViQWN0aW9uc0NvZGVEZXBsb3lPaWRjUHJvdmlkZXIub3BlbklkQ29ubmVjdFByb3ZpZGVyQXJuXG4gICAgICAgICksXG4gICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcbiAgICAgICAgICAgIFwiQVdTQ29kZURlcGxveURlcGxveWVyQWNjZXNzXCJcbiAgICAgICAgICApLFxuICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcbiAgICAgICAgICAgIFwiQW1hem9uU1NNTWFuYWdlZEluc3RhbmNlQ29yZVwiXG4gICAgICAgICAgKSxcbiAgICAgICAgXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLyoqXG4gICAgICogV2UgcHVsbCB0aGUgYGJpdG5hbWkvbm9kZToxOGAgaW1hZ2UgZnJvbSB0aGUgcHVibGljIEFtYXpvbiBjb250YWluZXJcbiAgICAgKiByZWdpc3RyeSBzbyB3ZSBzaG91bGQgZW5zdXJlIHRoZSBJQU0gcm9sZSB0aGUgR2l0SHViIGFjdGlvbiBpcyBhc3N1bWluZ1xuICAgICAqIGhhcyBwZXJtaXNzaW9uIHRvIHB1bGwgZnJvbSBpdC5cbiAgICAgKi9cbiAgICBlY3IuUHVibGljR2FsbGVyeUF1dGhvcml6YXRpb25Ub2tlbi5ncmFudFJlYWQoXG4gICAgICBHaXRIdWJBY3Rpb25zQ29kZURlcGxveUlhbVJvbGVcbiAgICApO1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGUgSUFNIHJvbGUgdGhlIEdpdEh1YiBhY3Rpb24gaXMgYXNzdW1pbmcgaGFzIHBlcm1pc3Npb24gdG9cbiAgICAgKiBwdXNoIHRvIG91ciBFQ1IgcmVwby5cbiAgICAgKi9cbiAgICAvLyBXZWJzaXRlQ29udGFpbmVyUmVnaXN0cnkuZ3JhbnRQdWxsUHVzaChHaXRIdWJBY3Rpb25zQ29kZURlcGxveUlhbVJvbGUpO1xuXG4gICAgLy8gY29uc3QgV2Vic2l0ZUZhcmdhdGVTZXJ2aWNlID1cbiAgICAvLyAgIG5ldyBlY3NwLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VkRmFyZ2F0ZVNlcnZpY2UoXG4gICAgLy8gICAgIHRoaXMsXG4gICAgLy8gICAgIFwiUGluZVBsdXNBcHBsZVdlYnNpdGVcIixcbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgIHRhc2tJbWFnZU9wdGlvbnM6IHtcbiAgICAvLyAgICAgICAgIGltYWdlOlxuICAgIC8vICAgICAgICAgICBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbURvY2tlckltYWdlQXNzZXQoV2ViU2VydmVyRG9ja2VySW1hZ2UpLFxuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAgdnBjOiBWaXJ0dWFsUHJpdmF0ZUNsb3VkLFxuICAgIC8vICAgICAgIGNlcnRpZmljYXRlOiBXZWJzaXRlVGxzQ2VydGlmaWNhdGUsXG4gICAgLy8gICAgIH1cbiAgICAvLyAgICk7XG5cbiAgICBjb25zdCBkYkNyZWRlbnRpYWxzU2VjcmV0TmFtZSA9IFwicHBhLWxsYy1wcm9kLXBvc3RncmVzLWNyZWRlbnRpYWxzXCI7XG5cbiAgICBjb25zdCBEYXRhYmFzZUNyZWRlbnRpYWxzID0gcmRzLkNyZWRlbnRpYWxzLmZyb21HZW5lcmF0ZWRTZWNyZXQoXG4gICAgICBcInBvc3RncmVzXCIsXG4gICAgICB7XG4gICAgICAgIHNlY3JldE5hbWU6IGRiQ3JlZGVudGlhbHNTZWNyZXROYW1lLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBEYXRhYmFzZUluc3RhbmNlID0gbmV3IHJkcy5EYXRhYmFzZUluc3RhbmNlKHRoaXMsIFwicHBhLWRiLXByb2RcIiwge1xuICAgICAgdnBjOiBWaXJ0dWFsUHJpdmF0ZUNsb3VkLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX0lTT0xBVEVELFxuICAgICAgfSxcbiAgICAgIGVuZ2luZTogcmRzLkRhdGFiYXNlSW5zdGFuY2VFbmdpbmUucG9zdGdyZXMoe1xuICAgICAgICB2ZXJzaW9uOiByZHMuUG9zdGdyZXNFbmdpbmVWZXJzaW9uLlZFUl8xNF80LFxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZVR5cGU6IGVjMi5JbnN0YW5jZVR5cGUub2YoXG4gICAgICAgIGVjMi5JbnN0YW5jZUNsYXNzLkJVUlNUQUJMRTMsXG4gICAgICAgIGVjMi5JbnN0YW5jZVNpemUuTUlDUk9cbiAgICAgICksXG4gICAgICBjcmVkZW50aWFsczogRGF0YWJhc2VDcmVkZW50aWFscyxcbiAgICAgIG11bHRpQXo6IGZhbHNlLFxuICAgICAgYWxsb2NhdGVkU3RvcmFnZTogMTAwLFxuICAgICAgbWF4QWxsb2NhdGVkU3RvcmFnZTogMTA1LFxuICAgICAgYWxsb3dNYWpvclZlcnNpb25VcGdyYWRlOiBmYWxzZSxcbiAgICAgIGF1dG9NaW5vclZlcnNpb25VcGdyYWRlOiB0cnVlLFxuICAgICAgYmFja3VwUmV0ZW50aW9uOiBjZGsuRHVyYXRpb24uZGF5cygxKSxcbiAgICAgIGRlbGV0ZUF1dG9tYXRlZEJhY2t1cHM6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgZGVsZXRpb25Qcm90ZWN0aW9uOiBmYWxzZSxcbiAgICAgIC8vIENvbnN0cmFpbnRzOiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQVdTQ2xvdWRGb3JtYXRpb24vbGF0ZXN0L1VzZXJHdWlkZS9hd3MtcmVzb3VyY2UtcmRzLWRiaW5zdGFuY2UuaHRtbCNjZm4tcmRzLWRiaW5zdGFuY2UtZGJuYW1lXG4gICAgICBkYXRhYmFzZU5hbWU6IFwicHBhX2RiX3Byb2RcIixcbiAgICAgIHB1YmxpY2x5QWNjZXNzaWJsZTogZmFsc2UsXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb25seSB0aGluZyBjb25uZWN0aW5nIHRvIG91ciBEQiBzaG91bGQgYmUgb3VyIGNvbXB1dGUgaW5zdGFuY2UuXG4gICAgICogVGhleSdyZSBvbiB0aGUgc2FtZSBWUEMsIGJ1dCB0aGUgRUMyIGlzIGV4cG9zZWQgcHVibGljbHkgc2luY2UgaXQgaGFzXG4gICAgICogdG8gaG9zdCBvdXIgYXBwIGFuZCBzZXJ2ZSBwdWJsaWMgdHJhZmZpYy5cbiAgICAgKi9cbiAgICBEYXRhYmFzZUluc3RhbmNlLmNvbm5lY3Rpb25zLmFsbG93RnJvbShcbiAgICAgIGVjMi5QZWVyLnNlY3VyaXR5R3JvdXBJZChMb2FkQmFsYW5jZXJTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCksXG4gICAgICBlYzIuUG9ydC50Y3AoNTQzMilcbiAgICApO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJwcGFfZGJfZW5kcG9pbnRcIiwge1xuICAgICAgdmFsdWU6IERhdGFiYXNlSW5zdGFuY2UuaW5zdGFuY2VFbmRwb2ludC5ob3N0bmFtZSxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwicHBhX2RiX2NyZWRlbnRpYWxzXCIsIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0ZWQtb3B0aW9uYWwtY2hhaW5cbiAgICAgIHZhbHVlOiBkYkNyZWRlbnRpYWxzU2VjcmV0TmFtZSxcbiAgICB9KTtcblxuICAgIC8vIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgXCJQcm9kdWN0SW1hZ2VzXCIsIHtcbiAgICAvLyAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAvLyB9KTtcblxuICAgIC8vIGNvbnN0IE9yZGVyUmVjZWl2ZWRFbWFpbExhbWJkYSA9IG5ldyBjZGsuYXdzX2xhbWJkYS5GdW5jdGlvbihcbiAgICAvLyAgIHRoaXMsXG4gICAgLy8gICBcIk9yZGVyUmVjZWl2ZWRFbWFpbExhbWJkYVwiLFxuICAgIC8vICAge1xuICAgIC8vICAgICBydW50aW1lOiBjZGsuYXdzX2xhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgIC8vICAgICBoYW5kbGVyOiBcImluZGV4Lm9yZGVyX3JlY2VpdmVkX2VtYWlsZXJfbGFtYmRhXCIsXG4gICAgLy8gICAgIGNvZGU6IGNkay5hd3NfbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiKSksXG4gICAgLy8gICB9XG4gICAgLy8gKTtcblxuICAgIC8vIE9yZGVyUmVjZWl2ZWRFbWFpbExhbWJkYS5hZGRUb1JvbGVQb2xpY3koXG4gICAgLy8gICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgLy8gICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAvLyAgICAgYWN0aW9uczogW1xuICAgIC8vICAgICAgIFwic2VzOlNlbmRFbWFpbFwiLFxuICAgIC8vICAgICAgIFwic2VzOlNlbmRSYXdFbWFpbFwiLFxuICAgIC8vICAgICAgIFwic2VzOlNlbmRUZW1wbGF0ZWRFbWFpbFwiLFxuICAgIC8vICAgICBdLFxuICAgIC8vICAgICByZXNvdXJjZXM6IFtcbiAgICAvLyAgICAgICBgYXJuOmF3czpzZXM6JHtwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT059OiR7XG4gICAgLy8gICAgICAgICBjZGsuU3RhY2sub2YodGhpcykuYWNjb3VudFxuICAgIC8vICAgICAgIH06aWRlbnRpdHkvJHtwcm9jZXNzLmVudi5TRVNfRU1BSUxfRlJPTX1gLFxuICAgIC8vICAgICBdLFxuICAgIC8vICAgfSlcbiAgICAvLyApO1xuXG4gICAgLy8gY29uc3QgT3JkZXJSZWNlaXZlZDtcblxuICAgIC8vIFRoZSBjb2RlIHRoYXQgZGVmaW5lcyB5b3VyIHN0YWNrIGdvZXMgaGVyZVxuXG4gICAgLy8gZXhhbXBsZSByZXNvdXJjZVxuICAgIC8vIGNvbnN0IHF1ZXVlID0gbmV3IHNxcy5RdWV1ZSh0aGlzLCAnU2VydmljZXNRdWV1ZScsIHtcbiAgICAvLyAgIHZpc2liaWxpdHlUaW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMDApXG4gICAgLy8gfSk7XG4gIH1cbn1cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxubmV3IFBpbmVQbHVzQXBwbGVTdGFjayhhcHAsIFwiUGluZVBsdXNBcHBsZUJ1c2luZXNzU3RhY2tcIik7XG5cbmFwcC5zeW50aCgpO1xuIl19