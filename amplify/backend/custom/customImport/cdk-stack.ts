import * as cdk from 'aws-cdk-lib';
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
    
    // Stack Param
    const customParam = new cdk.CfnParameter(this, 'CustomParam', {
      type: 'String',
      description: 'A custom parameter from CloudFormation',
    });

    new cdk.CfnOutput(this, 'CustomParamOutput', {
      value: customParam.valueAsString,
      description: 'The custom parameter passed from CloudFormation',
    });


    // Dummy Resource to avoid "At least one Resources member must be defined" error
    // Create a dummy wait resource
    new cdk.CfnResource(this, 'DummyResource', {
      type: 'AWS::CloudFormation::WaitConditionHandle'
    });

    const importedProjectInfo = {projectName: 'crossstackuserapp', envName: 'dev'};
    const importName = `${importedProjectInfo.projectName}-${importedProjectInfo.envName}`;
    const importedApiArn = cdk.Fn.importValue(`LayerArn-${importName}`);

    new cdk.CfnOutput(this, 'importedLayerArn', {
      value: importedApiArn,
      description: `Imported LayerArn-${importName}`,
    });
  }
}