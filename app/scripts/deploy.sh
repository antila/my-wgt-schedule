#!/usr/bin/env bash

set -e 

yarn run build
rsync -av -R out zauber.tech:~/wgt/
ssh zauber.tech "cp -R ~/wgt/out/* /var/www/wgt"