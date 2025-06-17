#!/bin/bash

set -e

REGION= ${AWS_REGION}

if [ -z "$REGION" ]; then
  echo "AWS_REGION is not set. Exiting."
  exit 1
fi

STACK_NAME= ${STACK_NAME}
status=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" \
            --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "NOT_FOUND")

          echo "Stack status: $status"

          if [ "$status" = "ROLLBACK_COMPLETE" ]; then
            echo "Stack is in ROLLBACK_COMPLETE. Deleting..."
            aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
            aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION"
            echo "Stack deleted successfully."
          fi