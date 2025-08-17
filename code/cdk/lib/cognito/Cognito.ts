import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import path from "path";

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const browserCallbackUrl = "https://www.cloudshop.click/auth/callback";
    const api = new apigw.RestApi(this, "AuthApi", {
      restApiName: "CloudShopAuthApi",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
      },
    });

    const auth = api.root.addResource("auth");
    const callback = auth.addResource("callback");

    // --- COGNITO USER POOL ---
    const userPool = new cognito.UserPool(this, "CloudShopUserPool", {
      userPoolName: "CloudShopUserPool",
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      userVerification: {
        emailSubject: "Verify your email for Cloudshop",
        emailBody:
          "Thanks for signing up to Cloudshop! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      mfa: cognito.Mfa.OFF,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
    });

    // --- COGNITO APP CLIENT ---


    const webClient = new cognito.UserPoolClient(this, "CloudShopWebClient", {
      userPool,
      userPoolClientName: "CloudShopWebClient",
      generateSecret: true, // confidential client (Authorization Code + client_secret)
      preventUserExistenceErrors: true,
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          "https://www.cloudshop.click/",
          browserCallbackUrl, // <-- API callback whitelisted
          // "http://localhost:5173/callback", // (optional for local dev)
        ],
        logoutUrls: ["https://www.cloudshop.click/"],
      },
      accessTokenValidity: cdk.Duration.minutes(15),
      idTokenValidity: cdk.Duration.minutes(15),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // --- HOSTED UI DOMAIN ---
    const domain = userPool.addDomain("CloudShopDomain", {
      cognitoDomain: { domainPrefix: "cloudshop" },
    });

    // --- OUTPUTS ---
    new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: webClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "HostedUiBaseUrl", { value: domain.baseUrl() });

    // Align the example login URL with the API callback
    new cdk.CfnOutput(this, "LoginUrlExample", {
      value:
        `${domain.baseUrl()}/login?` +
        `client_id=${webClient.userPoolClientId}` +
        `&response_type=code&scope=openid+email+profile` +
        `&redirect_uri=${encodeURIComponent(browserCallbackUrl)}`,
    });

    const clientSecret = new secrets.Secret(this, "CognitoClientSecret", {
      secretStringValue: webClient.userPoolClientSecret!,
    });

    // --- DYNAMODB SESSIONS ---
    const table = new dynamodb.Table(this, "UserSessionTable", {
      partitionKey: { name: "sid", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev-friendly
    });

    // --- CALLBACK LAMBDA ---
    const callbackFn = new node.NodejsFunction(this, "SessionCallbackFn", {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "services",
        "cognito",
        "provideTokenLambda.ts"
      ),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        USER_POOL_DOMAIN: domain.baseUrl().replace(/\/$/, ""),
        CLIENT_ID: webClient.userPoolClientId,
        CLIENT_SECRET_ARN: clientSecret.secretArn,
        REDIRECT_URI: browserCallbackUrl, // <-- aligned with Cognito client
        TABLE_NAME: table.tableName,
        COOKIE_DOMAIN: ".cloudshop.click",
        COOKIE_SECURE: "true",
        SESSION_TTL_DAYS: "30",
      },
      bundling: {
        externalModules: ["aws-sdk"],
        minify: true,
        target: "es2020",
      },
    });

    table.grantWriteData(callbackFn);
    clientSecret.grantRead(callbackFn);

    // --- API ROUTE INTEGRATION ---
    callback.addMethod("GET", new apigw.LambdaIntegration(callbackFn));

    new cdk.CfnOutput(this, "AuthCallbackUrl", {
      value: browserCallbackUrl,
    });
  }
}
