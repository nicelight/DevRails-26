#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const skillsRoot = join(repoRoot, 'skills');
const sharedRoot = join(skillsRoot, '_shared');
const args = process.argv.slice(2);
const allowInPlace = args.includes('--in-place') || process.env.MEMOBANK_VENDOR_SHARED_ALLOW === '1';

if (!allowInPlace) {
  console.error(
    'Refusing in-place shared vendoring. Use scripts/install-framework.mjs for normal install flow, or pass --in-place explicitly.',
  );
  process.exit(1);
}

if (!existsSync(sharedRoot)) {
  console.error(`Missing shared source: ${sharedRoot}`);
  process.exit(1);
}

function flattenReferenceName(referenceFile) {
  const rel = relative(join(sharedRoot, 'references'), referenceFile);
  return `shared-${rel.replace(/[\\/]/g, '-')}`;
}

function removeGeneratedSharedFiles(dir) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.startsWith('shared-')) {
      rmSync(join(dir, entry.name), { force: true });
    }
  }
}

const skillDirs = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
  .map((entry) => join(skillsRoot, entry.name))
  .filter((dir) => existsSync(join(dir, 'SKILL.md')));

for (const skillDir of skillDirs) {
  rmSync(join(skillDir, '_shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'agents', '_shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'references', '_shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'scripts', '_shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'agents', 'shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'references', 'shared'), { recursive: true, force: true });
  rmSync(join(skillDir, 'scripts', 'shared'), { recursive: true, force: true });

  const agentsDir = join(skillDir, 'agents');
  const referencesDir = join(skillDir, 'references');
  const scriptsDir = join(skillDir, 'scripts');

  removeGeneratedSharedFiles(agentsDir);
  removeGeneratedSharedFiles(referencesDir);
  removeGeneratedSharedFiles(scriptsDir);

  mkdirSync(agentsDir, { recursive: true });
  mkdirSync(referencesDir, { recursive: true });
  mkdirSync(scriptsDir, { recursive: true });

  for (const entry of readdirSync(join(sharedRoot, 'agents'), { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    copyFileSync(
      join(sharedRoot, 'agents', entry.name),
      join(agentsDir, `shared-${entry.name}`),
    );
  }

  const referenceQueue = [join(sharedRoot, 'references')];
  while (referenceQueue.length) {
    const current = referenceQueue.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        referenceQueue.push(abs);
        continue;
      }
      copyFileSync(abs, join(referencesDir, flattenReferenceName(abs)));
    }
  }

  for (const entry of readdirSync(join(sharedRoot, 'scripts'), { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    copyFileSync(
      join(sharedRoot, 'scripts', entry.name),
      join(scriptsDir, `shared-${entry.name}`),
    );
  }
}

console.log(`Vendored shared assets into standard skill dirs for ${skillDirs.length} skills.`);
