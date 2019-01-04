#!/usr/bin/env bash

(cd jekyll-source && jekyll build --destination ../docs);

(xmllint --format docs/feed.xml > docs/pretty-feed.xml) && mv docs/pretty-feed.xml docs/feed.xml;

find docs -name '*.html' -exec ./tidy-html-file.sh "{}" \;

DOCS_DIR="$(realpath docs)"

(cd references-workaround && (node index.js "$DOCS_DIR" || (npm i && node index.js)))

jq . "docs/redirects.json" > "docs/redirects_pretty.json" && mv "docs/redirects_pretty.json" "docs/redirects.json"

./local-server.sh