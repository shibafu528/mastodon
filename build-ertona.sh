#!/bin/bash
set -eu

export DOCKER_BUILDKIT=1

CLOSEST_TAG=$(git describe --tags)
IMAGE_VERSION=${CLOSEST_TAG/\+/-}
MASTODON_VERSION_METADATA=${CLOSEST_TAG#v*+}

echo "       git tag: $CLOSEST_TAG"
echo " image version: $IMAGE_VERSION"
echo "version suffix: $MASTODON_VERSION_METADATA"

if [[ "$CLOSEST_TAG" = "$MASTODON_VERSION_METADATA" ]]; then
  echo "err: invalid tag format"
  exit 1
fi

echo "==> build image [1/2]"
docker build --build-arg MASTODON_VERSION_METADATA=$MASTODON_VERSION_METADATA -t shibafu528/mastodon:$IMAGE_VERSION .

echo ""
echo "==> build image [2/2]"
docker build --build-arg MASTODON_VERSION_METADATA=$MASTODON_VERSION_METADATA -f streaming/Dockerfile -t shibafu528/mastodon-streaming:$IMAGE_VERSION .
