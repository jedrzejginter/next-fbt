import { readFileSync, writeFileSync } from 'fs';
import { globbySync } from 'globby';
import path from 'path';

const DEFAULT_VERSION = '0.0.0-dev';

const [versionToSet = DEFAULT_VERSION] = process.argv.slice(2);

const packagesPaths = globbySync(['packages/*/package.json']).map((pathToFile) => ({
  pathToFile,
  rangeModifier: versionToSet === DEFAULT_VERSION ? '' : '^',
  packageVersion: versionToSet,
}));

const paths = packagesPaths;

for (const { packageVersion, pathToFile, rangeModifier } of paths) {
  const pkgJson = JSON.parse(readFileSync(pathToFile).toString());
  const versionWithRange = `${rangeModifier}${versionToSet}`;

  pkgJson.version = packageVersion;

  if (pkgJson.dependencies) {
    pkgJson.dependencies = Object.fromEntries(
      Object.entries(pkgJson.dependencies).map(([k, v]) => {
        if (k.startsWith('next-fbt')) {
          return [k, versionWithRange];
        }

        return [k, v];
      }),
    );
  }

  if (pkgJson.devDependencies) {
    pkgJson.devDependencies = Object.fromEntries(
      Object.entries(pkgJson.devDependencies).map(([k, v]) => {
        if (k.startsWith('next-fbt')) {
          return [k, versionWithRange];
        }

        return [k, v];
      }),
    );
  }

  if (pkgJson.peerDependencies) {
    pkgJson.peerDependencies = Object.fromEntries(
      Object.entries(pkgJson.peerDependencies).map(([k, v]) => {
        if (k.startsWith('next-fbt')) {
          return [k, versionWithRange];
        }

        return [k, v];
      }),
    );
  }

  writeFileSync(pathToFile, JSON.stringify(pkgJson, null, 2) + '\n', 'utf-8');
}
