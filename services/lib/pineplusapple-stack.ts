import * as cdk from "aws-cdk-lib";
/**
 * AWS Simple Storage Service - we store PDFs of customer invoices, PDFs of
 * shipping labels, and images of products.
 */
import * as s3 from "aws-cdk-lib/aws-s3";

import * as apprunner from "aws-cdk-lib/aws-apprunner";

import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsp from "aws-cdk-lib/aws-ecs-patterns";

import * as codedeploy from "aws-cdk-lib/aws-codedeploy";

import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as ecr from "aws-cdk-lib/aws-ecr";

import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";

/**
 * AWS Simple Notification Service -- When something happens like an order is placed,
 * a payment is processed, or a user abandons their cart, we want to be able to
 * propagate that event throughout our business's infrastructure so that we can
 * respond accordingly: update our DB when a payment is processed, send an email
 * when a shipping label is printed, etc.
 */
import * as sns from "aws-cdk-lib/aws-sns";
/**
 * AWS Relational Database Service -- lets us specify the exact relational
 * database tech later (we use Postgres)
 */
import * as rds from "aws-cdk-lib/aws-rds";
/**
 * AWS Elastic Compute 2 (as opposed to Elastic Compute Classic which didn't use VPC)
 * We use it as our webserver running our Remix app.
 */
import * as ec2 from "aws-cdk-lib/aws-ec2";
/**
 * AWSIdentity & Access Management
 * In AWS, everything is deny by default. So we need to give explicit permissions
 * for every resource we define here (our VPC, EC2 Instance, SNS topics, db) to
 * read/write from every other resource. Useful for security (because it greatly
 * lowers attack surface) and also for making explicit the dependency graph in
 * our infrastructure.
 */
import * as iam from "aws-cdk-lib/aws-iam";
/**
 * AWS Amazon Certificate Manager.
 * Our Webserver needs to present a TLS certificate with every request from users
 * on the internet so they know they can trust the website is what it says it is.
 * It ultimately comes down to trusting a certificate authority (CA) which signs
 * the certificate. Amazon has their own which we use, but others typically use
 * Let's Encrypt.
 */
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import * as path from "path";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { FargateService } from "aws-cdk-lib/aws-ecs";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PinePlusAppleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
    const WebServerDockerImage = new ecr_assets.DockerImageAsset(
      this,
      "PinePlusAppleWebServerDockerImage",
      {
        directory: path.join(__dirname, "../../www"),
        networkMode: ecr_assets.NetworkMode.HOST,
      }
    );

    const WebsiteTlsCertificate = new acm.Certificate(
      this,
      "PinePlusAppleWebsiteCertificate",
      {
        domainName: "*.pineplusapple.com",
        validation: acm.CertificateValidation.fromDns(),
      }
    );

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
    const WebsiteContainerRegistry = new ecr.Repository(
      this,
      "PpaWebsiteContainerRegistry",
      {
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
      }
    );

    const ElasticContainerForServices = new ecs.Cluster(this, "PpaEcsCluster", {
      vpc: VirtualPrivateCloud,
      containerInsights: true,
    });

    const LoadBalancerSecurityGroup = new ec2.SecurityGroup(
      this,
      "PpaLoadBalancerSecurityGroup",
      {
        vpc: VirtualPrivateCloud,
      }
    );

    const WebsiteLoadBalancer = new elb.ApplicationLoadBalancer(
      this,
      "PpaWebsiteLoadBalancer",
      {
        vpc: VirtualPrivateCloud,
        internetFacing: true, // This is for the website so it needs to be internet facing.
        deletionProtection: false,
        securityGroup: LoadBalancerSecurityGroup,
      }
    );

    const HttpTrafficListener = WebsiteLoadBalancer.addListener(
      "PpaWebsiteHttpTrafficListener",
      {
        port: 80,
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
      }
    );

    const HttpsTrafficListener = WebsiteLoadBalancer.addListener(
      "PpaWebsiteSecureHttpsTrafficListener",
      {
        port: 4413,
        sslPolicy: elb.SslPolicy.RECOMMENDED,
        certificates: [WebsiteTlsCertificate],
      }
    );

    const HttpTargetGroup = HttpTrafficListener.addTargets(
      "PpaWebsiteTcpListenerTarget",
      {
        protocol: elb.ApplicationProtocol.HTTP,
        protocolVersion: elb.ApplicationProtocolVersion.HTTP1,
      }
    );

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "ppa-fargate-task-definition",
      {
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.ARM64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        },
      }
    );

    const container = taskDefinition.addContainer("web-server", {
      image: ecs.ContainerImage.fromEcrRepository(WebsiteContainerRegistry),
    });

    container.addPortMappings({
      containerPort: 8081,
    });

    const FargateServiceSecurityGroup = new SecurityGroup(
      this,
      "ppa-fargate-service-security-group-for-http-traffic",
      {
        vpc: VirtualPrivateCloud,
      }
    );

    FargateServiceSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(LoadBalancerSecurityGroup.securityGroupId),
      ec2.Port.tcp(80),
      "Allow inbound connections from the Application Load Balancer"
    );

    const WebsiteFargateService = new FargateService(
      this,
      "WebsiteFargateService",
      {
        cluster: ElasticContainerForServices,
        assignPublicIp: false,
        taskDefinition,
        securityGroups: [FargateServiceSecurityGroup],
      }
    );

    HttpTargetGroup.addTarget(WebsiteFargateService);

    /**
     * From the documentation:
     *
     * "The aws-actions/configure-aws-credentials action receives a JWT from the
     * GitHub OIDC provider, and then requests an access token from AWS."
     *
     * Documentation link: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#requesting-the-access-token
     */
    const GithubActionsCodeDeployOidcProvider = new iam.OpenIdConnectProvider(
      this,
      "GithubActionsOidcProvider",
      {
        url: `https://token.actions.githubusercontent.com`,
        clientIds: ["sts.amazonaws.com"],
      }
    );

    /**
     * We need GH to be able to do the following:
     *
     * 1. Upload a generated image to the ECR repo we set up above.
     * 2. Deploy the
     */
    const GitHubActionsCodeDeployIamRole = new iam.Role(
      this,
      "GitHubActionsCodeDeployIamRole",
      {
        assumedBy: new iam.WebIdentityPrincipal(
          GithubActionsCodeDeployOidcProvider.openIdConnectProviderArn
        ),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AWSCodeDeployDeployerAccess"
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore"
          ),
        ],
      }
    );

    /**
     * We pull the `bitnami/node:18` image from the public Amazon container
     * registry so we should ensure the IAM role the GitHub action is assuming
     * has permission to pull from it.
     */
    ecr.PublicGalleryAuthorizationToken.grantRead(
      GitHubActionsCodeDeployIamRole
    );
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

    const DatabaseCredentials = rds.Credentials.fromGeneratedSecret(
      "postgres",
      {
        secretName: dbCredentialsSecretName,
      }
    );

    const DatabaseInstance = new rds.DatabaseInstance(this, "ppa-db-prod", {
      vpc: VirtualPrivateCloud,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
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
    DatabaseInstance.connections.allowFrom(
      ec2.Peer.securityGroupId(LoadBalancerSecurityGroup.securityGroupId),
      ec2.Port.tcp(5432)
    );

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

const app = new cdk.App();

new PinePlusAppleStack(app, "PinePlusAppleBusinessStack");

app.synth();
