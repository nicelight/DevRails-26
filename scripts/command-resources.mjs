import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const COMMAND_SPECS_REL = join('skills', '_shared', 'references', 'commands');
const WEB_DESIGN_REVIEWER_PACK = {
  sourceRel: join(
    'skills',
    '_shared',
    'references',
    'semantic-packs',
    'web-design-reviewer.md',
  ),
  targetRel: join('references', 'web-design-reviewer.md'),
};
const FINDING_ADJUDICATION_PACK = {
  sourceRel: join(
    'skills',
    '_shared',
    'references',
    'semantic-packs',
    'finding-adjudication.md',
  ),
  targetRel: join('references', 'finding-adjudication.md'),
};
const CODE_REVIEWER_PROMPT = {
  sourceRel: join('skills', '_shared', 'agents', 'review-code.md'),
  targetRel: join('agents', 'review-code.md'),
};
const sharedAgent = (filename) => ({
  sourceRel: join('skills', '_shared', 'agents', filename),
  targetRel: join('agents', filename),
});
const sharedReference = (filename) => ({
  sourceRel: join('skills', '_shared', 'references', filename),
  targetRel: join('references', filename),
});
const COMMAND_RESOURCE_SPECS = new Map([
  ['map-codebase', [sharedAgent('repo-scanner.md')]],
  ['mb-garden', [sharedAgent('mb-reviewer.md'), sharedReference('recovery-plan.md')]],
  ['spec-design', [
    sharedReference('adr-template.md'),
    sharedReference('concept-architecture-template.md'),
    sharedReference('concept-guide-template.md'),
  ]],
  ['spec-redesign', [sharedReference('adr-template.md')]],
  ['red-verify', [WEB_DESIGN_REVIEWER_PACK, FINDING_ADJUDICATION_PACK]],
  ['review-feat-plan', [FINDING_ADJUDICATION_PACK, sharedAgent('review-scope.md')]],
  ['review-tasks-plan', [
    FINDING_ADJUDICATION_PACK,
    sharedAgent('review-plan.md'),
    sharedAgent('review-security.md'),
  ]],
  ['verify', [
    WEB_DESIGN_REVIEWER_PACK,
    FINDING_ADJUDICATION_PACK,
    CODE_REVIEWER_PROMPT,
  ]],
]);
const LEGACY_ALIAS_COMMANDS = new Set(['find-skill']);

function listMarkdownFiles(absDir) {
  return readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
}

function extractFrontmatterDescription(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const lines = match[1].split(/\r?\n/);
  const descriptionIndex = lines.findIndex((line) => /^description:\s*/.test(line));
  if (descriptionIndex === -1) return null;

  const value = lines[descriptionIndex].replace(/^description:\s*/, '').trim();
  if (/^[>|][-+]?$/.test(value)) {
    const block = [];
    for (let i = descriptionIndex + 1; i < lines.length; i += 1) {
      if (lines[i].length > 0 && !/^\s/.test(lines[i])) break;
      block.push(lines[i].trim());
    }
    return block.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() || null;
  }

  return value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

export function resolveCommandSpecs(preparedRepo) {
  const commandDir = join(preparedRepo, COMMAND_SPECS_REL);
  if (!existsSync(commandDir)) {
    throw new Error(`Missing command specs in prepared repository: ${commandDir}`);
  }

  return listMarkdownFiles(commandDir)
    .map((filename) => {
      const name = filename.replace(/\.md$/i, '');
      const absPath = join(commandDir, filename);
      const content = readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');

      return {
        name,
        filename,
        content,
        desc: extractFrontmatterDescription(content) || `/${name}`,
        resources: (COMMAND_RESOURCE_SPECS.get(name) || []).map(({ sourceRel, targetRel }) => {
          const sourcePath = join(preparedRepo, sourceRel);
          if (!existsSync(sourcePath)) {
            throw new Error(`Missing runtime skill resource: ${sourcePath}`);
          }
          return {
            targetRel,
            content: readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n'),
          };
        }),
      };
    })
    .filter(({ name }) => !LEGACY_ALIAS_COMMANDS.has(name));
}

