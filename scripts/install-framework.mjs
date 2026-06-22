#!/usr/bin/env node

import {
  accessSync,
  constants,
  cpSync,
  existsSync,
  readFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const args = process.argv.slice(2);
const DEFAULT_SKILLS_ADD_ARGS = ['--skill', '*', '--yes'];
const SKILLS_LOCK_FILE = 'skills-lock.json';
const MAX_PICKER_ENTRIES = 25;
const PREPARE_EXCLUDED_ROOTS = new Set([
  '.agents',
  '.claude',
  '.codex',
  '.memory-bank',
  '.protocols',
  '.tasks',
  'node_modules',
  '.git',
]);
const SPLASH_GRADIENT_STOPS = [
  [5, 18, 48],
  [0, 188, 255],
  [226, 234, 242],
];
const SPLASH_MUTED_COLOR = [84, 117, 145];
const SPLASH_LOGO_LINE_PATTERN = /[█╗╔║╝╚═]/u;
const SPLASH_ART = `·───○ init ───────╮        ╭────── task.json ──○────── verify ──·
    │             │        │                    │
    ○ scan ──◇── context ──○── plan ──◇── execute ──○── sync
    │             │        │                    │
·───○ agents ─────╯        ╰────── evidence ───○────── index ──·


███╗   ███╗███████╗███╗   ███╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
████╗ ████║██╔════╝████╗ ████║██╔═══██╗      ██╔════╝██║     ██╔═══██╗██║    ██║
██╔████╔██║█████╗  ██╔████╔██║██║   ██║█████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝      ██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝       ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 

        source-only skills · durable context · BMAD + SDD · agent workflow


·───○ PRD ──◇── tasks ──○── T0/T1 compact ──◇── T2/T3 protocol ──○── red-verify ──·`;
const INTERNAL_FLAGS = new Set([
  '--bootstrap',
  '--bootstrap-only',
  '--install-only',
  '--no-tui',
  '--sync',
  '--target',
]);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
memobank install-framework

Usage:
  node scripts/install-framework.mjs
  node scripts/install-framework.mjs [skills add options]

Examples:
  node scripts/install-framework.mjs
  node scripts/install-framework.mjs --skill '*' --yes
  node scripts/install-framework.mjs --skill cold-start --global --yes
  node scripts/install-framework.mjs --bootstrap --target ./my-project --yes

No options starts the interactive installer. Explicit skills add options keep the
legacy install-only flow.

The repository is source-only. This wrapper copies the repo to a temporary
directory, runs scripts/vendor-shared.mjs there, then calls:
  npx -y skills add <prepared-temp-repo> [options]
`.trim());
  process.exit(0);
}

if (!existsSync(join(repoRoot, 'scripts', 'vendor-shared.mjs'))) {
  console.error(`Missing vendor script in ${repoRoot}`);
  process.exit(1);
}

function hasArg(flag) {
  return args.includes(flag);
}

function readArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }
  return value;
}

function isInternalArgAt(index) {
  const value = args[index];
  return INTERNAL_FLAGS.has(value);
}

function collectSkillsAddArgs({ defaultSkillAll = false } = {}) {
  const addArgs = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--target') {
      i += 1;
      continue;
    }

    if (isInternalArgAt(i)) continue;
    addArgs.push(args[i]);
  }

  const hasSkillSelection = addArgs.some((arg) => arg === '--skill' || arg.startsWith('--skill='));
  if (hasSkillSelection || !defaultSkillAll) return addArgs;

  const withDefaultSkill = ['--skill', '*', ...addArgs];
  return withDefaultSkill.includes('--yes') ? withDefaultSkill : [...withDefaultSkill, '--yes'];
}

function isWindowsCommandShim(command) {
  return process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(command);
}

function spawnInstallerCommand(command, commandArgs, options) {
  if (!isWindowsCommandShim(command)) {
    return spawnSync(command, commandArgs, options);
  }

  return spawnSync(
    process.env.ComSpec || 'cmd.exe',
    ['/d', '/s', '/c', 'call', command, ...commandArgs],
    options,
  );
}

function run(command, commandArgs, options = {}) {
  const result = spawnInstallerCommand(command, commandArgs, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function runCapture(command, commandArgs, options = {}) {
  return spawnInstallerCommand(command, commandArgs, {
    encoding: 'utf8',
    ...options,
  });
}

function canUseColor(stream = process.stdout) {
  return Boolean(stream.isTTY && !process.env.NO_COLOR && process.env.TERM !== 'dumb');
}

function interpolateColor(from, to, ratio) {
  return from.map((value, index) => Math.round(value + ((to[index] - value) * ratio)));
}

function interpolateGradient(stops, ratio) {
  if (stops.length <= 1) return stops[0] || [255, 255, 255];

  const boundedRatio = Math.min(1, Math.max(0, ratio));
  const segmentCount = stops.length - 1;
  const scaledRatio = boundedRatio * segmentCount;
  const segmentIndex = Math.min(Math.floor(scaledRatio), segmentCount - 1);
  const segmentRatio = scaledRatio - segmentIndex;

  return interpolateColor(stops[segmentIndex], stops[segmentIndex + 1], segmentRatio);
}

function colorizeSplashLogoLine(line) {
  const chars = Array.from(line);
  const maxIndex = Math.max(1, chars.length - 1);

  return chars.map((char, index) => {
    if (char === ' ') return '\x1b[0m ';

    const [red, green, blue] = interpolateGradient(SPLASH_GRADIENT_STOPS, index / maxIndex);
    return `\x1b[38;2;${red};${green};${blue}m${char}`;
  }).join('') + '\x1b[0m';
}

function colorizeSplashArt(art) {
  if (!canUseColor()) return art;

  const lines = art.split('\n');
  const [mutedRed, mutedGreen, mutedBlue] = SPLASH_MUTED_COLOR;

  return lines.map((line) => {
    if (!line.length) return line;

    if (SPLASH_LOGO_LINE_PATTERN.test(line)) return colorizeSplashLogoLine(line);

    return `\x1b[38;2;${mutedRed};${mutedGreen};${mutedBlue}m${line}\x1b[0m`;
  }).join('\n');
}

function prepareRepository() {
  const tempRoot = mkdtempSync(join(tmpdir(), 'memobank-skills-'));
  const preparedRepo = join(tempRoot, 'repo');

  cpSync(repoRoot, preparedRepo, {
    recursive: true,
    filter: (source) => {
      const rel = resolve(source).slice(repoRoot.length + 1);
      const root = rel.split(/[\\/]/)[0];
      return !PREPARE_EXCLUDED_ROOTS.has(root);
    },
  });

  run(process.execPath, ['scripts/vendor-shared.mjs'], {
    cwd: preparedRepo,
    env: { ...process.env, MEMOBANK_VENDOR_SHARED_ALLOW: '1' },
  });

  return { tempRoot, preparedRepo };
}

function cleanupTemp(tempRoot, preparedRepo) {
  if (!process.env.MEMOBANK_KEEP_INSTALL_TMP) {
    rmSync(tempRoot, { recursive: true, force: true });
    return;
  }

  console.log(`Prepared repository kept at: ${preparedRepo}`);
}

function installSkills(preparedRepo, targetRepo, addArgs) {
  run(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['-y', 'skills', 'add', preparedRepo, ...addArgs],
    { cwd: targetRepo },
  );
}

function snapshotFile(filePath) {
  if (!existsSync(filePath)) return { existed: false, content: null };
  return { existed: true, content: readFileSync(filePath) };
}

function restoreFile(filePath, snapshot) {
  if (snapshot.existed) {
    writeFileSync(filePath, snapshot.content);
    return;
  }

  rmSync(filePath, { force: true });
}

function bootstrapTarget(preparedRepo, targetRepo, syncMode) {
  const initScript = join(preparedRepo, 'skills', 'mb-init', 'scripts', 'shared-init-mb.js');
  if (!existsSync(initScript)) {
    console.error(`Missing bootstrap script in prepared repository: ${initScript}`);
    process.exit(1);
  }

  const initArgs = syncMode ? [initScript, '--sync'] : [initScript];
  run(process.execPath, initArgs, { cwd: targetRepo });
}

function isWritableDirectory(targetRepo) {
  try {
    accessSync(targetRepo, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function findExistingParent(targetRepo) {
  let current = resolve(targetRepo);
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
  return current;
}

function isWritableTargetPath(targetRepo) {
  if (existsSync(targetRepo)) {
    try {
      return statSync(targetRepo).isDirectory() && isWritableDirectory(targetRepo);
    } catch {
      return false;
    }
  }

  const parent = findExistingParent(targetRepo);
  if (!parent) return false;

  try {
    return statSync(parent).isDirectory() && isWritableDirectory(parent);
  } catch {
    return false;
  }
}

function gitStatus(targetRepo) {
  if (!existsSync(targetRepo)) {
    return { isRepo: false, clean: null, summary: 'will be created' };
  }

  const inside = runCapture('git', ['-C', targetRepo, 'rev-parse', '--is-inside-work-tree']);
  if (inside.status !== 0 || inside.stdout.trim() !== 'true') {
    return { isRepo: false, clean: null, summary: 'not a git repository' };
  }

  const status = runCapture('git', ['-C', targetRepo, 'status', '--short']);
  if (status.status !== 0) {
    return { isRepo: true, clean: null, summary: 'git status unavailable' };
  }

  const output = status.stdout.trim();
  return {
    isRepo: true,
    clean: output.length === 0,
    summary: output.length === 0 ? 'git repository, clean' : 'git repository, has uncommitted changes',
  };
}

function inspectTarget(targetRepo) {
  const exists = existsSync(targetRepo);
  const isDirectory = exists ? statSync(targetRepo).isDirectory() : false;
  const memoryBankExists = isDirectory && existsSync(join(targetRepo, '.memory-bank'));
  const agentsExists = isDirectory && existsSync(join(targetRepo, 'AGENTS.md'));

  return {
    exists,
    isDirectory,
    memoryBankExists,
    agentsExists,
    git: gitStatus(targetRepo),
    writable: isWritableTargetPath(targetRepo),
  };
}

function ensureTargetDirectory(targetRepo, { assumeYes, interactive }) {
  if (!existsSync(targetRepo)) {
    if (!assumeYes && !interactive) {
      console.error(`Target does not exist: ${targetRepo}`);
      process.exit(1);
    }
    mkdirSync(targetRepo, { recursive: true });
    console.log(`Created target directory: ${targetRepo}`);
  }

  if (!statSync(targetRepo).isDirectory()) {
    console.error(`Target is not a directory: ${targetRepo}`);
    process.exit(1);
  }

  if (!isWritableDirectory(targetRepo)) {
    console.error(`Target is not writable: ${targetRepo}`);
    process.exit(1);
  }
}

async function askYesNo(rl, label, defaultYes = false) {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = (await rl.question(`${label} ${suffix}: `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  if (['y', 'yes', 'д', 'да'].includes(answer)) return true;
  if (['n', 'no', 'н', 'нет'].includes(answer)) return false;
  return false;
}

function gitSummaryRu(git) {
  if (git.summary === 'will be created') return 'папка будет создана';
  if (!git.isRepo) return 'git-репозиторий не найден';
  if (git.clean === true) return 'git-репозиторий, изменений нет';
  if (git.clean === false) return 'git-репозиторий, есть несохраненные изменения';
  return 'git-статус недоступен';
}

function printTargetInspection(targetRepo, inspection) {
  console.log('\nПроверка проекта');
  console.log(`  Путь: ${targetRepo}`);
  console.log(`  Папка: ${inspection.exists ? 'существует' : 'будет создана'}`);
  console.log(`  Git: ${gitSummaryRu(inspection.git)}`);
  console.log(`  Доступ для записи: ${inspection.writable ? 'да' : 'нет'}`);
  console.log(`  .memory-bank/: ${inspection.memoryBankExists ? 'найден' : 'не найден'}`);
  console.log(`  AGENTS.md: ${inspection.agentsExists ? 'найден' : 'не найден'}`);
}

function pickerStartDirectory() {
  const cwd = resolve(process.cwd());
  return cwd === repoRoot ? dirname(cwd) : cwd;
}

function readDirectoryChoices(openDir) {
  try {
    const dirs = readdirSync(openDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, 'ru'));

    return {
      dirs: dirs.slice(0, MAX_PICKER_ENTRIES),
      hiddenCount: Math.max(0, dirs.length - MAX_PICKER_ENTRIES),
      error: null,
    };
  } catch (error) {
    return { dirs: [], hiddenCount: 0, error };
  }
}

function printFolderPicker(openDir, choices) {
  console.log('\nВыберите папку проекта');
  console.log(`Открыта: ${openDir}`);

  if (choices.error) {
    console.log('  Не удалось прочитать список папок.');
  } else if (choices.dirs.length === 0) {
    console.log('  Внутри нет папок.');
  } else {
    choices.dirs.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    if (choices.hiddenCount > 0) {
      console.log(`  ... еще ${choices.hiddenCount}`);
    }
  }

  console.log('\nКоманды: номер = открыть, .. или u = вверх, s = выбрать открытую, p = ввести путь, n = новая папка, q = отмена');
}

function resolvePickerInput(openDir, input, choices) {
  const number = Number(input);
  if (!Number.isInteger(number) || number < 1 || number > choices.dirs.length) return null;
  return join(openDir, choices.dirs[number - 1]);
}

function printInvalidPickerNumber(input, choices) {
  if (choices.dirs.length === 0) {
    console.log('Список пуст. Используйте .., s, p, n или q.');
    return;
  }

  console.log(`Нет пункта ${input}. В этой папке доступны пункты 1..${choices.dirs.length}.`);
}

async function createFolderInPicker(rl, openDir) {
  const name = (await rl.question('Имя новой папки: ')).trim();
  if (!name) {
    console.log('Имя не задано.');
    return openDir;
  }

  if (name === '.' || name === '..' || name.includes('/') || name.includes('\\')) {
    console.log('Введите только имя папки без пути.');
    return openDir;
  }

  const newDir = join(openDir, name);
  if (existsSync(newDir) && !statSync(newDir).isDirectory()) {
    console.log('Такой путь уже существует, но это не папка.');
    return openDir;
  }

  mkdirSync(newDir, { recursive: true });
  console.log(`Создана папка: ${newDir}`);
  return newDir;
}

async function pickTargetDirectory(rl) {
  let openDir = pickerStartDirectory();

  while (true) {
    const choices = readDirectoryChoices(openDir);
    printFolderPicker(openDir, choices);

    const input = (await rl.question('\nВаш выбор: ')).trim();
    const normalized = input.toLowerCase();

    if (normalized === 'q') {
      console.log('Установка отменена.');
      process.exit(1);
    }

    if (normalized === '..' || normalized === 'u') {
      openDir = dirname(openDir);
      continue;
    }

    if (normalized === 's') return openDir;

    if (normalized === 'p') {
      const manualPath = (await rl.question('Введите путь к проекту: ')).trim();
      if (!manualPath) {
        console.log('Путь не задан.');
        continue;
      }
      return resolve(manualPath);
    }

    if (normalized === 'n') {
      openDir = await createFolderInPicker(rl, openDir);
      continue;
    }

    const selectedDir = resolvePickerInput(openDir, normalized, choices);
    if (selectedDir) {
      openDir = selectedDir;
      continue;
    }

    if (/^\d+$/.test(normalized)) {
      printInvalidPickerNumber(normalized, choices);
      continue;
    }

    console.log('Не понял выбор. Введите номер или команду из списка.');
  }
}

async function interactiveInstall() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error('Interactive installer requires a TTY. Use --bootstrap --target <path> --yes for non-interactive setup.');
    process.exit(1);
  }

  console.log(colorizeSplashArt(SPLASH_ART));
  console.log('Установщик memobank');
  console.log('Выберите папку проекта, подтвердите установку, затем дождитесь завершения.');

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const targetRepo = await pickTargetDirectory(rl);
    const inspection = inspectTarget(targetRepo);

    if (inspection.exists && !inspection.isDirectory) {
      console.error(`Выбранный путь существует, но это не папка: ${targetRepo}`);
      process.exit(1);
    }

    printTargetInspection(targetRepo, inspection);

    if (!inspection.writable) {
      console.error('\nНет доступа для записи. Выберите другую папку и запустите установку снова.');
      process.exit(1);
    }

    const warnings = [];
    if (!inspection.exists) warnings.push('Папка будет создана.');
    if (!inspection.git.isRepo && inspection.exists) warnings.push('Git-репозиторий не найден. Это не блокирует установку.');
    if (inspection.git.clean === false) warnings.push('Есть несохраненные git-изменения. Установка продолжится только после подтверждения.');
    if (inspection.agentsExists) {
      warnings.push('AGENTS.md уже есть. Пользовательский файл не будет перезаписан.');
    }
    if (inspection.memoryBankExists) {
      warnings.push('.memory-bank/ уже есть. Будет выполнено обновление существующей установки.');
    }

    if (warnings.length > 0) {
      console.log('\nПредупреждения');
      warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    const confirmed = await askYesNo(rl, '\nПродолжить установку?', false);
    if (!confirmed) {
      console.log('Установка отменена.');
      process.exit(1);
    }

    ensureTargetDirectory(targetRepo, { assumeYes: true, interactive: true });

    await runInstallFlow({
      targetRepo,
      addArgs: DEFAULT_SKILLS_ADD_ARGS,
      install: true,
      bootstrap: true,
      syncMode: inspection.memoryBankExists,
      interactive: true,
    });
  } finally {
    rl.close();
  }
}

async function runInstallFlow({ targetRepo, addArgs, install, bootstrap, syncMode, interactive = false }) {
  let tempRoot;
  let preparedRepo;
  const restoreSourceLock = install && !bootstrap && resolve(targetRepo) === repoRoot;
  const sourceLockPath = join(repoRoot, SKILLS_LOCK_FILE);
  const sourceLockSnapshot = restoreSourceLock ? snapshotFile(sourceLockPath) : null;

  try {
    console.log('\n[1/3] Подготовка установщика...');
    ({ tempRoot, preparedRepo } = prepareRepository());

    if (install) {
      console.log('\n[2/3] Установка команд...');
      installSkills(preparedRepo, targetRepo, addArgs);
      if (sourceLockSnapshot) restoreFile(sourceLockPath, sourceLockSnapshot);
    } else {
      console.log('\n[2/3] Установка команд пропущена.');
    }

    if (bootstrap) {
      console.log(`\n[3/3] ${syncMode ? 'Обновление Memory Bank...' : 'Создание Memory Bank...'}`);
      bootstrapTarget(preparedRepo, targetRepo, syncMode);
    } else {
      console.log('\n[3/3] Создание Memory Bank пропущено.');
    }

    console.log('\nУстановка завершена.');
    console.log(`  Путь проекта: ${targetRepo}`);
    console.log(`  Команды: ${install ? 'установлены' : 'не менялись'}`);
    console.log(`  Memory Bank: ${bootstrap ? (syncMode ? 'обновлен' : 'создан') : 'не менялся'}`);
    if (bootstrap) console.log('  Следующий шаг: /cold-start');
  } finally {
    if (tempRoot && preparedRepo) cleanupTemp(tempRoot, preparedRepo);
    if (interactive) {
      console.log('');
    }
  }
}

async function main() {
  if (args.length === 0) {
    await interactiveInstall();
    return;
  }

  const targetRepo = resolve(readArgValue('--target') || process.cwd());
  const bootstrapRequested = hasArg('--bootstrap') || hasArg('--bootstrap-only');
  const bootstrapOnly = hasArg('--bootstrap-only');
  const installOnly = hasArg('--install-only');
  const explicitNoTui = hasArg('--no-tui');
  const install = !bootstrapOnly;
  const bootstrap = bootstrapRequested && !installOnly;
  const addArgs = collectSkillsAddArgs({ defaultSkillAll: bootstrapRequested || explicitNoTui || installOnly });

  if (bootstrapOnly && installOnly) {
    console.error('Use only one of --bootstrap-only or --install-only.');
    process.exit(1);
  }

  if (explicitNoTui && !bootstrapRequested && !installOnly) {
    if (hasArg('--target')) {
      ensureTargetDirectory(targetRepo, { assumeYes: hasArg('--yes'), interactive: false });
    }
    await runInstallFlow({
      targetRepo,
      addArgs,
      install: true,
      bootstrap: false,
      syncMode: false,
    });
    return;
  }

  if (!bootstrapRequested) {
    if (hasArg('--target')) {
      ensureTargetDirectory(targetRepo, { assumeYes: hasArg('--yes'), interactive: false });
    }
    await runInstallFlow({
      targetRepo,
      addArgs,
      install: true,
      bootstrap: false,
      syncMode: false,
    });
    return;
  }

  ensureTargetDirectory(targetRepo, { assumeYes: hasArg('--yes'), interactive: false });
  const inspection = inspectTarget(targetRepo);
  printTargetInspection(targetRepo, inspection);

  if (!hasArg('--yes')) {
    console.error('\nNon-interactive bootstrap requires --yes after reviewing target warnings.');
    process.exit(1);
  }

  if (inspection.agentsExists) {
    console.log('Warning: AGENTS.md already exists. Bootstrap will not overwrite a custom AGENTS.md.');
  }
  if (inspection.memoryBankExists) {
    console.log('Warning: .memory-bank/ already exists; generated assets will be synced.');
  }

  await runInstallFlow({
    targetRepo,
    addArgs,
    install,
    bootstrap,
    syncMode: hasArg('--sync') || inspection.memoryBankExists,
  });
}

await main();
