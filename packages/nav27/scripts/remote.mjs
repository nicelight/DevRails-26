import { mkdtempSync, cpSync, mkdirSync, writeFileSync, rmSync, symlinkSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorkspaceAnalyzer, FaceModelEmitter, writePackageArtifacts } from '@deepseek-ai/dsh-typert-generator';

/** Register the installed protocol's public declarations for native Typert analysis.
 * The generator recognizes protocol symbols only inside its workspace inventory.
 * This staging directory is build-only; runtime consumes unmodified npm packages.
 */
export function generateRemote(packageRoot) {
  const stage = mkdtempSync(join(tmpdir(), 'nav27-typert-'));
  try {
    const nav = join(stage, 'packages/nav27');
    const protocol = join(stage, 'packages/protocol');
    mkdirSync(nav, { recursive: true }); mkdirSync(protocol, { recursive: true });
    cpSync(join(packageRoot, 'src'), join(nav, 'src'), { recursive: true });
    cpSync(join(packageRoot, 'package.json'), join(nav, 'package.json'));
    const protocolRoot = dirname(fileURLToPath(import.meta.resolve('@deepseek-ai/dsh-typert-protocol/package.json')));
    cpSync(join(protocolRoot, 'lib/types'), join(protocol, 'src'), { recursive: true, filter: path => !path.endsWith('.js') && !path.endsWith('.map') });
    writeFileSync(join(protocol, 'package.json'), JSON.stringify({ name: '@deepseek-ai/dsh-typert-protocol', type: 'module', exports: { '.': './src/index.d.ts' } }));
    symlinkSync(resolve(packageRoot, '../../node_modules'), join(stage, 'node_modules'), 'dir');
    const options = { target: 'ES2024', module: 'NodeNext', moduleResolution: 'NodeNext', allowJs: true, strict: true, skipLibCheck: true, types: [], baseUrl: '.', paths: { '@deepseek-ai/dsh-typert-protocol': ['./packages/protocol/src/index.d.ts'] } };
    writeFileSync(join(stage, 'tsconfig.host.json'), JSON.stringify({ compilerOptions: options, files: [], references: [{ path: './packages/nav27/tsconfig.host.json' }, { path: './packages/protocol/tsconfig.host.json' }] }));
    writeFileSync(join(nav, 'tsconfig.host.json'), JSON.stringify({ extends: '../../tsconfig.host.json', include: ['src/index.ts', 'src/adapter.ts', 'src/role.ts', 'src/*.mjs'], references: [] }));
    writeFileSync(join(protocol, 'tsconfig.host.json'), JSON.stringify({ extends: '../../tsconfig.host.json', include: ['src/**/*.d.ts'], references: [] }));
    const model = new WorkspaceAnalyzer({ root: stage, packages: ['devrails-nav27'], faces: ['host'], checkDiagnostics: false }).analyze();
    const artifacts = model.faces.map(face => ({ ...new FaceModelEmitter(face).emit('devrails-nav27'), packageRoot: 'packages/nav27' }));
    writePackageArtifacts(packageRoot, artifacts);
  } finally { rmSync(stage, { recursive: true, force: true }); }
}
