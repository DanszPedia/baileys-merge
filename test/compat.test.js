'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  attachCompatMethods,
  normalizeInteractivePayload,
  makeSimpleButtonPayload,
  toNativeFlowButton,
} = require('../lib/Compat/socket');

function createSocketStub() {
  const calls = [];
  const sock = {
    calls,
    sendMessage: async (...args) => {
      calls.push(args);
      return { key: { id: 'TEST-MESSAGE' }, args };
    },
  };
  return sock;
}

test('sendMsg is a transparent alias for sendMessage', async () => {
  const sock = attachCompatMethods(createSocketStub());
  const content = { text: 'hello world' };
  const options = { quoted: { key: { id: 'quoted' } } };
  const result = await sock.sendMsg('123@s.whatsapp.net', content, options);
  assert.equal(sock.calls.length, 1);
  assert.deepEqual(sock.calls[0], ['123@s.whatsapp.net', content, options]);
  assert.equal(result.key.id, 'TEST-MESSAGE');
});

test('sendBtn and sendBtnV1 wrap a raw interactiveMessage object', async () => {
  const sock = attachCompatMethods(createSocketStub());
  const payload = { title: 'Hello', nativeFlowMessage: { buttons: [] } };
  await sock.sendBtn('123@s.whatsapp.net', payload);
  assert.deepEqual(sock.calls[0][1], { interactiveMessage: payload });
  await sock.sendBtnV1('123@s.whatsapp.net', { interactiveMessage: payload });
  assert.deepEqual(sock.calls[1][1], { interactiveMessage: payload });
});

test('sendBtnV2 converts simple button descriptors to native-flow quick replies', async () => {
  const sock = attachCompatMethods(createSocketStub());
  await sock.sendBtnV2('123@s.whatsapp.net', {
    text: 'Choose',
    footer: 'Dansz',
    buttons: [{ id: '.menu', text: 'Menu' }],
  });
  const interactive = sock.calls[0][1].interactiveMessage;
  assert.equal(interactive.title, 'Choose');
  assert.equal(interactive.footer, 'Dansz');
  assert.equal(interactive.nativeFlowMessage.buttons[0].name, 'quick_reply');
  assert.deepEqual(JSON.parse(interactive.nativeFlowMessage.buttons[0].buttonParamsJson), {
    display_text: 'Menu',
    id: '.menu',
  });
});

test('native-flow button conversion preserves already-normalized payloads', () => {
  const raw = { name: 'cta_url', buttonParamsJson: '{"url":"https://example.com"}' };
  assert.deepEqual(toNativeFlowButton(raw, 0), raw);
});

test('interactive payload normalizer does not double-wrap', () => {
  const raw = { interactiveMessage: { title: 'ok' } };
  assert.equal(normalizeInteractivePayload(raw), raw);
  assert.deepEqual(normalizeInteractivePayload({ title: 'ok' }), { interactiveMessage: { title: 'ok' } });
});

test('compat methods can only be attached once', () => {
  const sock = attachCompatMethods(createSocketStub());
  const sendMsg = sock.sendMsg;
  assert.equal(attachCompatMethods(sock), sock);
  assert.equal(sock.sendMsg, sendMsg);
});
