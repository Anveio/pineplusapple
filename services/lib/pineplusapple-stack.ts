import * as cdk from "aws-cdk-lib";
/**
 * AWS Simple Storage Service - we store PDFs of customer invoices, PDFs of
 * shipping labels, and images of products.
 */
import * as s3 from "aws-cdk-lib/aws-s3";

import * as apprunner from "aws-cdk-lib/aws-ecs";

import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsp from "aws-cdk-lib/aws-ecs-patterns";

import * as codedeploy from "aws-cdk-lib/aws-codedeploy";

import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";

import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

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
import { RemovalPolicy } from "aws-cdk-lib";
import { DockerImageAsset, NetworkMode } from "aws-cdk-lib/aws-ecr-assets";
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
     */
    const VirtualPrivateCloud = new ec2.Vpc(this, "PpaVpc", {
      natGateways: 0,
      maxAzs: 3,
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
     * Set up an S3 bucket to host the code for our remix app. When we push
     * to the main or dev branch on GitHub, an action will trigger to run
     * linters, tests, typechecks, and build the app (both the client and server
     * bundles including all static assets, client-side JS code, and index.html file).
     *
     * After the checks and build have passed. The GitHub action will then upload
     * just the build artifacts to S3. For a remix app specifically, it will serve
     * assets from the /public/build folder and the server-side code will be in the
     * /build folder (under the www/ directory in this repo.)
     */
    const WebsiteSourceCodeBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

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
      "GithubIdcProvider",
      {
        url: `https://token.actions.githubusercontent.com`,
        clientIds: ["sts.amazonaws.com"],
      }
    );

    /**
     *
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

    const WebsiteSourceCodeDeploymentBucket = new s3deploy.BucketDeployment(
      this,
      "DeployWebsite",
      {
        sources: [
          s3deploy.Source.asset("../build"),
          s3deploy.Source.asset("../public/build"),
        ],
        destinationBucket: WebsiteSourceCodeBucket,
        destinationKeyPrefix: "web/static", // optional prefix in destination bucket
      }
    );

    const WebsiteCertificateManager = new acm.Certificate(
      this,
      "PinePlusAppleWebsiteCertificate",
      {
        domainName: "*.pineplusapple.com",
        validation: acm.CertificateValidation.fromDns(),
      }
    );

    const WebsiteFargateService =
      new ecsp.ApplicationLoadBalancedFargateService(
        this,
        "PinePlusAppleWebsite",
        {
          taskImageOptions: {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
          },
        }
      );

    const ComputeInstanceSecurityGroup = new ec2.SecurityGroup(
      this,
      "ppa-ec2-instance-security-group",
      {
        vpc: VirtualPrivateCloud,
      }
    );

    ComputeInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "allow SSH access from anywhere"
    );

    ComputeInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP traffic from anywhere"
    );

    ComputeInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from anywhere"
    );

    ComputeInstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from anywhere"
    );

    ComputeInstanceSecurityGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const ComputeInstanceKeyPair = new ec2.CfnKeyPair(
      this,
      "PPA-ComputeInstanceKeyPair",
      {
        keyName: "ppa-llc-prod-keypair",
      }
    );

    /**
     * When we create the EC2 instance to run our web server, we need to provide
     * it a docker file. The docker file will install all the necessary software
     * like node, the prisma CLI, npm, etc.
     */

    const WebServerDockerImage = new DockerImageAsset(
      this,
      "PinePlusAppleWebServerDockerImage",
      {
        directory: path.join(__dirname, "../../www"),
        networkMode: NetworkMode.HOST,
      }
    );

    /**
     * Reference to a Principal (that is: something that can be granted permission).
     * In this case, if this is passed as the principal to a role or policy then
     * that means the role or policy is granting permission to all EC2 instances
     * under the AWS account.
     */
    const Ec2ServicePrincipal = new iam.ServicePrincipal("ec2.amazonaws.com");

    const ComputeInstanceRole = new iam.Role(
      this,
      "PinePlusAppleWebServerRole",
      {
        assumedBy: Ec2ServicePrincipal,
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore"
          ),
        ],
      }
    );

    /**
     * Allow EC2 instances under our AWS account to pull this image
     */
    WebServerDockerImage.repository.grantPull(
      new iam.ServicePrincipal("ec2.amazonaws.com")
    );

    const ComputeInstance = new ec2.Instance(this, "PinePlusApple_WebServer", {
      vpc: VirtualPrivateCloud,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: ComputeInstanceSecurityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      // Ideally this is just ec2.AmazonLinuxGeneration.AMAZON_LINUX_2022 but there's a bug: https://github.com/aws/aws-cdk/issues/21011
      //new ec2.AmazonLinuxImage({
      //  generation: ,
      // }),
      machineImage: ec2.MachineImage.fromSsmParameter(),

      role: ComputeInstanceRole,
      keyName: ComputeInstanceKeyPair.keyName,
    });

    WebServerDockerImage.repository.grantPull(ComputeInstanceRole);

    // VirtualPrivateCloud.addGatewayEndpoint("PPA_WebServerEndpoint", {
    //   service: ComputeInstance.
    // });

    ComputeInstance.addUserData(
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash", // install NVM
      ". ~/.nvm/nvm.sh", // Add NVM to the path
      "nvm install 18",
      "nvm use 18",
      "nvm alias default 18",
      "yum install git -y", // Install git
      "cd ~" // Change to the webserver root
      // TODO: git clone private repo.
    );

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
    DatabaseInstance.connections.allowFrom(ComputeInstance, ec2.Port.tcp(5432));

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
