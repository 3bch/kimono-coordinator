#!/bin/bash

set -euo pipefail

git config pull.ff only

# mise feature の trust は --verbose 固定で DEBUG ログが大量に出るため自前で実行する
mise trust --yes
mise install --yes

mise exec -- pnpm install

# ブラウザバイナリの取得と Claude Code 向け skill の導入をおこなう
# install だけでは headless shell が入らないため install-browser も実行する
mise exec -- playwright-cli install-browser chromium
mise exec -- playwright-cli install --skills
