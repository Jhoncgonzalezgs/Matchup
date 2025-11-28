import fs from 'fs';
import path from 'path';

const scanDirs = ['src', 'public'];
const files = ['server.js'];

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full);
    else if (/\.js$/.test(e.name)) files.push(full);
  });
}

scanDirs.forEach(d => {
  if (fs.existsSync(d)) walkDir(d);
});

console.log('Files to check:', files);

function stripInline(line) {
  let inSingle = false, inDouble = false, inBack = false, escaped = false;
  for (let i = 0; i < line.length - 1; i++) {
    const ch = line[i];
    const next = line[i+1];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (!inSingle && !inDouble && !inBack) {
      if (ch === '/' && next === '/') {
        return line.substring(0, i).replace(/\s+$/,'');
      }
    }
    if (ch === "'" && !inDouble && !inBack) inSingle = !inSingle;
    if (ch === '"' && !inSingle && !inBack) inDouble = !inDouble;
    if (ch === '`' && !inSingle && !inDouble) inBack = !inBack;
  }
  return line;
}

let changed = 0;
for (const f of files) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    let modified = false; const out = [];
    for (const l of lines) {
      const trimmed = l.trimStart();
      if (trimmed.startsWith('//')) { out.push(l); continue; }
      const newLine = stripInline(l);
      if (newLine !== l) modified = true;
      out.push(newLine);
    }
    if (modified) {
      fs.writeFileSync(f + '.bak', content, 'utf8');
      fs.writeFileSync(f, out.join('\n'), 'utf8');
      console.log('Edited', f);
      changed++;
    }
  } catch (err) { console.error('Error', f, err.message); }
}
console.log('Done. Files changed:', changed);
