import { exec, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import isCI from 'is-ci';

const REGISTRY = process.env.REGISTRY;
const supportedRegistries = ['local', 'npm'];

if (!supportedRegistries.includes(REGISTRY)) {
  throw new Error('Missing or incorrect REGISTRY env.');
}

if (REGISTRY === 'npm' && !isCI) {
  throw new Error('Publishing to npm can be done from CI only.');
}

const pkgJson = JSON.parse(readFileSync('package.json').toString());

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

const tag = process.env.NPM_TAG || 'latest';

if (!REGISTRY && !isCI) {
  throw new Error('Forbidden to publish from local environment.');
}

switch (REGISTRY) {
  // Publish to Verdaccio.
  case 'local': {
    try {
      execSync(`npm unpublish --force ${pkgJson.name} --registry http://localhost:4873`, {
        stdio: 'ignore',
      });
    } catch {
      // This fails if we try to publish new package that has not been published ever.
    }

    execSync(`npm publish --access public --tag ${tag} --registry http://localhost:4873`, {
      stdio: 'inherit',
    });

    break;
  }
  // Publish to npm.
  case 'npm': {
    execSync(`npm publish --access public --tag ${tag}`, { stdio: 'inherit' });
    break;
  }
}

chalk.green('Published!');
