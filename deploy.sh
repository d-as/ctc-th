#!/usr/bin/env sh

set -e

npm run build

cd dist

echo > .nojekyll

git init
git add .
git commit -m "Deploy"

git push -f git@github.com:d-as/ctc-transpose-helper.git master

cd -
