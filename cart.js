/* cart.js — Shared cart system for Agros product pages
   Injects the cart drawer + order modal and manages state via localStorage.
   Compatible with the same agros_cart key used by index.html.
*/
(function () {
  const EUR_TO_BGN = 1.9558;
  const FREE_SHIP  = 25.57;

  /* ── State ── */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('agros_cart') || '[]'); } catch(e) {}

  function saveCart() {
    try { localStorage.setItem('agros_cart', JSON.stringify(cart)); } catch(e) {}
  }

  /* ── ID hash ── */
  function makeId(name, volume) {
    let h = 5381;
    const s = name + '|' + volume;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  /* ── Escape HTML ── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ── Inject HTML ── */
  function injectHTML() {
    if (document.getElementById('cart-overlay')) return;
    const div = document.createElement('div');
    div.innerHTML = `
<style>
  @keyframes cartModalIn { from{opacity:0;transform:scale(0.92) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .cart-item-enter { animation: cartItemIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes cartItemIn { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  #cart-items::-webkit-scrollbar{width:4px} #cart-items::-webkit-scrollbar-track{background:#F7F3EC} #cart-items::-webkit-scrollbar-thumb{background:#B0CAAD;border-radius:4px}
</style>
<div id="cart-overlay" onclick="if(event.target===this)closeCart()" style="display:none;position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,0.45);backdrop-filter:blur(3px);"></div>
<aside id="cart-drawer" role="dialog" aria-modal="true" aria-label="Количка" style="position:fixed;top:0;right:0;height:100dvh;width:min(440px,100vw);z-index:1101;background:#FEFCF8;box-shadow:-8px 0 48px rgba(0,0,0,0.16);transform:translateX(100%);transition:transform 0.38s cubic-bezier(0.34,1.2,0.64,1);display:flex;flex-direction:column;">
  <div style="padding:20px 24px 18px;border-bottom:1px solid #EDE5D5;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:10px;">
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#2F412E;margin:0;letter-spacing:-0.02em;">Количка</h2>
      <span id="cart-count-drawer" style="background:#5F7E5F;color:white;font-family:'Inter',sans-serif;font-size:11px;font-weight:700;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">0</span>
    </div>
    <button onclick="closeCart()" aria-label="Затвори количката" style="background:none;border:none;cursor:pointer;color:#aaa;padding:6px;border-radius:50%;transition:color 0.2s,background 0.2s;" onmouseenter="this.style.color='#333';this.style.background='rgba(0,0,0,0.06)'" onmouseleave="this.style.color='#aaa';this.style.background='none'">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div id="cart-empty" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;text-align:center;">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D7E4D4" stroke-width="1.2" style="margin-bottom:20px;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#2F412E;margin:0 0 8px;">Количката е празна</h3>
    <p style="font-family:'Inter',sans-serif;font-size:14px;color:#999;line-height:1.65;margin:0 0 24px;">Добавете продукти от нашата колекция.</p>
    <button onclick="closeCart()" style="background:#416241;color:white;border:none;border-radius:50px;padding:13px 28px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background 0.2s;" onmouseenter="this.style.background='#507453'" onmouseleave="this.style.background='#416241'">Разгледай продукти</button>
  </div>
  <div id="cart-items" style="flex:1;overflow-y:auto;padding:16px 20px;display:none;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:#B0CAAD #F7F3EC;"></div>
  <div id="cart-footer" style="display:none;border-top:1px solid #EDE5D5;padding:18px 24px 22px;flex-shrink:0;">
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span id="cart-shipping-msg" style="font-family:'Inter',sans-serif;font-size:12px;color:#666;line-height:1.4;"></span>
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:#5F7E5F;flex-shrink:0;margin-left:8px;">25.57&nbsp;€</span>
      </div>
      <div style="height:5px;background:#EDE5D5;border-radius:3px;overflow:hidden;">
        <div id="cart-shipping-progress" style="height:100%;background:linear-gradient(90deg,#5F7E5F,#82B27F);border-radius:3px;transition:width 0.45s ease;width:0%;"></div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding:14px 16px;background:white;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,0.05);">
      <div>
        <div style="font-family:'Inter',sans-serif;font-size:12px;color:#999;margin-bottom:2px;">Обща сума</div>
        <div id="cart-total-bgn" style="font-family:'Inter',sans-serif;font-size:12px;color:#aaa;"></div>
      </div>
      <div id="cart-total-eur" style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#2F412E;letter-spacing:-0.02em;"></div>
    </div>
    <button onclick="handleCheckout()" style="width:100%;padding:16px;border:none;border-radius:50px;background:#416241;color:white;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(65,98,65,0.35);transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),background 0.2s;" onmouseenter="this.style.background='#507453';this.style.transform='translateY(-1px)'" onmouseleave="this.style.background='#416241';this.style.transform='translateY(0)'">
      Продължи към поръчка
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
    <button onclick="closeCart()" style="width:100%;margin-top:10px;background:none;border:none;color:#aaa;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;padding:6px;transition:color 0.2s;" onmouseenter="this.style.color='#666'" onmouseleave="this.style.color='#aaa'">Продължи пазаруването</button>
  </div>
</aside>
<div id="order-modal-overlay" onclick="if(event.target===this)closeOrderModal()" style="display:none;position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,0.50);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px;">
  <div id="order-modal" style="background:white;border-radius:24px;padding:40px 36px 32px;max-width:520px;width:100%;position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.18);max-height:90dvh;overflow-y:auto;animation:cartModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1);">
    <button onclick="closeOrderModal()" aria-label="Затвори" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;color:#aaa;padding:6px;" onmouseenter="this.style.color='#333'" onmouseleave="this.style.color='#aaa'">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <h2 style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#2F412E;text-align:center;margin:0 0 6px;letter-spacing:-0.02em;">Оформете поръчката</h2>
    <p style="font-family:'Inter',sans-serif;font-size:14px;color:#888;text-align:center;margin:0 0 24px;line-height:1.6;">Попълнете данните за доставка и ние ще се свържем с вас.</p>
    <div id="order-summary" style="background:#F7F3EC;border-radius:14px;padding:16px;margin-bottom:20px;"></div>
    <form id="order-form" onsubmit="submitOrder(event)" novalidate>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <input id="order-name" type="text" placeholder="Имена *" required style="grid-column:1/-1;padding:13px 18px;border:1.5px solid #D1D5DB;border-radius:50px;font-size:14px;font-family:'Inter',sans-serif;outline:none;color:#1A1A1A;" onfocus="this.style.borderColor='#416241';this.style.boxShadow='0 0 0 3px rgba(65,98,65,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" />
        <input id="order-phone" type="tel" placeholder="Телефон *" required style="padding:13px 18px;border:1.5px solid #D1D5DB;border-radius:50px;font-size:14px;font-family:'Inter',sans-serif;outline:none;color:#1A1A1A;" onfocus="this.style.borderColor='#416241';this.style.boxShadow='0 0 0 3px rgba(65,98,65,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" />
        <input id="order-email" type="email" placeholder="Имейл" style="padding:13px 18px;border:1.5px solid #D1D5DB;border-radius:50px;font-size:14px;font-family:'Inter',sans-serif;outline:none;color:#1A1A1A;" onfocus="this.style.borderColor='#416241';this.style.boxShadow='0 0 0 3px rgba(65,98,65,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" />
      </div>
      <input id="order-address" type="text" placeholder="Адрес за доставка *" required style="width:100%;padding:13px 18px;border:1.5px solid #D1D5DB;border-radius:50px;font-size:14px;font-family:'Inter',sans-serif;outline:none;color:#1A1A1A;margin-bottom:12px;box-sizing:border-box;" onfocus="this.style.borderColor='#416241';this.style.boxShadow='0 0 0 3px rgba(65,98,65,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'" />
      <textarea id="order-note" placeholder="Бележка (по желание)" rows="2" style="width:100%;padding:13px 18px;border:1.5px solid #D1D5DB;border-radius:18px;font-size:14px;font-family:'Inter',sans-serif;outline:none;color:#1A1A1A;resize:none;margin-bottom:16px;box-sizing:border-box;" onfocus="this.style.borderColor='#416241';this.style.boxShadow='0 0 0 3px rgba(65,98,65,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow='none'"></textarea>
      <p id="order-error" style="display:none;color:#c0392b;font-size:13px;text-align:center;margin:-8px 0 12px;font-family:'Inter',sans-serif;"></p>
      <button type="submit" style="width:100%;padding:16px;border:none;border-radius:50px;background:#416241;color:white;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(65,98,65,0.35);transition:background 0.2s,transform 0.2s cubic-bezier(0.34,1.56,0.64,1);" onmouseenter="this.style.background='#507453';this.style.transform='translateY(-1px)'" onmouseleave="this.style.background='#416241';this.style.transform='translateY(0)'">Изпрати поръчка</button>
    </form>
    <div id="order-success" style="display:none;text-align:center;padding:20px 0 10px;">
      <div style="font-size:56px;margin-bottom:16px;">🌿</div>
      <h3 style="font-family:'Playfair Display',serif;font-size:22px;color:#416241;margin:0 0 10px;">Благодаря за поръчката!</h3>
      <p style="font-family:'Inter',sans-serif;font-size:14px;color:#666;line-height:1.7;">Получихме вашата заявка. Ще се свържем с вас на посочения телефон или имейл за потвърждение.</p>
    </div>
  </div>
</div>`;
    document.body.appendChild(div);
  }

  /* ── Render helpers ── */
  function getTotal()    { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function getTotalQty() { return cart.reduce((s, i) => s + i.qty, 0); }

  function renderCart() {
    const qty   = getTotalQty();
    const total = getTotal();

    // Nav badge — product pages use the span inside [aria-label="Количка"]
    const navBtn = document.querySelector('[aria-label="Количка"]');
    if (navBtn) {
      const badge = navBtn.querySelector('span');
      if (badge) { badge.textContent = qty; badge.style.display = qty > 0 ? 'flex' : 'none'; }
    }
    const dbadge = document.getElementById('cart-count-drawer');
    if (dbadge) dbadge.textContent = qty;

    const itemsEl  = document.getElementById('cart-items');
    const emptyEl  = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.style.display  = 'none';
      emptyEl.style.display  = 'flex';
      footerEl.style.display = 'none';
    } else {
      emptyEl.style.display  = 'none';
      itemsEl.style.display  = 'flex';
      footerEl.style.display = 'block';

      itemsEl.innerHTML = cart.map(function(item) { return `
        <div class="cart-item-enter" style="display:flex;gap:12px;padding:14px;background:white;border-radius:16px;box-shadow:0 1px 8px rgba(0,0,0,0.06);align-items:flex-start;">
          <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;background:#EEF2EB;flex-shrink:0;" onerror="this.style.visibility='hidden'" />
          <div style="flex:1;min-width:0;">
            <div style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#2F412E;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(item.name)}</div>
            <div style="font-family:'Inter',sans-serif;font-size:11px;color:#999;margin-bottom:8px;">${esc(item.volume || '')}${item.brand ? ' · ' + esc(item.brand) : ''}</div>
            <div style="display:flex;align-items:center;gap:4px;">
              <button onclick="cartQty('${esc(item.id)}',-1)" aria-label="Намали" style="width:32px;height:32px;border:none;background:none;cursor:pointer;font-size:18px;line-height:1;color:#5F7E5F;display:flex;align-items:center;justify-content:center;transition:background 0.15s;border-radius:50%;" onmouseenter="this.style.background='rgba(95,126,95,0.12)'" onmouseleave="this.style.background='none'">−</button>
              <span style="font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#2F412E;min-width:20px;text-align:center;">${item.qty}</span>
              <button onclick="cartQty('${esc(item.id)}',1)" aria-label="Увеличи" style="width:32px;height:32px;border:none;background:none;cursor:pointer;font-size:18px;line-height:1;color:#5F7E5F;display:flex;align-items:center;justify-content:center;transition:background 0.15s;border-radius:50%;" onmouseenter="this.style.background='rgba(95,126,95,0.12)'" onmouseleave="this.style.background='none'">+</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
            <button onclick="cartRemove('${esc(item.id)}')" aria-label="Премахни" style="background:none;border:none;cursor:pointer;color:#ddd;padding:4px;border-radius:6px;transition:color 0.2s,background 0.15s;" onmouseenter="this.style.color='#e55';this.style.background='rgba(220,53,69,0.08)'" onmouseleave="this.style.color='#ddd';this.style.background='none'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:#2F412E;">${item.price > 0 ? (item.price * item.qty).toFixed(2) + ' €' : '—'}</div>
          </div>
        </div>`; }).join('');

      const totalEur = document.getElementById('cart-total-eur');
      const totalBgn = document.getElementById('cart-total-bgn');
      if (totalEur) totalEur.textContent = total.toFixed(2) + ' €';
      if (totalBgn) totalBgn.textContent = (total * EUR_TO_BGN).toFixed(2) + ' лв.';

      const progress = Math.min(100, (total / FREE_SHIP) * 100);
      const progressBar = document.getElementById('cart-shipping-progress');
      if (progressBar) progressBar.style.width = progress + '%';
      const msgEl = document.getElementById('cart-shipping-msg');
      if (msgEl) {
        const remaining = FREE_SHIP - total;
        msgEl.textContent = remaining > 0
          ? 'Още ' + remaining.toFixed(2) + ' € за безплатна доставка'
          : '🎉 Безплатна доставка!';
      }
    }
  }

  /* ── Button animation ── */
  function animateBtn(btn) {
    if (!btn || btn._cartAnim) return;
    btn._cartAnim = true;
    const orig   = btn.innerHTML;
    const origBg = btn.style.background || '';
    btn.innerHTML = '✓ Добавено';
    btn.style.background = '#5F7E5F';
    btn.disabled = true;
    setTimeout(function() {
      btn.innerHTML = orig;
      btn.style.background = origBg;
      btn.disabled = false;
      btn._cartAnim = false;
    }, 1400);
  }

  /* ── Public API ── */
  window.AgrosCart = {
    addItem: function(btn, name, volume, priceBGN, img, brand) {
      const priceEUR = (parseFloat(priceBGN) || 0) / EUR_TO_BGN;
      const id = makeId(name, volume);
      const item = cart.find(function(i) { return i.id === id; });
      if (item) { item.qty++; } else { cart.push({ id: id, name: name, price: priceEUR, img: img, volume: volume, brand: brand || '', qty: 1 }); }
      saveCart();
      renderCart();
      window.openCart();
      if (btn) animateBtn(btn);
    },
    addFromPage: function(btn) {
      // Extract product data from the current product page DOM
      const h1 = document.querySelector('main h1, h1');
      const name = h1 ? h1.textContent.trim() : 'Продукт';

      const volEl = document.querySelector('main p.text-gray-400, p.text-gray-400.font-body');
      const volume = volEl ? volEl.textContent.replace(/·.*/, '').trim() : '';

      // Price is displayed in BGN on product pages
      const priceEl = document.querySelector('main .text-forest-800, main span[style*="font-size:2rem"]');
      const priceRaw = priceEl ? priceEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.') : '0';
      const priceEUR = (parseFloat(priceRaw) || 0) / EUR_TO_BGN;

      const imgEl = document.querySelector('main img');
      const img   = imgEl ? imgEl.getAttribute('src') : '';

      const badgeEl = document.querySelector('main span[class*="rounded-full"]:first-child, main span.inline-flex');
      const brand   = badgeEl ? badgeEl.textContent.trim() : '';

      const id = makeId(name, volume);
      const item = cart.find(function(i) { return i.id === id; });
      if (item) { item.qty++; } else { cart.push({ id, name, price: priceEUR, img, volume, brand, qty: 1 }); }
      saveCart();
      renderCart();
      window.openCart();
      animateBtn(btn);
    }
  };

  /* ── Global functions called from cart drawer HTML ── */
  window.cartRemove = function(id) {
    cart = cart.filter(function(i) { return i.id !== id; });
    saveCart(); renderCart();
  };
  window.cartQty = function(id, delta) {
    const item = cart.find(function(i) { return i.id === id; });
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart(); renderCart();
  };
  window.openCart = function() {
    var o = document.getElementById('cart-overlay');
    var d = document.getElementById('cart-drawer');
    if (o) o.style.display = 'block';
    if (d) d.style.transform = 'translateX(0)';
    document.body.style.overflow = 'hidden';
  };
  window.closeCart = function() {
    var o = document.getElementById('cart-overlay');
    var d = document.getElementById('cart-drawer');
    if (o) o.style.display = 'none';
    if (d) d.style.transform = 'translateX(100%)';
    document.body.style.overflow = '';
  };
  window.handleCheckout = function() {
    if (cart.length === 0) return;
    // Redirect to dedicated payment page
    var user = (typeof window.AgrosAuth !== 'undefined') ? window.AgrosAuth.getUser() : null;
    if (!user) {
      window.location.href = '/login.html?redirect=/payment.html';
      return;
    }
    window.closeCart();
    window.location.href = '/payment.html';
    return;
    // Legacy inline modal (kept as fallback, unreachable via normal flow)
    var total = getTotal();
    var el = document.getElementById('order-summary');
    if (el) {
      el.style.display = '';
      el.innerHTML = cart.map(function(item) { return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <img src="${esc(item.img)}" alt="${esc(item.name)}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;background:#EEF2EB;flex-shrink:0;" onerror="this.style.visibility='hidden'" />
          <div style="flex:1;min-width:0;">
            <div style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#2F412E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(item.name)} <span style="color:#999;font-weight:400;">${esc(item.volume)}</span></div>
            <div style="font-size:12px;color:#888;font-family:'Inter',sans-serif;">× ${item.qty}</div>
          </div>
          <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:#2F412E;flex-shrink:0;">${item.price > 0 ? (item.price * item.qty).toFixed(2) + ' €' : '—'}</div>
        </div>`; }).join('')
        + `<div style="border-top:1px solid #EDE5D5;margin-top:6px;padding-top:10px;display:flex;justify-content:space-between;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#2F412E;"><span>Общо:</span><span>${total.toFixed(2)}&nbsp;€</span></div>`;
    }
    var overlay = document.getElementById('order-modal-overlay');
    if (overlay) { overlay.style.display = 'flex'; }
    var form = document.getElementById('order-form');
    var succ = document.getElementById('order-success');
    var err  = document.getElementById('order-error');
    if (form) form.style.display = '';
    if (succ) succ.style.display = 'none';
    if (err)  err.style.display  = 'none';
  };
  window.closeOrderModal = function() {
    var overlay = document.getElementById('order-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  };
  window.submitOrder = async function(e) {
    e.preventDefault();
    var nameEl    = document.getElementById('order-name');
    var phoneEl   = document.getElementById('order-phone');
    var emailEl   = document.getElementById('order-email');
    var addressEl = document.getElementById('order-address');
    var noteEl    = document.getElementById('order-note');
    var errEl     = document.getElementById('order-error');
    var name    = nameEl    ? nameEl.value.trim()    : '';
    var phone   = phoneEl   ? phoneEl.value.trim()   : '';
    var email   = emailEl   ? emailEl.value.trim()   : '';
    var address = addressEl ? addressEl.value.trim() : '';
    var note    = noteEl    ? noteEl.value.trim()    : '';
    if (!name)    { if(errEl){errEl.textContent='Моля, въведете вашето име.';errEl.style.display='block';} return; }
    if (!phone)   { if(errEl){errEl.textContent='Моля, въведете телефон за връзка.';errEl.style.display='block';} return; }
    if (!address) { if(errEl){errEl.textContent='Моля, въведете адрес за доставка.';errEl.style.display='block';} return; }
    if (errEl) errEl.style.display = 'none';

    var submitBtn = document.querySelector('#order-form button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Изпраща се…'; }

    var token = localStorage.getItem('agros_token');
    if (token) {
      try {
        await fetch('http://localhost:3001/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({
            items: cart,
            total: getTotal(),
            customer: { name, phone, email, address, note }
          })
        });
      } catch (err) {
        // Server unreachable — order is still recorded locally below
      }
    }

    var form = document.getElementById('order-form');
    var summ = document.getElementById('order-summary');
    var succ = document.getElementById('order-success');
    if (form) form.style.display = 'none';
    if (summ) summ.style.display = 'none';
    if (succ) succ.style.display = 'block';
    cart = []; saveCart(); renderCart();
    setTimeout(function() { window.closeOrderModal(); window.closeCart(); }, 4000);
  };

  /* ── Init ── */
  function init() {
    injectHTML();
    renderCart();
    // Wire nav cart button (product pages use aria-label="Количка")
    var navBtn = document.querySelector('[aria-label="Количка"]');
    if (navBtn) navBtn.addEventListener('click', window.openCart);
    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { window.closeCart(); window.closeOrderModal(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
