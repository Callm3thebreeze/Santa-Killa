# Prompt para agente IA · Web estática Santa Killa

Actúa como un desarrollador frontend senior experto en Astro, TypeScript, accesibilidad web, rendimiento, arquitectura de componentes y diseño UI premium.

Quiero que desarrolles una web estática sencilla, elegante, responsive y accesible para una escuela de surf ubicada en El Palmar, Cádiz.

## 1. Contexto del proyecto

La escuela se llama:

**Santa Killa**

La web debe transmitir una imagen limpia, premium, moderna y alejada de las típicas plantillas genéricas de WordPress. Debe sentirse artesanal, cuidada, visualmente potente y muy ligera.

Será una web estática desarrollada con:

- Astro
- TypeScript
- HTML semántico
- CSS moderno, preferiblemente usando CSS Modules, SCSS o una arquitectura CSS clara y mantenible
- Componentes reutilizables
- Buenas prácticas de rendimiento
- Accesibilidad WCAG como requisito prioritario

No debe incluir CMS, panel de administración ni backend.

---

## 2. Objetivo principal

Crear una landing/home page completa para la escuela de surf Santa Killa.

La web debe servir para:

- Presentar la escuela.
- Mostrar una imagen atractiva y profesional.
- Informar sobre tarifas.
- Mostrar horarios.
- Facilitar el contacto.
- Mostrar la ubicación mediante un mapa de Google Maps bien integrado.
- Funcionar perfectamente en móvil, tablet y desktop.
- Tener una experiencia visual fluida mediante animaciones sutiles.

---

## 3. Estilo visual

La estética debe ser:

- Minimalista.
- Limpia.
- Premium.
- Con mucho espacio en blanco.
- Inspirada en el surf, la playa, el Atlántico y El Palmar, pero sin caer en clichés visuales recargados.
- Moderna y editorial.
- Con sensación de marca cuidada.

### Colores

Usar una paleta extremadamente simple:

- Fondo principal: blanco.
- Texto principal: negro.
- Se pueden usar grises muy suaves para separadores, bordes o textos secundarios.
- No usar colores llamativos salvo que sea estrictamente necesario y de forma muy sutil.

Ejemplo orientativo:

```css
--color-white: #ffffff;
--color-black: #0a0a0a;
--color-gray-100: #f5f5f5;
--color-gray-300: #d4d4d4;
--color-gray-600: #525252;
```

### Tipografías

Usar:

- **Inter** como tipografía principal para textos, navegación, párrafos, botones y contenido general.
- Una tipografía secundaria con personalidad playera/surf/editorial para títulos grandes.

La tipografía secundaria debe tener un aire artesanal, playero o retro surf, pero manteniendo un acabado premium. Puede usarse una Google Font adecuada, por ejemplo:

- Bricolage Grotesque
- Fraunces
- Young Serif
- Playfair Display
- Cormorant Garamond
- O una alternativa mejor justificada

Evitar tipografías demasiado caricaturescas.

---

## 4. Estructura general de la página

La web tendrá una única página principal con las siguientes secciones:

1. Header transparente sobre el hero.
2. Hero full viewport con vídeo de fondo.
3. Sección introductoria sobre la escuela.
4. Sección de tarifas.
5. Sección de horarios.
6. Sección de ubicación y contacto.
7. Footer minimalista.

---

## 5. Header

Crear un header minimalista, transparente y superpuesto sobre el hero.

Debe incluir:

- Logo o texto de marca “Santa Killa”.
- Navegación con estos enlaces:

```txt
INFO ESCUELA
HORARIO
UBICACIÓN
CONTACTO
```

Requisitos:

- El header debe quedar sobre el hero.
- Debe ser transparente inicialmente.
- Debe tener buen contraste sobre el vídeo oscuro.
- En móvil debe convertirse en una navegación responsive accesible.
- El menú móvil debe ser usable con teclado.
- El botón de menú debe tener `aria-label`, `aria-expanded` y comportamiento accesible.
- Los enlaces deben hacer scroll suave hacia las secciones correspondientes.
- El header debe mantener una estética limpia y premium.

---

## 6. Hero

Crear un hero a ancho completo que cubra toda la primera vista en desktop.

Características:

- Debe ocupar como mínimo `100vh` en desktop.
- Debe tener un vídeo de fondo en bucle.
- El vídeo debe estar oscurecido mediante overlay para asegurar contraste.
- El logo de la escuela debe aparecer centrado encima del vídeo.
- El logo puede ser una imagen placeholder ubicada en `/public/images/logo-santa-killa.svg` o similar.
- Si no existe logo real, crear una estructura preparada para sustituirlo fácilmente.
- Añadir un texto secundario opcional tipo:

```txt
Escuela de surf en El Palmar, Cádiz
```

- Añadir una llamada a la acción sutil, por ejemplo:

```txt
Ver tarifas
```

o

```txt
Contactar
```

Requisitos técnicos del vídeo:

- Debe estar en `/public/videos/hero-surf.mp4` como placeholder.
- Usar `autoplay`, `muted`, `loop`, `playsinline`.
- Añadir una imagen fallback/poster.
- Evitar que el vídeo afecte negativamente al rendimiento.
- El vídeo debe ser decorativo, por tanto debe quedar correctamente tratado para accesibilidad.
- Garantizar contraste suficiente entre texto/logo y fondo.

---

## 7. Sección introductoria

Crear una sección con id:

```html
<section id="info-escuela">
```

Contenido orientativo:

- Título atractivo sobre la escuela.
- Texto introductorio sobre Santa Killa.
- Mencionar que está ubicada en El Palmar, Cádiz.
- Transmitir cercanía, experiencia, ambiente de playa y aprendizaje seguro.
- Incluir varias fotos integradas de forma elegante.

Estructura sugerida:

- Layout en dos columnas en desktop.
- Texto en una columna.
- Composición de 2 o 3 imágenes en la otra.
- En móvil, apilar el contenido.
- Usar imágenes placeholder en `/public/images/`.

Texto de ejemplo, ajustable:

```txt
Santa Killa nace junto al Atlántico, en una de las playas más especiales de Cádiz: El Palmar. Una escuela pensada para aprender a surfear con calma, seguridad y buen ambiente, tanto si es tu primera vez sobre una tabla como si quieres mejorar tu técnica.
```

Requisitos:

- Imágenes optimizadas con `astro:assets` cuando sea posible.
- Alt text descriptivo.
- No usar imágenes como mero relleno si transmiten información.
- Animación suave de entrada al hacer scroll.

---

## 8. Sección de tarifas

Crear una sección con id:

```html
<section id="tarifas">
```

Debe mostrar una tabla o cards de tarifas.

Como no tenemos tarifas reales, usar datos mock fácilmente editables desde un archivo separado, por ejemplo:

```ts
src/data/pricing.ts
```

Ejemplo de tarifas:

```ts
export const pricing = [
  {
    title: "Clase individual",
    description: "Sesión personalizada para avanzar a tu ritmo.",
    price: "45€",
    duration: "1h 30min"
  },
  {
    title: "Clase en grupo",
    description: "Aprende con más personas en un ambiente divertido y seguro.",
    price: "30€",
    duration: "1h 30min"
  },
  {
    title: "Bono 5 clases",
    description: "Perfecto para progresar durante varios días.",
    price: "140€",
    duration: "5 sesiones"
  }
];
```

Requisitos:

- Las tarifas deben mostrarse con diseño limpio y premium.
- Cards con mucho aire, bordes sutiles y jerarquía clara.
- No usar estilos excesivamente comerciales.
- Debe ser fácilmente escalable.
- Los datos no deben estar hardcodeados en el componente.

---

## 9. Sección de horarios

Crear una sección con id:

```html
<section id="horario">
```

Debe mostrar horarios de atención.

Usar datos mock en archivo separado, por ejemplo:

```ts
src/data/schedule.ts
```

Ejemplo:

```ts
export const schedule = [
  { day: "Lunes a viernes", hours: "09:00 - 19:00" },
  { day: "Sábados", hours: "09:00 - 14:00" },
  { day: "Domingos", hours: "Consultar disponibilidad" }
];
```

Requisitos:

- Debe quedar claro que los horarios pueden variar según condiciones del mar.
- Incluir un pequeño texto:

```txt
Los horarios pueden adaptarse según mareas, viento y condiciones del mar.
```

- Diseño simple y elegante.
- Accesible y legible en móvil.

---

## 10. Sección de ubicación y contacto

Crear una sección con id:

```html
<section id="ubicacion">
```

También debe permitir navegación desde el enlace “CONTACTO”, por lo que se puede incluir un bloque interno con id `contacto`.

Debe incluir:

- Texto de contacto.
- Ubicación: El Palmar, Cádiz.
- Teléfono placeholder.
- Email placeholder.
- Enlace a WhatsApp placeholder.
- Mapa de Google Maps integrado.

Datos mock sugeridos:

```ts
export const contact = {
  phone: "+34 600 000 000",
  email: "hola@santakilla.com",
  whatsapp: "https://wa.me/34600000000",
  location: "El Palmar, Cádiz"
};
```

Requisitos del mapa:

- Integrar Google Maps mediante iframe.
- El iframe debe tener `title`.
- Debe estar visualmente integrado con bordes sutiles o contenedor limpio.
- Debe ser responsive.
- No debe romper el rendimiento.
- Añadir `loading="lazy"`.
- Añadir texto alternativo o enlace externo a Google Maps para accesibilidad.

---

## 11. Footer

Crear un footer minimalista.

Debe incluir:

- Nombre de la escuela.
- Año actual dinámico.
- Enlaces básicos.
- Información corta de ubicación.
- Diseño sobrio, limpio y elegante.

Ejemplo:

```txt
© 2026 JV DEV & Escuela de surf en El Palmar, Cádiz.
```

---

## 12. Animaciones

Añadir animaciones sutiles y elegantes.

Requisitos:

- Animación de entrada inicial en el hero.
- Animaciones suaves al aparecer cada bloque de contenido.
- No usar animaciones invasivas.
- Respetar `prefers-reduced-motion`.
- Las animaciones no deben perjudicar rendimiento ni accesibilidad.

Se puede usar:

- CSS transitions.
- Intersection Observer.
- Una pequeña utilidad propia.
- Evitar librerías pesadas salvo justificación.

Crear una solución simple y reutilizable, por ejemplo:

```ts
src/scripts/reveal-on-scroll.ts
```

o un componente/utilidad equivalente.

---

## 13. Accesibilidad

La web debe aspirar a cumplir WCAG al 100%.

Requisitos mínimos:

- HTML semántico.
- Uso correcto de `header`, `nav`, `main`, `section`, `footer`.
- Enlaces y botones accesibles.
- Navegación por teclado.
- Estados `focus-visible` claros.
- Contraste suficiente.
- Textos alternativos en imágenes.
- El vídeo de fondo debe ser decorativo y no interferir con lectores de pantalla.
- Evitar contenido únicamente visual.
- El mapa debe tener título y alternativa textual.
- Menú móvil accesible.
- No bloquear zoom.
- Buen orden de lectura.
- Usar landmarks correctamente.
- Añadir enlace de salto al contenido principal:

```html
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>
```

- Respetar `prefers-reduced-motion`.

---

## 14. Rendimiento

La web debe tener muy buen rendimiento.

Requisitos:

- Optimización de imágenes.
- Uso de `astro:assets` cuando proceda.
- Lazy loading en imágenes no críticas.
- Evitar JavaScript innecesario.
- No usar frameworks pesados si no son necesarios.
- Minimizar dependencias.
- El vídeo debe estar comprimido y con poster.
- CSS organizado y sin exceso.
- Buenas métricas Core Web Vitals.
- Lighthouse objetivo: 95-100 en Performance, Accessibility, Best Practices y SEO.
- SEO local excelente, con contenido optimizado para posicionar una escuela de surf en El Palmar, Cádiz.

---

## 15. SEO excelente y posicionamiento local

El SEO es un requisito prioritario del proyecto, no un añadido secundario.

La web debe estar optimizada para posicionar bien en búsquedas relacionadas con escuelas de surf, clases de surf y actividades de surf en El Palmar, Cádiz.

Objetivo SEO principal:

- Posicionar la web para búsquedas locales como:
  - escuela de surf en El Palmar
  - clases de surf en El Palmar
  - surf El Palmar Cádiz
  - escuela de surf Cádiz
  - clases de surf Cádiz
  - aprender surf en El Palmar
  - Santa Killa surf
- Mejorar la visibilidad orgánica de la escuela.
- Transmitir confianza, profesionalidad y cercanía.
- Facilitar que Google entienda claramente qué ofrece la escuela, dónde está ubicada y cómo contactar.

Implementar SEO técnico y de contenido:

- `title` optimizado.
- `description` optimizada.
- Open Graph básico.
- Twitter Card básica.
- `lang="es"`.
- Metadatos correctos.
- Canonical preparado.
- Estructura de headings coherente.
- Un único `h1` claro y orientado a intención de búsqueda.
- Jerarquía correcta de `h2` y `h3`.
- Contenido orientado a escuela de surf en El Palmar, Cádiz.
- URLs limpias, aunque sea una landing estática.
- Imágenes con nombres descriptivos y `alt` optimizados.
- Buen rendimiento para favorecer Core Web Vitals.
- HTML semántico que ayude al rastreo.
- Datos estructurados Schema.org en formato JSON-LD.

Añadir datos estructurados para negocio local, usando `LocalBusiness` o un subtipo apropiado, por ejemplo `SportsActivityLocation`, si encaja mejor.

El JSON-LD debe incluir, como mínimo:

- Nombre del negocio: Santa Killa
- Tipo de negocio
- Descripción
- Ubicación: El Palmar, Cádiz
- Teléfono placeholder
- Email placeholder
- URL placeholder
- Horario de atención
- Imagen/logo placeholder
- Mismo idioma que la página
- Coordenadas placeholder si procede

También se puede añadir marcado adicional para:

- Servicios ofrecidos.
- Clases de surf.
- Tarifas o rango de precios.
- Preguntas frecuentes si se considera útil.

Incluir una pequeña sección de contenido SEO natural, sin parecer texto artificial para Google. Debe estar integrada en el diseño y reforzar términos relevantes como:

- escuela de surf en El Palmar
- clases de surf para principiantes
- clases de surf para todos los niveles
- surf en Cádiz
- aprendizaje seguro
- instructores de surf
- condiciones del mar
- playa de El Palmar

Evitar keyword stuffing. El contenido debe sonar natural, humano y comercialmente atractivo.

Ejemplo de título:

```txt
Santa Killa | Escuela de surf en El Palmar, Cádiz
```

Ejemplo de description:

```txt
Escuela de surf en El Palmar, Cádiz. Clases de surf para todos los niveles en un entorno seguro, cercano y junto al Atlántico.
```

Ejemplo de enfoque para el `h1`:

```txt
Escuela de surf en El Palmar, Cádiz
```

Requisitos adicionales de SEO local:

- Preparar el contenido para conectar bien con una futura ficha de Google Business Profile.
- Incluir NAP consistente: nombre, dirección/zona, teléfono.
- Añadir enlace externo a Google Maps.
- Incluir llamadas a la acción claras hacia contacto o WhatsApp.
- Preparar una sección de preguntas frecuentes si ayuda al posicionamiento.

Ejemplos de FAQs útiles:

- ¿Dónde está la escuela de surf Santa Killa?
- ¿Hay clases para principiantes?
- ¿Qué necesito llevar a mi primera clase de surf?
- ¿Los horarios dependen de las mareas?
- ¿Puedo reservar por WhatsApp?

Si se incluye FAQ, implementar también `FAQPage` en JSON-LD.

---

## 16. Arquitectura esperada

Organiza el proyecto de forma limpia y escalable.

Estructura sugerida:

```txt
src/
  components/
    Header.astro
    Hero.astro
    IntroSection.astro
    PricingSection.astro
    ScheduleSection.astro
    ContactSection.astro
    Footer.astro
    SectionHeading.astro
  data/
    pricing.ts
    schedule.ts
    contact.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
  scripts/
    reveal-on-scroll.ts
  styles/
    global.css
    tokens.css
public/
  images/
    logo-santa-killa.svg
    hero-poster.jpg
    school-01.jpg
    school-02.jpg
    school-03.jpg
  videos/
    hero-surf.mp4
```

Puedes ajustar esta estructura si tienes una alternativa mejor, pero debe mantenerse clara, modular y mantenible.

---

## 17. Requisitos de implementación

El resultado debe incluir:

1. Código completo del proyecto.
2. Componentes Astro bien separados.
3. Tipado en TypeScript para los datos.
4. CSS organizado.
5. Datos editables en archivos independientes.
6. Animaciones reutilizables.
7. Accesibilidad cuidada.
8. Responsive real.
9. Buen rendimiento.
10. Comentarios sólo donde aporten valor.

No quiero una maqueta superficial. Quiero una base realista y lista para adaptar a producción.

---

## 18. Criterios de calidad visual

Antes de entregar el resultado, revisa que:

- No parezca una plantilla genérica.
- El hero tenga presencia visual premium.
- El diseño respire.
- La tipografía esté bien jerarquizada.
- Los espacios verticales sean generosos.
- Las secciones tengan ritmo.
- Las cards de tarifas sean elegantes.
- El mapa esté integrado y no parezca pegado sin criterio.
- El footer sea minimalista.
- La navegación sea clara.
- El diseño móvil esté cuidado, no simplemente apilado.

---

## 19. Criterios de calidad técnica

Antes de entregar el resultado, revisa que:

- No haya duplicidad innecesaria.
- Los componentes sean reutilizables.
- Los datos editables estén separados.
- No haya estilos inline innecesarios.
- No haya JavaScript excesivo.
- El menú móvil sea accesible.
- El vídeo no perjudique la carga inicial de forma grave.
- Las imágenes tengan `alt`.
- Los enlaces tengan nombres accesibles.
- Los headings sigan una jerarquía correcta.
- El proyecto pueda escalar si en el futuro se añaden más páginas.

---

## 20. Entrega esperada

Devuélveme:

1. La estructura de carpetas final.
2. Los archivos principales con su código completo.
3. Una explicación breve de las decisiones técnicas.
4. Instrucciones para ejecutar el proyecto.
5. Recomendaciones para sustituir los placeholders de imágenes, logo, vídeo, teléfono, email y mapa.
6. Una checklist final de accesibilidad, rendimiento y SEO.

---

## 21. Comandos esperados

El proyecto debe poder ejecutarse con comandos similares a:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Incluye también los scripts necesarios en `package.json`.

---

## 22. Nivel de exigencia

Trabaja como si este proyecto fuese para un cliente real.

Prioriza:

1. Calidad visual.
2. Accesibilidad.
3. Rendimiento.
4. Código limpio.
5. Escalabilidad.
6. Facilidad de mantenimiento.

No simplifiques en exceso. Haz una implementación profesional, cuidada y lista para ser refinada con assets reales.
