# AuraFit Pro — Tracker de Fuerza, Calistenia & Cardio

AuraFit Pro es una aplicación web estática diseñada como tracker de entrenamiento de fuerza, calistenia y cardio. Está pensada para ejecutarse completamente en el navegador: permite crear rutinas, programarlas por día de la semana, registrar sesiones y consultar el progreso acumulado, con una interfaz moderna modularizada en HTML, CSS y JS desacoplados.

## Características principales

- Rutinas personalizadas con ejercicios, series, repeticiones y carga.
- Planificador semanal con repetición configurable por día.
- Modo tradicional y modo circuito, con temporizador de descanso integrado.
- Cronómetro de cardio con distancia exacta, ritmo, velocidad, RPE y calorías estimadas según peso corporal.
- Progreso por sesiones, volumen, minutos, experiencia y sistema de logros.
- Importación desde texto y copia de seguridad de rutinas.
- Sidebar de navegación en escritorio (>= 1024px).
- Autenticación opcional con Supabase para sincronización en la nube.

## Arquitectura del proyecto

El proyecto sigue un patrón de artefacto + parciales:

- `index.html` es el único artefacto HTML y la entrada de Vercel.
- `partials/` almacena los fragmentos que componen `index.html`.
- `css/` contiene módulos CSS modulares.
- `js/` contiene módulos JS desacoplados.
- `scripts/` contiene utilidades de build y verificación.

### Build y parciales

Para regenerar `index.html` a partir de los parciales:

```bash
npm run build:html
# o
node scripts/build.js all
```

Para dividir `css/styles.css` en módulos modulares:

```bash
npm run build:css
# o
node scripts/split-css.js
```

### Verificación

```bash
npm run verify
# o
node scripts/verify-ids.js
node scripts/verify-build.js
```

`verify-build.js` valida que todos los CSS y JS referenciados existan y que la estructura HTML sea correcta. `verify-ids.js` valida que los IDs usados por JS existan en el HTML.

## Estructura de carpetas

```text
.
├── index.html
├── package.json
├── vercel.json
├── css/
│   ├── tokens.css
│   ├── header.css
│   ├── widgets.css
│   ├── cardio.css
│   ├── workout.css
│   ├── modals.css
│   ├── importer-timer.css
│   ├── header-actions.css
│   ├── states.css
│   ├── catalog.css
│   ├── active-modes.css
│   ├── auth.css
│   └── shell.css
├── js/
│   ├── config.js
│   ├── supabaseClient.js
│   ├── auth.js
│   ├── db.js
│   ├── catalog.js
│   ├── routines.js
│   ├── cardio.js
│   ├── calendar.js
│   ├── gamification.js
│   ├── timer.js
│   ├── app.js
│   └── ui.js
├── partials/
│   ├── 00-shell.html
│   ├── 01-header.html
│   ├── 02-navigation.html
│   ├── 03-progress-banner.html
│   ├── 04-calendar.html
│   ├── 05-cardio.html
│   ├── 06-strength.html
│   ├── 07-context-bar.html
│   ├── 08-modals.html
│   ├── 09-auth-modal.html
│   ├── 10-app-close.html
│   └── 11-scripts.html
└── scripts/
    ├── build.js
    ├── split-css.js
    ├── verify-build.js
    └── verify-ids.js
```

## Scripts disponibles

```json
{
  "start": "serve .",
  "build:html": "node scripts/build.js all",
  "build:css": "node scripts/split-css.js",
  "build": "npm run build:css && npm run build:html",
  "verify": "node scripts/verify-ids.js && node scripts/verify-build.js"
}
```

## Desarrollo local

Sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
npm start
# o
python -m http.server 4173
```

Después abre `http://localhost:4173`.

## Despliegue en Vercel

El proyecto es estático y se despliega como sitio estático en Vercel.

1. Confirma que `index.html`, `css/`, `js/`, `partials/` y `scripts/` estén incluidos en el repositorio.
2. La rama conectada a Vercel es `feat/update-ui-and-logic`.
3. Sube los cambios a esa rama.
4. Vercel hará un nuevo despliegue automáticamente.

No se necesita base de datos ni variables de entorno para el funcionamiento base. Los datos se guardan en `localStorage`. La sincronización en la nube es opcional y requiere configurar Supabase.

## Configuración de Supabase (opcional)

Para habilitar la sincronización en la nube, define las variables de entorno de Supabase en `js/config.js`:

```js
export const SUPABASE_URL = 'TU_PROJECT_URL';
export const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

El esquema de base de datos debe incluir tablas para usuarios, rutinas, sesiones y logros. Consulta la documentación de Supabase para el setup.

## Calidad y límites actuales

- Las calorías son una estimación basada en fórmulas MET, no una medición médica.
- La aplicación valida distancias entre 0,01 y 999,99 km y peso entre 30 y 250 kg.
- Los datos se almacenan en `localStorage`, por lo que no sobreviven al borrado de datos del navegador ni se sincronizan entre dispositivos sin Supabase.
- Antes de producción multiusuario se recomienda: autenticación robusta, base de datos remota, sincronización real, y política de privacidad.

## Estado del proyecto

- Rama activa: `feat/update-ui-and-logic`
- Despliegue conectado: `feat/update-ui-and-logic`
- Verificaciones: `npm run verify` debe pasar sin errores antes de cada push.
- Build: `npm run build` regenera `index.html` y los CSS modulares.

## Licencia

MIT
