/* Market Monitor lock.
   The case study ships only as assets/market-monitor.locked.json, encrypted by tools/lock.mjs.
   The right password rebuilds the key in the browser and decrypts it; a wrong one can't.
   Nothing stays unlocked: the pop-up on the home page hands the key (never the password) to the
   case study page once, the page deletes it as soon as it reads it, and every new visit, reload
   or Back/Forward return asks for the password again. */
(function () {
  const FILE = 'assets/market-monitor.locked.json', SLOT = 'mm-key';
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const store = {
    get() { try { return sessionStorage.getItem(SLOT); } catch { return null; } },
    set(v) { try { sessionStorage.setItem(SLOT, v); } catch {} },
    clear() { try { sessionStorage.removeItem(SLOT); } catch {} }
  };
  let box = null;
  async function load() {
    if (box) return box;
    const r = await fetch(FILE, { cache: 'no-store' });
    if (!r.ok) throw Object.assign(new Error('not locked yet'), { code: 'missing' });
    return (box = await r.json());
  }
  async function decrypt(key) {
    const b = await load();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(b.iv) }, key, fromB64(b.data));
    return new TextDecoder().decode(plain);
  }
  window.MMLock = {
    /* resolves with the case study's HTML; rejects with code 'wrong' or 'missing'.
       handoff: true only from the home page pop-up, which then opens the case study page */
    async unlock(password, handoff = false) {
      const b = await load();
      const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(b.salt), iterations: b.iter },
        base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
      let html;
      try { html = await decrypt(key); } catch { throw Object.assign(new Error('wrong password'), { code: 'wrong' }); }
      if (handoff) store.set(toB64(await crypto.subtle.exportKey('raw', key)));
      return html;
    },
    /* the case study's HTML if the home page pop-up just unlocked it (one use only), else null */
    async takeHandoff() {
      const saved = store.get();
      store.clear();
      if (!saved) return null;
      try {
        const key = await crypto.subtle.importKey('raw', fromB64(saved), 'AES-GCM', false, ['decrypt']);
        return await decrypt(key);
      } catch { store.clear(); return null; }
    },
    show(html) {
      document.open(); document.write(html); document.close();
      // coming back with Back/Forward restores a saved copy of the page: reload so it locks again
      addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
    }
  };
})();
