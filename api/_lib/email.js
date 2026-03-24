const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'g.berbenkov@agros.net';
const FROM_EMAIL = 'AGROS Поръчки <orders@agros.net>';

async function sendOrderNotification(order) {
  if (!RESEND_API_KEY) return; // silently skip if Resend not configured

  const itemsRows = order.items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.name}${i.size ? ' ' + i.size : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${(i.price * i.qty).toFixed(2)} €</td>
    </tr>`).join('');

  const c = order.customer || {};
  const isGuest = !order.userId;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#2F412E;padding:28px 32px;">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">AGROS — Нова поръчка</h1>
      <p style="margin:6px 0 0;color:#B0CAAD;font-size:14px;">Поръчка #${order.id}${isGuest ? ' (Гост)' : ''}</p>
    </div>
    <div style="padding:28px 32px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#2F412E;">Данни на клиента</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:4px 0;color:#888;width:140px;">Имена:</td><td style="padding:4px 0;color:#1a1a1a;font-weight:600;">${c.name || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Телефон:</td><td style="padding:4px 0;color:#1a1a1a;">${c.phone || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Имейл:</td><td style="padding:4px 0;color:#1a1a1a;">${c.email || '—'}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Адрес:</td><td style="padding:4px 0;color:#1a1a1a;">${c.address || '—'}</td></tr>
        ${c.city ? `<tr><td style="padding:4px 0;color:#888;">Град:</td><td style="padding:4px 0;color:#1a1a1a;">${c.city}</td></tr>` : ''}
        ${c.note ? `<tr><td style="padding:4px 0;color:#888;">Бележка:</td><td style="padding:4px 0;color:#1a1a1a;">${c.note}</td></tr>` : ''}
      </table>

      <h2 style="margin:0 0 12px;font-size:16px;color:#2F412E;">Продукти</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9f9f9;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;border-bottom:2px solid #eee;">ПРОДУКТ</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#888;border-bottom:2px solid #eee;">КОЛ.</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#888;border-bottom:2px solid #eee;">СУМА</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div style="background:#f7f3ec;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:15px;color:#2F412E;font-weight:600;">Общо</span>
        <span style="font-size:22px;color:#2F412E;font-weight:700;">${order.total.toFixed(2)} €</span>
      </div>

      ${order.paymentIntentId ? `<p style="margin:16px 0 0;font-size:12px;color:#aaa;">Payment Intent: ${order.paymentIntentId}</p>` : ''}
    </div>
  </div>
</body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Нова поръчка #${order.id} — ${order.total.toFixed(2)} €${isGuest ? ' (Гост)' : ''}`,
        html
      })
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
}

module.exports = { sendOrderNotification };
