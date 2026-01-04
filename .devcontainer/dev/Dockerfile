# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/javascript-node:24-trixie

# pnpm setup
RUN bash -euo pipefail -s <<'EOF'
  npm install -g pnpm@10.27.0
  su node -c "pnpm setup"
EOF
