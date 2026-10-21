# Santa Killa | Escuela de surf en El Palmar

Landing estática en Astro para una escuela de surf en El Palmar, Cádiz. El proyecto prioriza diseño editorial ligero, accesibilidad, rendimiento, SEO local y contenido editable en archivos de datos.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
npm run deploy
```

El despliegue en Cloudflare Workers usa `wrangler.jsonc`, sirve el contenido
estático generado en `dist/` y publica el Worker con el nombre `santa-killa`.

## Estructura

```txt
src/
  components/
    ContactSection.astro
    FaqSection.astro
    Footer.astro
    Header.astro
    Hero.astro
    IntroSection.astro
    PricingSection.astro
    ScheduleSection.astro
    SectionHeading.astro
    SeoContentSection.astro
  data/
    contact.ts
    faqs.ts
    navigation.ts
    pricing.ts
    schedule.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
  scripts/
    reveal-on-scroll.ts
    site.ts
  styles/
    global.css
    tokens.css
public/
  images/
    el-palmar-surf.svg
    hero-poster.svg
    logo-santa-killa.svg
    school-01.svg
    school-02.svg
    school-03.svg
  videos/
    hero.mov
```

## Sustitución de placeholders

- Logo: reemplaza `public/images/logo-santa-killa.svg` por el logo definitivo, conservando la ruta o actualizando `Hero.astro` y `BaseLayout.astro`.
- Imágenes: sustituye los SVG de `public/images/` por fotografías optimizadas. Mantén nombres descriptivos y `alt` específicos.
- Vídeo: `public/videos/hero.mov` es el asset actual del hero. Astro no lo optimiza como hace con imágenes, así que se sirve directamente desde `public/`. Si necesitas mejor compatibilidad, añade también una versión MP4 H.264 o WebM.
- Poster: reemplaza `public/images/hero-poster.svg` por un JPG/WebP optimizado si hay fotografía real.
- Contacto: edita `src/data/contact.ts` para teléfono, email, WhatsApp, URL de Google Maps y coordenadas.
- Tarifas y horarios: edita `src/data/pricing.ts` y `src/data/schedule.ts`.

## Checklist

- Accesibilidad: landmarks semánticos, skip link, menú móvil con `aria-expanded`, foco visible, mapa con `title`, vídeo decorativo, textos alternativos y soporte para `prefers-reduced-motion`.
- Rendimiento: Astro estático, JavaScript mínimo, imágenes con dimensiones, lazy loading en recursos no críticos, vídeo con `preload="metadata"` y poster.
- SEO local: `title`, `description`, canonical, Open Graph, Twitter Card, un único `h1`, contenido local para El Palmar/Cádiz, NAP consistente, enlace a Google Maps, Schema.org `SportsActivityLocation` y `FAQPage`.

## Previsión y solicitudes de clase

La sección `#reservas` lee `public/forecast.json`, generado cada seis horas por
GitHub Actions con oleaje IBI de Copernicus Marine y viento de MET Norway.
No hace peticiones a proveedores desde el navegador ni requiere un servidor propio.
La ola y el slider conservan el comportamiento anterior; los días futuros empiezan
a las 09:00. Los datos completos siguen disponibles en el desplegable.

El alumno prepara y envía su solicitud por WhatsApp. La escuela confirma la plaza
manualmente. No se guardan reservas ni se bloquean cupos en esta primera versión.

**Activación, secretos, límites y mantenimiento:** [docs/forecast.md](docs/forecast.md).
El JSON inicial está marcado como pendiente: no contiene previsiones ficticias.

```bash
node --test tests/surf.test.mjs
python -m pip install -r scripts/forecast-requirements.txt
python -m unittest discover -s tests -p 'test_*.py'
python scripts/update_forecast.py
```

El script requiere Python 3.12 o superior y las dos variables de entorno de
Copernicus indicadas en la documentación. La compilación de Astro no requiere Python.
