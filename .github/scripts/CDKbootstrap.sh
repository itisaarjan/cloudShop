#!/bin/bash

set -e

REGION=${AWS_REGION}


if [ -z "$REGION" ]; then
  echo "AWS_REGION is not set. Exiting."
  exit 1
fi

echo "Checking if CDKToolkit stack exists in region $REGION..."

if ! aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" > /dev/null 2>&1; then

  echo "CDKToolkit not found. Running bootstrap..."
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  cd ./code/cdk
  npx cdk bootstrap aws://$ACCOUNT_ID/$REGION
else
  echo "CDKToolkit already exists in $REGION. Skipping bootstrap."
fi