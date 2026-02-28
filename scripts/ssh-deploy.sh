#!/usr/bin/env sh
set -e

# Usage: ./scripts/ssh-deploy.sh user@host [git-ref]
# This simple deploy script clones the repo on the remote host and runs the installer.

REMOTE=${1:-}
REF=${2:-main}

if [ -z "$REMOTE" ]; then
  echo "Usage: $0 user@host [git-ref]"
  exit 2
fi

REPO=${REPO:-git@github.com:supejs/supe.git}
REMOTE_DIR=/tmp/supe-deploy-$$

echo "Deploying $REPO@$REF to $REMOTE"

ssh $REMOTE "set -e; rm -rf $REMOTE_DIR; git clone --depth 1 --branch $REF $REPO $REMOTE_DIR || (git clone $REPO $REMOTE_DIR && cd $REMOTE_DIR && git checkout $REF); cd $REMOTE_DIR; chmod +x scripts/supe-install* || true; ./scripts/supe-install || ./scripts/supe-install.sh || true"

echo "Deployment finished."

exit 0
