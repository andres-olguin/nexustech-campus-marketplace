const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('node:child_process');
(async () => {
  // Esta prueba inicia un MongoDB real con WiredTiger; no usamos una base simulada.
  const mongo = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || '7.0.24' },
    instance: {
      launchTimeout: 120000, storageEngine: 'wiredTiger', dbName: 'nexustech_test',
      args: ['--setParameter', 'diagnosticDataCollectionEnabled=false', ...(process.platform === 'win32' ? [] : ['--nounixsocket'])],
    },
  });
  try {
    const child = spawn(process.execPath, ['--test', 'test/marketplace.test.cjs', 'test/activity.test.cjs'], {
      stdio: 'inherit', env: { ...process.env, MONGODB_TEST_URI: mongo.getUri(), MONGODB_DB_NAME: 'nexustech_test' },
    });
    const code = await new Promise((resolve, reject) => { child.once('exit', resolve); child.once('error', reject); });
    process.exitCode = code ?? 1;
  } finally { await mongo.stop(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
