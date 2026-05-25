---
name: code-security-optimization
description: Playbook local para auditar arquitectura, optimizar codigo y endurecer seguridad en proyectos web, guardando hallazgos reutilizables para no repetir errores.
---

# Code Security Optimization

Usa esta skill cuando el objetivo sea revisar o refactorizar un proyecto sin cambiar comportamiento funcional ni apariencia visual, con foco en:

- seguridad defensiva
- arquitectura y separacion de responsabilidades
- duplicidad y deuda tecnica
- robustez de tipos y contratos
- validacion estrecha de regresiones

## Regla de mantenimiento

Cada vez que durante este proyecto aparezca un hallazgo nuevo de seguridad, arquitectura, duplicidad, calidad de codigo o rendimiento con impacto real, registralo en esta skill antes de cerrar la incidencia.

Cada registro nuevo debe incluir, como minimo:

- severidad
- sintoma observable
- causa raiz confirmada (o hipotesis mas fuerte)
- comprobacion barata para discriminar
- solucion aplicada o siguiente paso valido
- prevencion reutilizable para futuros proyectos

Objetivo:

- convertir auditorias y refactors reales en conocimiento operativo reutilizable
- reducir regresiones y tiempo de diagnostico en proyectos futuros

## Flujo de trabajo recomendado

1. Delimitar scope y assets criticos.
2. Buscar evidencia minima y suficiente (rg, lectura dirigida, check/build).
3. Priorizar hallazgos por severidad e impacto.
4. Corregir primero lo de mayor impacto y menor riesgo.
5. Validar cada slice con la prueba mas estrecha posible.
6. Registrar aprendizaje reusable en esta misma skill.

## Plantilla de registro rapido

### N. Titulo corto del hallazgo

Severidad:

- alta | media | baja

Sintoma:

- que se observa en runtime, build o mantenimiento

Causa raiz:

- por que ocurre realmente

Comprobacion barata:

- comando o lectura puntual que confirma/descarta

Solucion aplicada:

- cambio concreto, acotado y reversible

Prevencion:

- heuristica para no repetir el problema

## Hallazgos registrados (base inicial)

### 1. JSON-LD sin serializacion defensiva

Severidad:

- alta

Sintoma:

- datos estructurados inyectados con serializacion directa en script application/ld+json.

Causa raiz:

- falta de escape defensivo de caracteres que pueden romper contexto de script.

Comprobacion barata:

- revisar uso de set:html en layout y verificar si JSON.stringify se inserta sin saneado adicional.

Solucion aplicada:

- serializacion segura con escape de <, >, &, U+2028 y U+2029.

Prevencion:

- nunca inyectar JSON-LD sin serializador seguro centralizado.

### 2. Casts inseguros en mapeo de datos CMS

Severidad:

- alta

Sintoma:

- errores TypeScript y fragilidad al mapear payloads de origen dinamico.

Causa raiz:

- asumir forma de datos con as directos en lugar de validar estructura en runtime.

Comprobacion barata:

- ejecutar astro check y buscar as unknown as o casts a Record sin guardas.

Solucion aplicada:

- introducir type guards y funciones de normalizacion (unknown -> record seguro) antes de mapear.

Prevencion:

- para datos externos o CMS, parsear y validar antes de tipar, no al reves.

### 3. Duplicidad de utilidades de normalizacion de categorias

Severidad:

- media

Sintoma:

- misma logica de slug/label repetida en multiples modulos.

Causa raiz:

- ausencia de utilidad compartida para transformaciones semanticas comunes.

Comprobacion barata:

- buscar funciones equivalentes por nombre/patron en data y lib.

Solucion aplicada:

- extraer utilidades compartidas a un modulo unico consumido por todos los puntos.

Prevencion:

- cuando una funcion aparece 2+ veces con mismo contrato, consolidarla.

### 4. API admin sin proteccion explicita de origen y cache defensiva

Severidad:

- media

Sintoma:

- endpoint autenticado sin control same-origin explicito y sin no-store sistematico.

Causa raiz:

- confiar solo en autenticacion/sesion sin reforzar superficie CSRF/cache.

Comprobacion barata:

- revisar handlers POST para validacion de origin y cabeceras Cache-Control.

Solucion aplicada:

- validacion same-origin en mutaciones y no-store en respuestas sensibles.

Prevencion:

- todo endpoint admin mutante: auth + permiso + origen + no-store.

### 5. Falta de cabeceras de seguridad globales

Severidad:

- alta

Sintoma:

- respuestas SSR sin una capa centralizada de hardening defensivo.

Causa raiz:

- no existia middleware global para politicas HTTP de seguridad.

Comprobacion barata:

- curl -I a paginas principales y verificar ausencia de CSP, referrer-policy, nosniff, etc.

Solucion aplicada:

- middleware global con CSP compatible, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy y HSTS condicional en HTTPS.

Prevencion:

- definir baseline de cabeceras en un punto unico y no dispersarlas por pagina.

### 6. Embed de terceros con permisos mejorables

Severidad:

- baja

Sintoma:

- iframe de video con permisos mas amplios de lo necesario y sin referrerpolicy explicita.

Causa raiz:

- configuracion por defecto sin principio de minimo privilegio.

Comprobacion barata:

- auditar atributos allow, sandbox, referrerpolicy en iframes.

Solucion aplicada:

- ajustar allow al minimo funcional y anadir referrerpolicy strict-origin-when-cross-origin.

Prevencion:

- en embeds de terceros, conceder solo capacidades estrictamente necesarias.

### 7. Validacion insuficiente tras cambios de seguridad

Severidad:

- media

Sintoma:

- cambios de hardening no siempre se verifican en runtime real.

Causa raiz:

- depender solo de check/build sin verificar cabeceras efectivas.

Comprobacion barata:

- levantar preview y validar con curl -I las cabeceras esperadas.

Solucion aplicada:

- validar siempre con trio: check + build + smoke HTTP estrecho del cambio.

Prevencion:

- para seguridad HTTP, no cerrar tarea sin evidencia de cabeceras emitidas.

### 8. Formularios externos incompatibles con CSP same-origin

Severidad:

- media

Sintoma:

- el formulario parece facil de conectar a un backend externo, pero en produccion queda bloqueado por CSP o fuerza a exponer claves/accesos en cliente.

Causa raiz:

- integrar el formulario con POST directo a tercero ignora el boundary existente de `form-action 'self'` y desplaza secretos y control anti-spam al navegador.

Comprobacion barata:

- revisar el `action` del formulario y compararlo con la CSP; si el formulario sale a otro origen o requiere key publica en markup, hay desalineacion.

Solucion aplicada:

- mantener el POST same-origin, crear endpoint servidor para validacion y envio, y guardar credenciales del proveedor en variables de entorno server-side.

Prevencion:

- en proyectos SSR/Workers con CSP restrictiva, tratar cualquier formulario de contacto como integracion backend y no como POST directo a SaaS.

## Checklist de cierre de auditoria/refactor

- hallazgo priorizado por severidad e impacto
- correccion acotada y reversible
- sin cambio visual ni funcional no deseado
- validacion tecnica ejecutada (check/build/tests/smoke)
- aprendizaje registrado en esta skill
