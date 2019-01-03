#!/bin/sh
set -e

CONFIG_PATH=/data/options.json

# TODO: remove this check once everything is working
if [ ! -f "$CONFIG_PATH" ]; then
  echo "writing config to $CONFIG_PATH"
  mkdir -p `dirname $CONFIG_PATH`
  echo '{"schedule": "*/1 * * * *","stations":[{"url": "shell-budapest-ix-haller-u-56.html", "id": "sensor.haller-shell"}, { "url": "omv-szigetszentmiklos-gyari-ut.html", "id": "sensor.omv-szigetszentmiklos"}],"types": ["adblue"]}' >$CONFIG_PATH
fi

pm2-runtime cli.js -- --config="${CONFIG_PATH}"