#!/usr/bin/env bash

filename=$1

temp_file="$(mktemp)";
echo "Processing file $(basename "$filename") ($filename)";
cat "$filename" | tidy -q --new-pre-tags data --custom-tags yes --wrap 240 --indent yes --vertical-space yes --show-info no --show-warnings no > "$temp_file";

cp -f "$temp_file" "$filename";

echo "DONE!"
