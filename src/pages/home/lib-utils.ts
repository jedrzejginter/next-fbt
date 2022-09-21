import * as path from 'path';
import micromatch from 'micromatch';

const defaultPairs: [/* regex */ string, /* group */ string][] = JSON.parse(
  process.env['NEXT_PUBLIC_FBT_PATTERNS'] || '[]',
);

// aa

export function getGroups(
  item: string | { filepath: string },
  matchPairs = defaultPairs,
): string[] {
  const filepath = typeof item === 'string' ? new URL(item).pathname : item.filepath;
  const relativeFilepath = path.relative(process.env['NEXT_PUBLIC_FBT_ROOT_DIR'] || '', filepath);
  const calculatedGroups = [];

  for (const [pattern, group] of matchPairs) {
    const captured = micromatch.capture(pattern, relativeFilepath);

    if (captured) {
      const delim: string = (group.includes('-') && '-') || '_';

      calculatedGroups.push(
        captured
          .reduce((final, item, index) => {
            return final
              .replaceAll(`\$${index + 1}`, item.replaceAll('/', delim))
              .replaceAll(`\${${index + 1}}`, item.replaceAll('/', delim));
          }, group)
          .replaceAll('$@', captured.join(delim))
          .replaceAll('${@}', captured.join(delim))
          .replace(/\$\{?[\d@]+\}?/g, ''),
      );
    }
  }

  return calculatedGroups;
}

export function getGroup(item: string | { filepath: string }, matchPairs = defaultPairs): string {
  return getGroups(item, matchPairs)[0] || 'main';
}
