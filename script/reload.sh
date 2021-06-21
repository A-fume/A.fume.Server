#!/bin/sh
npm install;
npm audit fix;
npm test;
pm2 restart ecosystem.json;
echo $?
