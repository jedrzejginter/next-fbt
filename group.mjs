import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { globby } from 'globby';

import fbtHashKey from 'babel-plugin-fbt/dist/fbtHashKey.js';
import { execSync } from 'child_process';
import { dirname, relative } from 'path';

import config from './fbtrc.json' assert { type: 'json' };

async function run() {
  const { getGroup } = await import('./dist/lib/lib-utils.mjs');

  const sourceStringsFile = await readFile('.cache/next-fbt/source-strings.json');
  const sourceStrings = JSON.parse(sourceStringsFile.toString());

  let hashToGroup = {};
  let fbtHashToHash = {};

  for (const phrase of sourceStrings.phrases) {
    const group = getGroup(phrase, config.NEXT_PUBLIC_FBT_PATTERNS);
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

  const files = await globby(process.argv[2] + '/**/*.json', {
    dot: true,
  });

  const fileSystem = {};

  for (const file of files) {
    const crowdinFile = await readFile(file);
    const crowdin = JSON.parse(crowdinFile.toString());

    for (const [hash, translation] of Object.entries(crowdin.translations)) {
      const group = hashToGroup[hash];
      const outputFilepath = `${crowdin['fb-locale']}_${group}`;

      fileSystem[outputFilepath] = {
        ...crowdin,
        translations: {
          ...fileSystem[outputFilepath]?.translations,
          ...Object.fromEntries([[hash, translation]]),
        },
      };
    }
  }

  await mkdir('.cache/next-fbt/translations', { recursive: true });

  for (const [filepath, contents] of Object.entries(fileSystem)) {
    await writeFile(
      `.cache/next-fbt/translations/${filepath}.json`,
      JSON.stringify(contents),
      'utf-8',
    );
  }

  await execSync('mkdir -p .cache/next-fbt/out', { stdio: 'inherit' });
  await execSync(
    'npx fbt-translate --translations .cache/next-fbt/translations/*.json --source-strings .cache/next-fbt/source-strings.json --jenkins > .cache/next-fbt/translated-fbts.json',
    { stdio: 'inherit' },
  );

  console.log(hashToGroup);
  console.log(fbtHashToHash);

  const translatedFbtsFile = await readFile('.cache/next-fbt/translated-fbts.json');
  const translatedFbts = JSON.parse(translatedFbtsFile.toString());

  let finalFileSystem = {};

  for (const [locale, fbts] of Object.entries(translatedFbts)) {
    for (const [fbtHash, translation] of Object.entries(fbts)) {
      const sourceHash = fbtHashToHash[fbtHash];
      const group = hashToGroup[sourceHash];

      const filepath = `${locale}/${group}`;

      finalFileSystem[filepath] = {
        ...finalFileSystem[filepath],
        ...Object.fromEntries([[fbtHash, translation]]),
      };
    }
  }

  await rm('public/intl', { force: true, recursive: true });

  for (const [filepath, contents] of Object.entries(finalFileSystem)) {
    const outFilePath = `public/intl/${filepath}.json`;

    await mkdir(dirname(outFilePath), { recursive: true });
    await writeFile(outFilePath, JSON.stringify(contents), 'utf-8');
  }

  // console.log(finalFileSystem);
  console.log('✅ Done!');
}

run();
