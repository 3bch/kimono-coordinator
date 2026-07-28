# syntax=docker/dockerfile:1
# Playwright が公式サポートするのは Ubuntu 系のため noble (24.04 LTS) を利用する
FROM mcr.microsoft.com/devcontainers/base:noble@sha256:c5cc2b45afe06a1df3aba17e58ba0dc4a02b999493198dab37dd0ccd4e2b0705

# Playwright が Chromium を起動するために必要な共有ライブラリとフォントを導入しておく
RUN bash -euo pipefail -s <<'EOF'
  export DEBIAN_FRONTEND=noninteractive

  apt-get update
  apt-get install -y --no-install-recommends \
    fonts-liberation \
    fonts-noto-cjk \
    libasound2t64 \
    libatk-bridge2.0-0t64 \
    libatk1.0-0t64 \
    libatspi2.0-0t64 \
    libcairo2 \
    libcups2t64 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0t64 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2

  rm -rf /var/lib/apt/lists/*
EOF

# mise と Playwright 関連のボリュームのマウント先の所有者が vscode となるよう事前に作成しておく
RUN bash -euo pipefail -s <<'EOF'
  mkdir -p /home/vscode/.local/share/mise
  chown -R vscode:vscode /home/vscode/.local

  mkdir -p /home/vscode/.cache/mise
  mkdir -p /home/vscode/.cache/ms-playwright
  chown -R vscode:vscode /home/vscode/.cache
EOF
