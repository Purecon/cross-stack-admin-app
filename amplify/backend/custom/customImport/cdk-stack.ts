import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import { Construct } from 'constructs';
//import * as iam from 'aws-cdk-lib/aws-iam';
//import * as sns from 'aws-cdk-lib/aws-sns';
//import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
//import * as sqs from 'aws-cdk-lib/aws-sqs';

export class cdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
    /* AWS CDK code goes here - learn more: https://docs.aws.amazon.com/cdk/latest/guide/home.html */
    
    // Get stack parameter about imported project
    // Edit ./parameters.json
    const projectNameParam = new cdk.CfnParameter(this, 'ImportedProjectName', {
      type: 'String',
      description: 'Target imported project name',
    });
    const projectEnvParam = new cdk.CfnParameter(this, 'ImportedProjectEnv', {
      type: 'String',
      description: 'Target imported project environment',
    });
    // Output the stack parameter
    new cdk.CfnOutput(this, 'importedProjectName', {
      value: projectNameParam.valueAsString,
      description: `Imported project name`,
    });
    new cdk.CfnOutput(this, 'importedProjectEnv', {
      value: projectEnvParam.valueAsString,
      description: `Imported project env`,
    });

    // Dummy Resource to avoid "At least one Resources member must be defined" error
    // Create a dummy wait resource
    // new cdk.CfnResource(this, 'DummyResource', {
    //   type: 'AWS::CloudFormation::WaitConditionHandle'
    // });

    //Access other Amplify resource
    const dependencies: AmplifyDependentResourcesAttributes =
      AmplifyHelpers.addResourceDependency(
      this,
      amplifyResourceProps.category,
      amplifyResourceProps.resourceName,
      [
        {
          category: "function",
          resourceName: "testAdminFunction", 
        },
      ]
    );

    //Import the ARN from the target project
    const importedProjectInfo = {projectName: projectNameParam.valueAsString, envName: projectEnvParam.valueAsString};
    const importName = `${importedProjectInfo.projectName}-${importedProjectInfo.envName}`;
    const importedApiArn = cdk.Fn.importValue(`GraphQLAPIArn-${importName}`);
    const importedLambdaArn = cdk.Fn.importValue(`LambdaArn-${importName}`);
    const importedLayerArn = cdk.Fn.importValue(`LayerArn-${importName}`);

    //Create custom configuration
    const testAdminFunctionRoleArn = cdk.Fn.ref(
      dependencies.function.testAdminFunction.LambdaExecutionRoleArn
    );
    // Create an IAM role object for policy attachment
    const testAdminFunctionRole = iam.Role.fromRoleArn(
      this,
      "TestAdminFunctionRole",
      testAdminFunctionRoleArn,
      { mutable: true } // Allows modification
    );
    
    // Add policy allowing `testAdminFunction` to use the imported Layer ARN
    testAdminFunctionRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["lambda:GetLayerVersion"],
        resources: [importedLayerArn],
      })
    );

    //Output the ARN name to show in CloudFormation output
    new cdk.CfnOutput(this, 'importedAPIArn', {
      value: importedApiArn,
      description: `Imported GraphQL API Arn`,
    });
    new cdk.CfnOutput(this, 'importedLambdaArn', {
      value: importedLambdaArn,
      description: `Imported LambdaArn`,
    });
    new cdk.CfnOutput(this, 'importedLayerArn', {
      value: importedLayerArn,
      description: `Imported LayerArn`,
    });
  }
}