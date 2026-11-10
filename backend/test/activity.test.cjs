const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ActivityService } = require('../dist/activity/activity.service');

test('ActivityService: MongoDB event isolation and offline tolerance', async t => {
  const service = new ActivityService();

  await t.test('Initializes with offline fallback when MongoDB is unreachable', async () => {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:59999/unreachable_test';
    await service.onModuleInit();
    // Debe continuar en modo best-effort sin lanzar excepciones fatales
    assert.ok(service, 'ActivityService instanciado correctamente');
  });

  await t.test('Handles activity events safely without throwing', async () => {
    await service.handleProductCreated({
      userId: '11111111-1111-4111-8111-111111111111',
      resourceId: '22222222-2222-4222-8222-222222222222',
      occurredAt: new Date().toISOString(),
    });

    await service.handleOrderCreated({
      userId: '11111111-1111-4111-8111-111111111111',
      resourceId: '33333333-3333-4333-8333-333333333333',
      occurredAt: new Date().toISOString(),
    });

    await service.handleFulfillmentUpdated({
      userId: '44444444-4444-4444-8444-444444444444',
      resourceId: '33333333-3333-4333-8333-333333333333',
      occurredAt: new Date().toISOString(),
      sellerId: '44444444-4444-4444-8444-444444444444',
      status: 'shipped',
      orderStatus: 'shipped',
    });
  });

  await t.test('Creates interaction document structure without failing', async () => {
    const interaction = await service.createInteraction('11111111-1111-4111-8111-111111111111', {
      targetId: '22222222-2222-4222-8222-222222222222',
      targetType: 'product',
      message: '¿El producto incluye cargador original?',
    });

    assert.equal(interaction.targetId, '22222222-2222-4222-8222-222222222222');
    assert.equal(interaction.targetType, 'product');
    assert.equal(interaction.message, '¿El producto incluye cargador original?');
    assert.ok(interaction.createdAt, 'Debe incluir timestamp ISO');
  });

  await t.test('Shuts down cleanly', async () => {
    await service.onModuleDestroy();
  });
});
