#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

function findJsFiles(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      result.push(...findJsFiles(full));
    } else if (e.isFile() && full.endsWith('.js')) {
      result.push(full);
    }
  }
  return result;
}

const root = path.resolve(path.dirname(process.argv[1]), '..');
const srcDirs = ['src', 'scripts', 'public', '.'];
let files = [];
for (const d of srcDirs) {
  const dir = path.join(root, d);
  if (fs.existsSync(dir)) files = files.concat(findJsFiles(dir));
}
files = Array.from(new Set(files));

let failed = false;
for (const f of files) {
  const res = spawnSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  if (res.status !== 0) {
    console.error(`Syntax check failed for ${f}`);
    console.error(res.stderr.toString());
    failed = true;
  }
}

if (failed) {
  console.error('\n❌ Syntax check failed in one or more files.');
  process.exit(1);
}

console.log('\n✔ Syntax check passed for all JS files.');
