# Previsión estática de El Palmar

## Flujo implementado

GitHub Actions → Copernicus Marine IBI + MET Norway → `public/forecast.json`
→ compilación de Astro → despliegue del Worker estático `santa-killa` en Cloudflare.

La descarga se programa cada seis horas: 02:23, 08:23, 14:23 y 20:23 UTC.
GitHub puede retrasar o descartar ejecuciones: no es una actualización en tiempo real.
También admite ejecución manual con **Run workflow**.

El navegador solo consulta `/forecast.json`, al abrir la página y cada 15 minutos
mientras está visible. El número de visitantes no aumenta las llamadas a los proveedores.
No hay claves de proveedores en HTML, JS o JSON públicos. El JSON contiene únicamente
meteorología y metadatos públicos de origen.

## Activación cuando esté disponible el registro de Copernicus

1. Crear la cuenta gratuita en https://marine.copernicus.eu/ y aceptar sus condiciones.
2. En [GitHub → Settings → Secrets and variables → Actions](https://github.com/Callm3thebreeze/Santa-Killa/settings/secrets/actions), crear los siguientes **repository secrets**:

   | Secreto | Valor |
   | --- | --- |
   | `COPERNICUSMARINE_SERVICE_USERNAME` | Usuario/correo de la cuenta Copernicus Marine |
   | `COPERNICUSMARINE_SERVICE_PASSWORD` | Contraseña de esa cuenta |
   | `CLOUDFLARE_API_TOKEN` | Token limitado al despliegue del Worker en la cuenta correspondiente |
   | `CLOUDFLARE_ACCOUNT_ID` | Identificador de esa cuenta Cloudflare |

   No introducir valores en el código, JSON, mensajes del chat ni argumentos de comandos.
   MET Norway no necesita registro ni clave; el script incluye un User-Agent identificable.
3. Publicar los cambios de este proyecto en la rama por defecto. GitHub solo ejecuta
   `schedule` desde esa rama. Habilitar Actions y permitir que el workflow escriba
   contenido en el repositorio; el workflow declara `contents: write`.
4. En Actions, ejecutar **Actualizar previsión de El Palmar → Run workflow** sobre
   la rama por defecto. Esperar a que todas las etapas, incluido Cloudflare, terminen.
5. Comprobar `/forecast.json`: `status: ready`, `generatedAt` reciente y coordenadas
   de `spot.marineCell` razonables. Revisar con la escuela la primera previsión,
   la celda marina y los umbrales antes de tratar los niveles como referencia operativa.

Estado inicial: `status: pending`, sin datos inventados. Hasta disponer de credenciales,
no se puede verificar la descarga autenticada de Copernicus ni activar la programación
remota. Si falta un secreto, el workflow falla con un mensaje de configuración.
El workflow solo ejecuta el trabajo en la rama por defecto, también al iniciarlo
manualmente. Una ejecución manual sobre otra rama se omite.

## Fuentes y significado

- Producto: [IBI_ANALYSISFORECAST_WAV_005_005](https://data.marine.copernicus.eu/product/IBI_ANALYSISFORECAST_WAV_005_005/description).
- Dataset: `cmems_mod_ibi_wav_anfc_0.027deg_PT1H-i` (horario).
- `VHM0`: altura significativa total, usada para el dibujo y las bandas iniciales.
- `VTM02`: periodo medio, usado para las bandas; `VMDR`: dirección media de procedencia.
- `VTPK`: periodo de pico; `VHM0_SW1`, `VTM01_SW1`, `VMDR_SW1`: swell primario.
  Se conservan en el JSON para análisis y futura calibración; no sustituyen la altura
  total ni el periodo medio en la clasificación actual.
- Se descarga un recuadro pequeño y se escoge una única celda marina a menos de 10 km,
  cercana al punto de la escuela (36.2246, -6.0617). Debe tener al menos 90 % de datos
  válidos de altura, periodo y dirección. La celda se mantiene para todas las horas.
- [MET Norway Locationforecast 2.0](https://api.met.no/weatherapi/locationforecast/2.0/):
  viento de superficie. Conversión explícita de m/s a km/h. Direcciones: de donde viene.
- Para intervalos MET de hasta seis horas, el viento se interpola en las horas de IBI.
  La dirección usa el arco angular más corto (350° → 10° pasa por 0°).
  Nunca se extrapola ni se rellenan huecos mayores de seis horas. Las rachas solo se
  interpolan si existen en ambos extremos; si faltan se publican como `null` y «—».
- `generatedAt` es la fecha de elaboración del JSON, no la de emisión del modelo.
  La fecha de actualización de MET se conserva por separado. Para Copernicus se
  registra la consulta y el horizonte disponible, sin inventar una fecha de emisión.

No es una transformación física de olas hasta la rompiente ni una garantía de seguridad.
El viento offshore no recibe una bonificación automática. Orientación local, bancos,
marea y corrientes requieren validación del monitor. Los umbrales están en `src/lib/surf.ts`.
La ausencia de rachas no impide mostrar una banda orientativa si hay altura, periodo y
viento válidos; se indica la limitación. Una racha ausente nunca equivale a cero.

## Fallos, persistencia y caducidad

El script comprueba unidades, fechas y al menos 24 horas futuras con altura, periodo y
viento. Solo reemplaza el JSON mediante escritura atómica al terminar correctamente.
Si falla una fuente o la validación, no se toca el fichero previo ni se despliega.
El último JSON correcto se guarda mediante un commit exclusivo del archivo; los commits
del bot no fuerzan pushes ni sobrescriben cambios concurrentes. Si el push falla por
concurrencia, se debe repetir el workflow sobre la rama actualizada. Si falla únicamente
el despliegue, el JSON válido permanece en el repositorio y la web conserva su versión
anterior hasta el siguiente despliegue correcto.

- Más de 18 horas desde `generatedAt`: aviso de datos antiguos.
- Más de 48 horas: se oculta la previsión y se remite a la escuela.
- La previsión orienta al alumno; las solicitudes por correo contienen los datos de clase y contacto, sin presentar la previsión como confirmación de las condiciones.
- Sin primera descarga: se muestra el estado pendiente y sigue funcionando la solicitud.

GitHub envía sus notificaciones normales ante fallos. En repositorios públicos puede
deshabilitar la programación tras 60 días sin actividad; revisar Actions si cesan las
actualizaciones. Los commits periódicos del JSON aportan actividad, pero no sustituyen
la comprobación del estado de las ejecuciones.

## Créditos y costes

La interfaz mantiene el crédito de Copernicus con su DOI y MET Norway con CC BY 4.0.

- [Créditos Copernicus](https://help.marine.copernicus.eu/en/articles/4444611-citing-copernicus-marine-products-and-services).
- [Licencia MET](https://docs.api.met.no/doc/License) y [condiciones de acceso](https://api.met.no/doc/TermsOfService).
- [Programador GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

No se contrata ningún servicio de pago. Las ejecuciones usan runners estándar de Linux
en el repositorio público. Se aplican las cuotas/condiciones del hosting Cloudflare
existente, además del coste del dominio si lo hubiera.

## Verificación local

Con Python ≥3.12, crear un entorno virtual e instalar `scripts/forecast-requirements.txt`.
Configurar las dos variables de entorno de Copernicus mediante un gestor de secretos o
entrada privada. Ejecutar `python scripts/update_forecast.py`; después `npm run dev`.
No hace falta desplegar para revisar el JSON y la interfaz.

Pruebas: `python -m unittest discover -s tests -p 'test_*.py'`,
`node --test tests/*.test.mjs` y `npm run build`.
Las pruebas usan datos sintéticos solo en memoria: no generan una previsión ficticia
para servir a los visitantes. La prueba autenticada del modelo IBI requiere la cuenta.
