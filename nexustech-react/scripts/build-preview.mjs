import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'vite';

const result = await build({
  mode: 'standalone',
  logLevel: 'error',
  build: {
    write: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
const output = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output);
const entry = output.find((item) => item.type === 'chunk' && item.isEntry);
const css = output.find((item) => item.type === 'asset' && item.fileName.endsWith('.css'));
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = '<script type="module" src="./src/main.jsx"></script>';

if (!entry || !css || !template.includes(script) ||
    output.some((item) => item !== entry && item !== css && item.fileName !== 'index.html')) {
  throw new Error('No se pudo generar una vista previa sin archivos externos.');
}

const html = template
  .replace('</head>', () => '<style>' + String(css.source).replace(/<\/style/gi, '<\\/style') + '</style>\n  </head>')
  .replace(script, () => '<script type="module">' + entry.code.replace(/<\/script/gi, '<\\/script') + '</script>');
await writeFile(new URL('../VISTA_PREVIA.html', import.meta.url), html, 'utf8');
console.log('Vista previa autónoma actualizada: VISTA_PREVIA.html');
