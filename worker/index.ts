import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage, Mailbox } from 'mimetext/browser';
import { contact } from '../src/data/contact';

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BOOKING_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
  BOOKING_EMAIL?: { send(message: EmailMessage): Promise<void> };
  BOOKING_TEST_TO?: string;
  BOOKING_FROM?: string;
};
const response = (status: number, message: string) => Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
const singleLine = (value: unknown, max: number) => typeof value === 'string' && value.length <= max && !/[\r\n\x00-\x1f\x7f]/.test(value) ? value.trim() : '';

export function validateBooking(data: Record<string, unknown>, now = new Date()) {
  const name = singleLine(data.name, 100);
  const email = singleLine(data.email, 254);
  const phone = singleLine(data.phone, 30);
  const date = singleLine(data.date, 10);
  const hour = singleLine(data.hour, 5);
  const level = singleLine(data.level, 20);
  const lesson = singleLine(data.lesson, 10);
  const people = Number(data.people);
  const local = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).format(now);
  const today = local.slice(0, 10);
  const maxDate = new Date(now.getTime() + 366 * 86400000).toISOString().slice(0, 10);
  if (!name || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || (phone && !/^[+\d ()-]{6,30}$/.test(phone)) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < today || date > maxDate ||
    !/^(09|1[0-9]):00$/.test(hour) || (date === today && Number(hour.slice(0, 2)) <= Number(local.slice(-2))) ||
    !['Principiante', 'Intermedio', 'Avanzado'].includes(level) || !['grupo', 'privada'].includes(lesson) || !Number.isInteger(people) || people < 1 || people > 8) return null;
  return { name, email, phone, date, hour, level, lesson, people };
}

export async function handleBooking(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return response(403, 'Envía la solicitud desde la web de la escuela.');
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return response(415, 'Formato de solicitud incorrecto.');
  // Bound the body even when Content-Length is missing or untrusted.
  const reader = request.body?.getReader();
  if (!reader) return response(400, 'Solicitud vacía.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); return response(413, 'Solicitud demasiado grande.'); }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  let data: Record<string, unknown>;
  try { data = JSON.parse(new TextDecoder().decode(body)); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(); }
  catch { return response(400, 'Solicitud incorrecta.'); }
  if (data.website) return response(400, 'No se ha podido enviar la solicitud.');
  const booking = validateBooking(data);
  if (!booking) return response(400, 'Revisa tus datos, el día y la hora de la clase.');
  const requestId = singleLine(data.requestId, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return response(400, 'Identificador de solicitud incorrecto.');
  if (!env.BOOKING_EMAIL || !env.BOOKING_FROM || !env.BOOKING_LIMITER) return response(503, 'El envío por correo todavía no está disponible. Contacta con la escuela por WhatsApp.');
  const allowed = await env.BOOKING_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
  if (!allowed.success) return response(429, 'Has enviado varias solicitudes. Espera un minuto antes de intentarlo de nuevo.');
  const text = `Nueva solicitud de clase — pendiente de confirmación\n\nNombre: ${booking.name}\nEmail: ${booking.email}\nTeléfono: ${booking.phone || 'No indicado'}\nDía: ${booking.date}\nHora: ${booking.hour} (Europe/Madrid)\nNivel: ${booking.level}\nClase: ${booking.lesson === 'grupo' ? 'En grupo' : 'Privada'}\nPersonas: ${booking.people}\nReferencia: ${requestId}\n\nResponde a este correo para contactar con el alumno y confirmar disponibilidad, condiciones y precio. Esta solicitud no constituye una reserva confirmada.`;
  try {
    // The temporary test destination is controlled by the Worker, never by form data.
    const destination = env.BOOKING_TEST_TO || contact.email;
    const msg = createMimeMessage();
    msg.setSender({ name: contact.businessName, addr: env.BOOKING_FROM });
    msg.setRecipient(destination);
    msg.setHeader('Reply-To', new Mailbox(booking.email));
    msg.setSubject(`${env.BOOKING_TEST_TO ? '[PRUEBA] ' : ''}Solicitud de surf · ${booking.date} ${booking.hour}`);
    msg.addMessage({ contentType: 'text/plain', data: text });
    const escape = (value: string | number) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
    const fields = [['Nombre', booking.name], ['Correo', booking.email], ['Teléfono', booking.phone || 'No indicado'], ['Día', booking.date], ['Hora', `${booking.hour} · El Palmar`], ['Nivel', booking.level], ['Clase', booking.lesson === 'grupo' ? 'En grupo' : 'Privada'], ['Personas', booking.people]];
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#f3f4f4;color:#202020;font-family:Arial,sans-serif;line-height:1.6"><div style="max-width:600px;margin:auto;background:#fff;padding:28px;border-radius:8px"><p style="margin:0;font-size:14px;font-weight:bold;letter-spacing:2px">SANTA KILLA · EL PALMAR</p><h1 style="font-size:26px;line-height:1.25;margin:20px 0 12px">Nueva solicitud de clase</h1><p style="color:#525b5c">${env.BOOKING_TEST_TO ? 'PRUEBA DE ENVÍO · No es una reserva real.<br>' : ''}Pendiente de confirmación por la escuela.</p><table style="width:100%;border-collapse:collapse;font-size:16px">${fields.map(([label, value]) => `<tr><th scope="row" style="padding:12px 8px 12px 0;border-bottom:1px solid #ddd;text-align:left;vertical-align:top;font-weight:normal;color:#525b5c">${escape(label)}</th><td style="padding:12px 0;border-bottom:1px solid #ddd;overflow-wrap:anywhere">${escape(value)}</td></tr>`).join('')}</table><p style="margin-top:24px">Pulsa <strong>Responder</strong> en tu correo para contactar con el alumno y confirmar disponibilidad, condiciones y precio.</p><p style="font-size:14px;color:#525b5c">Esta solicitud no constituye una reserva confirmada.<br>Referencia: ${escape(requestId)}</p></div></body></html>`;
    msg.addMessage({ contentType: 'text/html', data: html });
    await env.BOOKING_EMAIL.send(new EmailMessage(env.BOOKING_FROM, destination, msg.asRaw()));
    return response(200, 'Solicitud enviada a la escuela. Te responderemos por correo para confirmar la hora, las plazas y el precio.');
  } catch { return response(502, 'No se ha podido confirmar el envío. Contacta con la escuela antes de volver a enviarlo para evitar duplicados.'); }
}
export default {
  async fetch(request: Request, env: Env) {
    if (new URL(request.url).pathname === '/api/bookings') {
      try { return await handleBooking(request, env); }
      catch { return response(503, 'El envío no está disponible temporalmente. Inténtalo más tarde.'); }
    }
    if (new URL(request.url).pathname.startsWith('/api/')) return response(404, 'No encontrado.');
    return env.ASSETS.fetch(request);
  },
};
