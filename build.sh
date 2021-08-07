#!/usr/bin/env bash

mkdir public

mkdir public/css
cp css/*.css public/css/

mkdir public/js
cp js/* public/js/

mkdir public/fonts
cp fonts/* public/fonts/

cp ./*.html public/
cp ./*.ico public/
cp ./*.png public/
cp ./*.txt public/
cp ./*.json public/
