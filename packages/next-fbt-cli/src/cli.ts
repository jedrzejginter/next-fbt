#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { red } from 'colorette';
import fbtHashKey from 'babel-plugin-fbt/dist/fbtHashKey.js';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { globby } from 'globby';
import { Config, getGroup } from 'next-fbt-core';

function sha256(x: string) {
  return createHash('sha256').update(x, 'utf8').digest('hex');
}

async function run() {
  const sourceTranslationsDir = process.argv[2];

  if (!sourceTranslationsDir) {
    throw new Error('Missing required argument for translations directory');
  }

  const mjsConfigPath = join(process.cwd(), 'next-fbt.config.mjs');
  const jsConfigPath = join(process.cwd(), 'next-fbt.config.js');
  let config: Config | undefined;

  if (existsSync(mjsConfigPath)) {
    const mjsModule = await import(mjsConfigPath);
    config = mjsModule.default ?? mjsModule.config ?? mjsModule;
  } else if (existsSync(jsConfigPath)) {
    const jsModule = await import(jsConfigPath);
    config = jsModule.default ?? jsModule.config ?? jsModule;
  }

  if (!config) {
    console.error(
      red(
        'Cannot find next-fbt.config.{mjs,js} file or the config file has no config exports (you can use either default export or named export - `config`).',
      ),
    );
    process.exit(1);
  }

  // Add rootDir if it's not there.
  const runtimeConfig = {
    ...{ rootDir: process.cwd() },
    ...config.i18n.nextFbt,
  };

  const sourceStringsFile = await readFile('.cache/next-fbt/source-strings.json');
  const sourceStrings = JSON.parse(sourceStringsFile.toString());

  let hashToGroup: Record<string, string> = {};
  let fbtHashToHash: Record<string, string> = {};

  for (const phrase of sourceStrings.phrases) {
    const group = getGroup(phrase, runtimeConfig);
    const hashes = Object.keys(phrase.hashToLeaf);

    hashToGroup = Object.assign(
      hashToGroup,
      Object.fromEntries(hashes.map((hash) => [hash, group])),
    );

    fbtHashToHash = Object.assign(
      fbtHashToHash,
      Object.fromEntries(hashes.map((hash) => [fbtHashKey(phrase.jsfbt.t), hash])),
    );
  }

  await rm('.cache/next-fbt/translations', { force: true, recursive: true });
  await mkdir('.cache/next-fbt/translations', { recursive: true });

  const files = await globby(sourceTranslationsDir + '/**/*.json', {
    dot: true,
  });

  for await (const file of files) {
    await cp(file, join('.cache/next-fbt/translations', sha256(file) + '.json'));
  }

  execSync(
    'npx fbt-translate --translations .cache/next-fbt/translations/*.json --source-strings .cache/next-fbt/source-strings.json --jenkins > .cache/next-fbt/translated-fbts.json',
    { stdio: 'inherit' },
  );

  const translatedFbtsFile = await readFile('.cache/next-fbt/translated-fbts.json');
  const translatedFbts: Record<string, any> = JSON.parse(translatedFbtsFile.toString());

  let fileSystem: Record<string, any> = {};

  for (const [locale, fbts] of Object.entries(translatedFbts)) {
    for (const [fbtHash, translation] of Object.entries(fbts)) {
      const sourceHash = fbtHashToHash[fbtHash];
      const group = hashToGroup[sourceHash!];

      const filepath = `${locale}/${group}`;

      fileSystem[filepath] = {
        ...fileSystem[filepath],
        ...Object.fromEntries([[fbtHash, translation]]),
      };
    }
  }

  await rm('public/i18n', { force: true, recursive: true });
  await mkdir('public/i18n', { recursive: true });

  for await (const [filepath, contents] of Object.entries(fileSystem)) {
    const outFilePath = `public/i18n/${filepath}.json`;

    await mkdir(dirname(outFilePath), { recursive: true });
    await writeFile(outFilePath, JSON.stringify(contents), 'utf-8');
  }

  console.log('✅ Done!');
}

run();
