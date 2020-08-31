#!/usr/bin/env bash

rm blog && ln -s docs blog;

SERVER_PORT="5698"

SLUG="GINDEN_BLOG_$SERVER_PORT";

if screen -list | grep -q "$SLUG"; then
  echo "Killing running server (why would you do that?)";
  screen -S "$SLUG" -X quit;
fi

(which http-server > /dev/null) && screen -S "$SLUG" -d -m http-server -p "$SERVER_PORT" -c-1 .

echo "http://localhost:$SERVER_PORT/blog/";
