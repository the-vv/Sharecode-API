rm -rf dist

export NODE_ENV=production

./node_modules/typescript/bin/tsc -p ./tsconfig.build.json --pretty

cp -R src/public dist/src/public

cp package.json dist/