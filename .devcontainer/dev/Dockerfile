# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/base:debian@sha256:1a00517e89d3075f8c9dc8d9911404de0ff8991a4d71c62068573e9b016a89da

# mise 関連のボリュームのマウント先の所有者が vscode となるよう事前に作成しておく
RUN bash -euo pipefail -s <<'EOF'
  mkdir -p /home/vscode/.local/share/mise
  chown -R vscode:vscode /home/vscode/.local

  mkdir -p /home/vscode/.cache/mise
  chown -R vscode:vscode /home/vscode/.cache
EOF