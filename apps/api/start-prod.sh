#!/bin/bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
cd /home/ubuntu/albore_app/apps/api
exec bun dist/apps/api/src/main.js
