const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ActivityService } = require('../dist/activity/activity.service');

test('MongoDB unavailable: reads and writes explicitly reject with 503', async () => {
  const service = new ActivityService({});
  for (const operation of [
    () => service.createInteraction('actor', { targetId: 'target', targetType: 'product', receiverId: 'seller', message: 'hola' }),
    () => service.getInteractionsByTarget('target', 'actor'),
    () => service.getInteractionsByUser('actor'),
    () => service.getActivityLogs('target', 'actor'),
    () => service.getUserActivityLogs('actor'),
  ]) await assert.rejects(operation, error => error.getStatus() === 503);
});
