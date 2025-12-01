import * as fs from 'fs';

import * as path from 'path';

export function findIocFiles(dir: string): string[] {
  let results: string[] = [];

  function walk(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath); // рекурсия
      } else if (path.extname(item) === '.ioc') {
        const relativePath = path.relative(dir, fullPath);
        results.push(relativePath);
      }
    }
  }

  walk(dir);
  return results;
}
