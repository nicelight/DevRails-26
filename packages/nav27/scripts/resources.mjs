import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCommandSpecs } from '../../../scripts/command-resources.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const destination = resolve(root, 'packages/nav27/resources');
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, 'package.json'), JSON.stringify({ type: 'commonjs' }));
const specs = resolveCommandSpecs(root);
writeFileSync(join(destination, 'commands.json'), JSON.stringify(specs.map(spec => ({ name: spec.name, resources: spec.resources.map(resource => resource.targetRel) }))));
for (const spec of specs) {
  const directory = join(destination, 'commands', spec.name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'SKILL.md'), spec.content);
  for (const resource of spec.resources) {
    const path = join(directory, resource.targetRel);
    mkdirSync(resolve(path, '..'), { recursive: true });
    writeFileSync(path, resource.content);
  }
}
// Keep the generator's source layout: it resolves its canonical inputs and doctor assets here.
cpSync(join(root, 'skills/_shared'), join(destination, 'skills/_shared'), { recursive: true });
cpSync(join(root, 'skills/mb-garden/assets'), join(destination, 'skills/mb-garden/assets'), { recursive: true });
