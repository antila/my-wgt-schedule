#!/usr/bin/env bash

set -e 

DISTRIBUTION_ID=E3KT98WN9ND5RC

# aws --profile wgt s3 cp s3://wgt.zauber.tech/data.json public/data.json
# aws --profile wgt s3 cp s3://wgt.zauber.tech/data-discogs.json data-discogs.json
yarn run build
aws --profile wgt s3 sync --delete ./out s3://wgt.zauber.tech
INVALIDATION_ID=$(aws --profile wgt cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" | jq -r ".Invalidation.Id")

aws --profile wgt cloudfront get-invalidation --id $INVALIDATION_ID --distribution-id $DISTRIBUTION_ID