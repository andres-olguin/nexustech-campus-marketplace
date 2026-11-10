const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('node:child_process');
(async () => {
  // Real mongod process with WiredTiger. No persistence is mocked.
  const mongo = await MongoMemoryServer.create({ binary: { version: process.env.MONGOMS_VERSION || '8.2.6' }, instance: { launchTimeout: 120000, storageEngine: 'wiredTiger', dbName: 'nexustech_test' } });
  try {
    const child = spawn(process.execPath, ['--test', 'test/marketplace.test.cjs', 'test/activity.test.cjs'], {
      stdio: 'inherit', env: { ...process.env, MONGODB_TEST_URI: mongo.getUri(), MONGODB_DB_NAME: 'nexustech_test' },
    });
    const code = await new Promise((resolve, reject) => { child.once('exit', resolve); child.once('error', reject); });
    process.exitCode = code ?? 1;
  } finally { await mongo.stop(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
