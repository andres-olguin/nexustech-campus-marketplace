const { randomBytes } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const target = resolve(__dirname, '..', '.env');
const hex = size => randomBytes(size).toString('hex');
try {
  writeFileSync(target, [
    'POSTGRES_PASSWORD=' + hex(24),
    'MONGO_PASSWORD=' + hex(24),
    'JWT_SECRET=' + hex(48),
    '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Se creó .env con valores locales. No subas este archivo a GitHub.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env ya existe. Se conservaron sus valores.');
}
