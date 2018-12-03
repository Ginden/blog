#!/usr/bin/env bash

(cd jekyll-source && jekyll build --destination ../docs);

(xmllint --format docs/feed.xml > docs/pretty-feed.xml) && rm docs/feed.xml && mv docs/pretty-feed.xml docs/feed.xml;
