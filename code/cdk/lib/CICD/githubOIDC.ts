import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class OIDCStack extends cdk.Stack{
    constructor(scope: Construct, id: string, props?: cdk.StackProps){
        super(scope, id);

            const oidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
                url: 'https://token.actions.githubusercontent.com',
                clientIds: ['sts.amazonaws.com'],
            });

        const githubOidcRole = new iam.Role(this, 'GitHubActionsDeployRole', {
            roleName: 'GitHubActionsOIDCDeployRole',
            assumedBy: new iam.WebIdentityPrincipal(
              oidcProvider.openIdConnectProviderArn,
              {
                'StringLike': {
                  'token.actions.githubusercontent.com:sub': 'repo:itisaarjan/cloudShop:*'
                }
              }
            ),
            description: 'Role assumed by GitHub Actions via OIDC',
        });

        githubOidcRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
        );
          
    }
}