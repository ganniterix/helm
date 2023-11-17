#!/bin/bash

set -eux -o pipefail

node ./scripts/nodejs/index.js

# for chart in gen/*
# do
#  helm dependency update $chart
# done

helm package gen/* charts/* -d docs

# helm repo index --url https://noygal.github.io/helm/ --merge docs/index.yaml docs