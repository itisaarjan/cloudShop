import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class CognitoStack extends cdk.Stack{
    constructor(scope:Construct, id: string, props?:cdk.StackProps){
        super(scope,id, props);

        const userPool = new cognito.UserPool(this, "CloudShopUserPool",{
           userPoolName: "CloudShopUserPool",
           signInCaseSensitive: false,
           selfSignUpEnabled: true,
           signInAliases: { email: true },
           standardAttributes: {
            email: { required: true, mutable: true },
          },
           userVerification: {
            emailSubject: "Verify your email for Cloudshop",
            emailBody: "Thanks for signing up to Cloudshop! Your verification code is {####}",
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

        const webClient = new cognito.UserPoolClient(this, "CloudShopWebClient",{
            userPool,
            userPoolClientName: "CloudShopWebClient",
            generateSecret: false,
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
                    "https://www.cloudshop.click/"
                ],

                logoutUrls: [
                    "https://www.cloudshop.click/"
                ]
            },
            accessTokenValidity: cdk.Duration.minutes(15),
            idTokenValidity: cdk.Duration.minutes(15),
            refreshTokenValidity: cdk.Duration.days(30),
        });

        const domain = userPool.addDomain("CloudShopDomain", {
            cognitoDomain: { domainPrefix: "cloudshop" },
          });
      
          new cdk.CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
          new cdk.CfnOutput(this, "UserPoolClientId", {
            value: webClient.userPoolClientId,
          });
          new cdk.CfnOutput(this, "HostedUiBaseUrl", { value: domain.baseUrl() });
          new cdk.CfnOutput(this, "LoginUrlExample", {
            value:
              `${domain.baseUrl()}/login?` +
              `client_id=${webClient.userPoolClientId}` +
              `&response_type=code&scope=openid+email+profile` +
              `&redirect_uri=${encodeURIComponent("http://localhost:5173/callback")}`,
          });
    }
}