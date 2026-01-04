#!/bin/bash

set -euo pipefail

git config pull.ff only

pnpm install
