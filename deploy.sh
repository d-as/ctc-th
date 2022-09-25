#!/usr/bin/env sh

set -e

npm run build

cd dist

echo > .nojekyll

git checkout --orphan new-master master
git add .
git commit -m "Deploy"
git branch -M new-master master

git push -f git@github.com:d-as/ctc-transpose-helper.git master
