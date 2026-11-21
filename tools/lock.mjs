// Locks the Market Monitor case study.
//
// The readable case study lives OUTSIDE the website, in ~/repos/portfolio-private/market-monitor.html,
// so it can never be uploaded or committed by accident. This script encrypts it with your password
// (AES-256-GCM, key from PBKDF2-SHA-256 with 600,000 rounds) into assets/market-monitor.locked.json,
// which is the only copy the website ships. Without the password that file is unreadable.
//
// Run it from ~/repos/portfolio whenever you set/change the password or edit the case study:
//   node tools/lock.mjs
// It asks for the password twice; nothing is shown as you type and the password is never saved.
import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import readline from 'node:readline';

const SRC = new URL('../../portfolio-private/market-monitor.html', import.meta.url);
const OUT = new URL('../assets/market-monitor.locked.json', import.meta.url);
const ITER = 600000;

function ask(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = s => { if (!muted) rl.output.write(s); };   // hide what's typed
    rl.question(question, answer => { rl.output.write('\n'); rl.close(); resolve(answer); });
    muted = true;
  });
}

const html = await readFile(SRC, 'utf8').catch(() => {
  console.error(`Can't find the private case study at ${SRC.pathname}`);
  process.exit(1);
});

let password = process.env.LOCK_PASSWORD;
if (!password) {
  password = await ask('New password for the case study: ');
  if ((await ask('Type it again: ')) !== password) { console.error('The two passwords did not match. Nothing was changed.'); process.exit(1); }
}
if (password.length < 12) { console.error('Use at least 12 characters (a few random words works well). Nothing was changed.'); process.exit(1); }

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(html));

const b64 = u => Buffer.from(u).toString('base64');
await writeFile(OUT, JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(data)) }));
console.log('Locked. The website now uses assets/market-monitor.locked.json (safe to commit and publish).');
