#!/usr/bin/env bash

set -e;

wget https://code.jquery.com/jquery-3.3.1.min.js -O "jekyll-source/assets/jquery.min.js";

(cd jekyll-source && bundle exec jekyll build --destination ../docs);

DOCS_DIR="$(realpath docs)"

(cd references-workaround && npm run build && (node index.js "$DOCS_DIR" || (npm i && node index.js)));

(xmllint --format docs/feed.xml > docs/pretty-feed.xml) && mv docs/pretty-feed.xml docs/feed.xml;

find docs -name '*.html' -print0 | xargs -P 8 -n1 -0 ./tidy-html-file.sh;

(jq -S . "docs/redirects.json" > "docs/redirects_pretty.json" && mv "docs/redirects_pretty.json" "docs/redirects.json");

./local-server.sh
