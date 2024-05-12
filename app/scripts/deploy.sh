#!/usr/bin/env bash

set -e 

aws --profile wgt s3 cp s3://wgt.zauber.tech/data.json public/data.json
aws --profile wgt s3 cp s3://wgt.zauber.tech/data-discogs.json data-discogs.json
yarn run build
aws --profile wgt s3 sync --delete ./out s3://wgt.zauber.tech