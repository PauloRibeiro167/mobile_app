const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const outputPath = path.resolve(
  __dirname,
  '../src/app/core/constants/app-version.ts'
);

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const fileContents =
  `// Auto-generated from package.json. Do not edit manually.\n` +
  `export const APP_VERSION = '${packageJson.version}';\n`;

fs.writeFileSync(outputPath, fileContents);
