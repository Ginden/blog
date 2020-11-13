#!/usr/bin/env bash

filename=$1

cat "$filename" | tidy -q --new-pre-tags data --custom-tags yes --wrap 240 --indent yes --vertical-space yes --show-info no --show-warnings no | sponge "$filename";
