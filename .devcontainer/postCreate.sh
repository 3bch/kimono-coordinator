#!/bin/bash

set -euo pipefail

git config pull.ff only

curl -fsSL https://claude.ai/install.sh | bash

pnpm install
