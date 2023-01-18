const child_process = require('child_process');
const fs = require('fs');

fs.rmSync('dist', { recursive: true, force: true })

child_process.execSync('tsc -p ./tsconfig.build.json --pretty')

fs.cpSync('src/public', 'dist/src/public', { recursive: true })

fs.cpSync('package.json', 'dist/package.json')