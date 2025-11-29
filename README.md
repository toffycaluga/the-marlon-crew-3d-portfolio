# 🎪 Flying Cáceres – 3D Circus Portfolio

Portafolio interactivo para **The Flying Cáceres**, donde el usuario recorre un circo en 3D y, desde diferentes puntos de vista, descubre la historia, el equipo, los aparatos, los videos y la información de contacto de la troupe.

La experiencia se construye sobre **Astro.js** (como framework principal) y **Three.js** (para la escena 3D).

---

## 🎯 Objetivo

Crear una experiencia web inmersiva donde:

- El visitante recorra un circo virtual.
- Cada vista represente una sección clave del proyecto Flying Cáceres.
- Todo el contenido esté disponible en múltiples idiomas (ES/EN en la versión inicial).
- Se puedan destacar:
  - El fundador,
  - Los equipos,
  - La confección de aparatos y vestuario,
  - El show (videos alojados en AWS),
  - Información técnica para productores.

---

## 🧭 Vistas 3D y secciones

La aplicación tendrá **una única escena 3D** con varios puntos de vista (presets de cámara):

1. **Plataforma del trapecio (`trapecio`)**
   - Rol: Landing principal / Acts highlight.
   - Cámara elevada mirando al interior de la carpa.
   - Contenido:
     - Presentación corta de The Flying Cáceres.
     - Enfoque en el triple y el cruce.
     - CTAs hacia: “Ver el show” (vista público) y “Conocer al fundador” (entrada).

2. **Vestidores (`vestidores`)**
   - Rol: Backstage humano y vestuario.
   - Escena con percheros y trajes simplificados.
   - Contenido:
     - Información sobre confección de vestuario.
     - Presentación del equipo artístico y técnico.

3. **Desde el público (`publico`)**
   - Rol: Showreel principal (videos desde AWS).
   - Cámara en las gradas mirando al escenario.
   - Contenido:
     - Galería de videos (promos, actos, highlight reels).

4. **Equipos (`equipos`)**
   - Rol: Aparatos, fabricación y seguridad.
   - Escena con estructuras y elementos técnicos.
   - Contenido:
     - Listado de aparatos y servicios.
     - Información de seguridad y estándares técnicos.

5. **Entrada del circo (`entrada`)**
   - Rol: About / Founder.
   - Escena con la entrada de la carpa y un cuadro del fundador.
   - Contenido:
     - Bio del fundador.
     - Historia breve de la troupe.

6. **Utilería (`utileria`)**
   - Rol: Extras, FAQ y press kit.
   - Escena con cajas y elementos de backstage.
   - Contenido:
     - FAQ para productores.
     - Links a press kit, fotos y redes sociales.

7. **Pantalla de carga (`loading`)**
   - Rol: Experiencia de inicio + carga real de assets.
   - Visual: carpa o telón cerrado, barra de progreso.
   - Conectado al `LoadingManager` de Three.js.

---

## 🌐 Multiidioma (i18n)

- Versión inicial: **ES** y **EN**.
- Futuro: DE, IT, FR, ZH.

Estrategia:

- Archivos JSON por idioma:
  - `src/i18n/es.json`
  - `src/i18n/en.json`
- Claves organizadas por:
  - `global.*` (títulos, menú, footer),
  - `views.*` (textos por vista),
  - `content.*` (biografías, descripciones más largas).
- Switch de idioma en la UI (ES/EN) que:
  - Actualiza el `lang` actual.
  - Re-renderiza los textos visibles.

---

## 🧱 Stack técnico

- **Astro.js**: estructura del proyecto, routing y renderizado de contenido.
- **Three.js**: escena 3D, cámaras, luces y geometrías.
- **Vite (interno de Astro)**: bundling.
- **CSS / Tailwind (opcional)**: estilado de la UI 2D (paneles, menús, botones).
- **AWS S3 / CloudFront**: almacenamiento de videos (integraremos las URLs en la vista “Desde el público”).

---

## 🗺️ Roadmap de desarrollo

### Fase 1 – Diseño y estructura (sin Blender)

1. Definir contenido por vista (textos, imágenes, videos AWS).
2. Implementar estructura base en Astro:
   - Ruta `/` como experiencia principal.
3. Crear componente `<ThreeScene />`:
   - Escena, cámara, renderer.
   - Geometrías básicas para las zonas del circo.
4. Definir presets de cámara para cada vista y sistema de cambio de vista.

### Fase 2 – i18n y contenido real

1. Crear `es.json` y `en.json` con todo el texto.
2. Integrar un sistema simple de traducción (`t()`).
3. Conectar cada vista a su contenido traducible.
4. Integrar videos de AWS en la vista “Desde el público”.

### Fase 3 – Mejora visual y animaciones

1. Añadir luces, efectos y pequeñas animaciones de cámara.
2. Agregar partículas / efectos para reforzar la sensación de show.
3. Implementar pantalla de carga real con `LoadingManager`.

### Fase 4 – Blender (opcional, fase avanzada)

1. Modelar carpa low poly y algunos aparatos en Blender.
2. Exportar a GLB/GLTF.
3. Cargar modelos con `GLTFLoader` y reemplazar geometrías básicas.

---

## ✅ Objetivo de la primera versión (MVP)

- Home `/` con:
  - Escena 3D básica.
  - 4–5 vistas funcionales (cambio de cámara).
  - Textos en ES/EN.
  - Al menos 1 video funcional desde AWS.
- Interfaz clara para navegar entre:
  - Acts, founder, equipos, videos y contacto (aunque sea minimalista).
