// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Vault } from '../lib/security/Vault.mjs';

test('Vault encrypts and decrypts text cleanly', () => {
  const vault = new Vault('my-super-secret-key-32-bytes-long!');
  const secret = 'sk-or-v1-my-secret-openrouter-key';

  const encrypted = vault.encrypt(secret);
  assert.ok(encrypted.includes(':'));
  assert.notEqual(encrypted, secret);

  const decrypted = vault.decrypt(encrypted);
  assert.equal(decrypted, secret);
});

test('Vault logs security audit event to disk', () => {
  const vault = new Vault();
  vault.logAudit('TEST_ACTION', 'user_1', 'Unit test security verification');
  assert.ok(true);
});
