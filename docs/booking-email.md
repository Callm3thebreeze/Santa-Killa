# Solicitudes por correo con Cloudflare

El formulario publica JSON en `/api/bookings`. El Worker envía correo HTML y versión de texto a `contact.email` (`src/data/contact.ts`) usando el binding `BOOKING_EMAIL` de Cloudflare. El binding está restringido a `santakilla.surfschool@gmail.com`; si cambia el correo de contacto, actualizar también `destination_address` en Wrangler y verificar el nuevo destino. Reply-To apunta al alumno. La escuela confirma la reserva manualmente.

## Activación

1. En Cloudflare, configurar Email Routing / Email Service para el dominio de la escuela. Revisar los registros DNS propuestos: no sustituir registros MX de un servicio de correo existente. Si los hay, usar un subdominio dedicado compatible con Email Service.
2. Añadir `santakilla.surfschool@gmail.com` como **Destination address**. La escuela debe abrir el mensaje de Cloudflare y verificarlo. Enviar a este destino verificado es gratuito también en Workers Free.
3. Configurar el remitente en un dominio incorporado a Email Service, por ejemplo `reservas@santakillasurf.com`. El remitente `BOOKING_FROM=reservas@santakillasurf.com` queda declarado en `wrangler.jsonc`. No usar Gmail como remitente.
4. Descomentar `send_email` en `wrangler.jsonc` sólo después de que el destino figure como verificado. Hasta entonces se mantiene desactivado para no bloquear los despliegues. Publicar mediante `npm run deploy` o el despliegue GitHub conectado. Wrangler declara el binding `send_email` restringido y el límite de solicitudes. El remitente y el binding se mantienen en cada despliegue, incluidos los de previsión.
5. Realizar una solicitud de prueba identificada como tal, comprobar el buzón de la escuela (también spam) y que Responder apunta al alumno. El éxito significa que Cloudflare ha aceptado el mensaje, no garantiza llegada a la bandeja de entrada.

Prueba de entrega realizada el 22 de octubre de 2026 en un Worker temporal restringido al buzón de prueba: Cloudflare aceptó el envío y el usuario confirmó recepción y formato. El Worker temporal fue eliminado al terminar. El correo de la escuela sigue requiriendo verificación para activar producción.

No se necesita Resend, API key ni secret de correo en GitHub. El envío a destinatarios verificados es gratuito; la ejecución del Worker está sujeta a los límites de Workers Free. Este flujo no envía correos automáticos a alumnos no verificados.

Sin `BOOKING_FROM` o sin el binding `BOOKING_EMAIL`, el endpoint responde 503 y ofrece WhatsApp; nunca muestra un éxito ficticio.

## Prueba con otro buzón

Para probar sin enviar a la escuela, verificar primero el buzón de prueba en Cloudflare y desplegar temporalmente un binding restringido a ese buzón, con `BOOKING_TEST_TO` establecido en el Worker. El asunto lleva `[PRUEBA]` y el cuerpo indica que no es una reserva real. No habilitar este modo en la web pública para recibir solicitudes de alumnos. Puede usarse un Worker de prueba separado y un formulario local.

Al terminar, eliminar `BOOKING_TEST_TO` y mantener únicamente el binding de producción restringido al Gmail de la escuela. El destino no procede nunca de los datos enviados por el navegador.

## Desarrollo y comprobación

`npm run build` y `npx wrangler dev` sirven el sitio compilado y la API juntos. `astro dev` solo sirve la parte estática, no el endpoint del Worker. `node --test tests/booking.test.mjs` simula el binding sin enviar correos. `npx wrangler deploy --dry-run` valida el empaquetado sin publicar. El simulador local de email depende de la versión de Wrangler; una aceptación local no prueba entrega real.

## Controles y límites

Validación en servidor (fecha y hora de Madrid, nivel, tipo, 1–8 alumnos, identidad y contacto), cuerpo máximo 8 KiB, mismo origen, campo trampa, binding de límite de 3 solicitudes por minuto e IP. El límite se aplica por ubicación de Cloudflare y no es una cuota global estricta.

El botón queda bloqueado durante el envío y una solicitud idéntica ya aceptada no se reenvía en esa sesión de página. Cada correo lleva una referencia que se conserva al reintentar sin cambios. No hay deduplicación persistente en servidor: ante una pérdida de conexión después del envío podría haber duplicados, y la interfaz pide consultar con la escuela si no puede confirmar el resultado.

No se registran datos del formulario en logs ni hay base de datos de reservas. Los datos de contacto se procesan en Cloudflare y se conservan en el buzón de la escuela. La escuela debe mantener su información de privacidad y política de conservación acordes al formulario.

Documentación: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/ y https://developers.cloudflare.com/email-service/platform/pricing/.
