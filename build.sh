#!/usr/bin/env bash

set -e;

wget https://code.jquery.com/jquery-3.3.1.min.js -O "jekyll-source/assets/jquery.min.js";

inkscape --export-background='#DDDDDD' -w 128 -h 128 jekyll-source/assets/favicon.svg --export-filename jekyll-source/assets/favicon.png || true;

(cd jekyll-source && bundle exec jekyll build --destination ../docs);

(xmllint --format docs/feed.xml > docs/pretty-feed.xml) && mv docs/pretty-feed.xml docs/feed.xml;

DOCS_DIR="$(realpath docs)"

(cd references-workaround && npx tsc && (node index.js "$DOCS_DIR" || (npm i && node index.js)))

find docs -name '*.html' -exec ./tidy-html-file.sh "{}" \;

jq -S . "docs/redirects.json" > "docs/redirects_pretty.json" && mv "docs/redirects_pretty.json" "docs/redirects.json"

./local-server.sh
