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



export function extractSTM32BaseDeviceIdFromFile(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Ищем строку вида "ProjectManager.DeviceId=..."
    const match = content.match(/^ProjectManager\.DeviceId\s*=\s*(\S+)/m);
    if (!match) {
      console.warn(`⚠️  ProjectManager.DeviceId not found in ${filePath}`);
      return null;
    }

    const fullDeviceId = match[1].trim();
    if (!fullDeviceId) {
      console.warn(`⚠️  Empty value for ProjectManager.DeviceId in ${filePath}`);
      return null;
    }

    return fullDeviceId;

    // fallback: если формат не STM32 — возвращаем как есть (или можно вернуть null)
    console.warn(`❓ Unexpected DeviceId format: "${fullDeviceId}"`);
    return fullDeviceId;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error(`❌ File not found: ${filePath}`);
    } else {
      console.error(`❌ Error reading ${filePath}:`, err.message);
    }
    return null;
  }
}
