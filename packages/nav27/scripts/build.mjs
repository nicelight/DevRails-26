import { build } from 'tsdown';
import { execFileSync } from 'node:child_process';
import { decoratorPlugin } from '@deepseek-ai/dsh-typert-generator/tsdown';
import { compile } from 'svelte/compiler';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './resources.mjs';
import { generateRemote } from './remote.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
rmSync(resolve(root, 'lib'), { recursive: true, force: true });
execFileSync(process.execPath, [fileURLToPath(import.meta.resolve('typescript/bin/tsc')), '-p', 'tsconfig.host.json'], { stdio: 'inherit' });
await build({ entry: { index: 'src/index.ts', role: 'src/role.ts', types: 'src/types.ts' }, outDir: 'lib', clean: false, dts: false, format: 'esm', fixedExtension: false, target: 'es2024', platform: 'node', plugins: [decoratorPlugin()] });
generateRemote(root);
// Native dynamic clients are registered factory scripts, not standalone ESM.
await build({ entry: { client: 'src/client.ts' }, outDir: 'lib', clean: false, dts: false, format: 'cjs', fixedExtension: false, target: 'es2022', platform: 'browser', deps: { alwaysBundle: [/.*/], onlyBundle: false }, outputOptions: {
  entryFileNames: 'client.js',
  banner: 'window.__ModuleLoader__.load({ id: "devrails-nav27", factory: (require) => {',
  intro: 'var module = { exports: {} }; var exports = module.exports;',
  footer: 'return module.exports; } });',
} });
await build({ entry: { app: 'src/web.ts' }, alias: Object.fromEntries(['@deepseek-ai/dsh-client-connection/client', '@deepseek-ai/dsh-api-gateway/client', '@deepseek-ai/dsh-typert-registry/client', '@deepseek-ai/dsh-api-session-controller/client'].map(name => [name, fileURLToPath(import.meta.resolve(name)).replace(/dsh-api-session-controller\/lib\/client\.js$/, 'dsh-api-session-controller/lib/types/client/transport.js')])), outDir: 'lib/web', clean: true, dts: false, format: 'esm', fixedExtension: false, target: 'es2022', platform: 'browser', deps: { alwaysBundle: [/.*/], onlyBundle: false }, plugins: [{
  name: 'svelte', transform: { filter: { id: /\.svelte$/ }, handler(code, id) {
    const result = compile(code, { filename: id, generate: 'client', css: 'injected' });
    return { code: result.js.code, map: result.js.map };
  } },
}] });
mkdirSync(resolve(root, 'lib/web'), { recursive: true });
writeFileSync(resolve(root, 'lib/web/index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><script type="module" src="./app.js"></script></html>');
