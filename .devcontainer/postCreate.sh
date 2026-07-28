#!/bin/bash

set -euo pipefail

git config pull.ff only

curl -fsSL https://claude.ai/install.sh | bash

mise exec -- pnpm install

# ブラウザバイナリの取得と Claude Code 向け skill の導入をおこなう
# install だけでは headless shell が入らないため install-browser も実行する
mise exec -- playwright-cli install-browser chromium
mise exec -- playwright-cli install --skills
