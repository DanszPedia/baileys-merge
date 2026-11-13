'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', '.git']);
const extensions = new Set(['.js', '.mjs', '.cjs']);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(path.join(directory, entry.name));
      continue;
    }
    if (extensions.has(path.extname(entry.name))) files.push(path.join(directory, entry.name));
  }
}

walk(root);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`\nSyntax error: ${path.relative(root, file)}\n`);
    process.stderr.write(result.stderr || result.stdout || 'Unknown Node.js syntax error\n');
  }
}

if (failed) process.exit(1);
console.log(`Syntax check passed for ${files.length} JavaScript files.`);
