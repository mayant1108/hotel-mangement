import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const [, , appDirArg, outputArg] = process.argv;

if (!appDirArg || !outputArg) {
  console.error('Usage: node build-tailwind.mjs <appDir> <outputFile>');
  process.exit(1);
}

const appDir = path.resolve(process.cwd(), appDirArg);
const outputFile = path.resolve(process.cwd(), outputArg);

const scanTargets = ['src', 'context', 'hooks', 'services', 'public', 'index.html'];
const candidatePattern = /-?[_a-zA-Z]+[_a-zA-Z0-9\-:/.[\]%!#]*/g;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(targetPath) {
  const stats = await fs.stat(targetPath);

  if (stats.isFile()) {
    return [targetPath];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
      continue;
    }

    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (/\.(html|js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractCandidates(content) {
  return content.match(candidatePattern) ?? [];
}

async function buildCandidates() {
  const candidates = new Set();

  for (const target of scanTargets) {
    const resolvedTarget = path.join(appDir, target);
    if (!(await pathExists(resolvedTarget))) {
      continue;
    }

    const files = await collectFiles(resolvedTarget);
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      for (const candidate of extractCandidates(content)) {
        candidates.add(candidate);
      }
    }
  }

  return [...candidates];
}

async function main() {
  const { compile } = require(require.resolve('tailwindcss', { paths: [appDir] }));
  const tailwindEntry = require.resolve('tailwindcss/index.css', { paths: [appDir] });
  const css = await fs.readFile(tailwindEntry, 'utf8');
  const compiler = await compile(css, {
    from: tailwindEntry,
    base: appDir,
  });

  const output = compiler
    .build(await buildCandidates())
    .replaceAll('calc(infinity * 1px)', '9999px');
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, output, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
