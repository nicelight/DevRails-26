/**
 * Owns raw filesystem, path, JSON, and text access for mb-doctor.
 * Does not interpret workflow state or emit findings.
 * Preserve traversal order, normalization, and read-error semantics.
 */

import fs from 'node:fs';
import path from 'node:path';

export function createReaders(root) {
  function absolute(...parts) {
    return path.join(root, ...parts);
  }

  function joinRelative(...parts) {
    return normalizeRel(path.join(...parts));
  }

  function relativeFromRoot(absPath) {
    return normalizeRel(path.relative(root, absPath));
  }

  function basename(absPath) {
    return path.basename(absPath);
  }

  function basenameWithoutExtension(absPath) {
    return path.basename(absPath, path.extname(absPath));
  }

  function readText(absPath) {
    return fs.readFileSync(absPath, 'utf8');
  }

  function readJson(rel) {
    const abs = absolute(rel);
    if (!isFile(abs)) {
      return { ok: false, message: `${rel} not found.` };
    }
    try {
      return { ok: true, value: JSON.parse(readText(abs)) };
    } catch (err) {
      return { ok: false, message: `${rel} is not valid JSON: ${err.message}` };
    }
  }

  function isFile(absPath) {
    try {
      return fs.statSync(absPath).isFile();
    } catch {
      return false;
    }
  }

  function isDirectory(absPath) {
    try {
      return fs.statSync(absPath).isDirectory();
    } catch {
      return false;
    }
  }

  function listFiles(absDir) {
    if (!fs.existsSync(absDir)) return [];
    const files = [];
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const full = path.join(absDir, entry.name);
      if (entry.isDirectory()) {
        files.push(...listFiles(full));
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
    return files;
  }

  return {
    absolute,
    basename,
    basenameWithoutExtension,
    isDirectory,
    isFile,
    joinRelative,
    listFiles,
    readJson,
    readText,
    relativeFromRoot,
  };
}

export function splitLines(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0);
}

export function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeRel(value) {
  return value.replace(/\\/g, '/');
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
