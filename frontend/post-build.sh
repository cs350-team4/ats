#!/usr/bin/env bash

npx html-minifier-terser \
    --input-dir dist \
    --output-dir dist \
    --file-ext html \
    --collapse-boolean-attributes \
    --collapse-inline-tag-whitespace \
    --collapse-whitespace \
    --decode-entities \
    --minify-css true \
    --minify-js true \
    --remove-comments \
    --remove-redundant-attributes \
    --remove-script-type-attributes \
    --remove-style-link-type-attributes \
    --remove-tag-whitespace \
    --sort-attributes \
    --sort-class-name
	