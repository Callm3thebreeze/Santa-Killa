# Video del hero

`hero.mp4` es el vídeo que debe usar la web en el hero. `hero.mov` queda como original fuente o respaldo. Astro no optimiza vídeo con un componente equivalente a `astro:assets`, así que para este caso la ruta correcta es servirlo desde `public/videos/`.

Recomendaciones:
- Duracion: 8-15 segundos en bucle.
- Resolucion: 1920x1080 o 1280x720 si el peso es prioritario.
- Peso objetivo: idealmente menos de 3 MB.
- Compatibilidad: `hero.mp4` es la opción principal para web. Si quieres reforzar todavía más la compatibilidad o compresión, puedes añadir también una versión WebM.
- Exportar con `muted`, sin pista de audio y con poster en `/public/images/hero-poster.svg` o equivalente.
