# AuraFit — Tracker de Fuerza, Calistenia & Cardio

AuraFit es una aplicación web diseñada como tracker de entrenamiento de fuerza, calistenia y cardio. Está construida con React + Vite y pensada para ejecutarse completamente en el navegador: permite crear rutinas, programarlas por día de la semana, registrar sesiones y consultar el progreso acumulado, con una interfaz moderna de diseño luxury bronze y arquitectura Local-First.

## Características principales

- Rutinas personalizadas con ejercicios, series, repeticiones y carga.
- Planificador semanal con repetición configurable por día.
- Modo tradicional con temporizador de descanso integrado.
- Cronómetro de duración de sesión, volumen total y series completadas.
- Progreso por sesiones, volumen, minutos y sistema de logros.
- Importación/exportación de backup JSON de rutinas e historial.
- Diseño responsive con navegación inferior móvil y layout desktop.
- 100% offline, almacenamiento local con IndexedDB (Dexie).

## Arquitectura del proyecto

El proyecto usa Vite + React:

- `index.html` es la entrada HTML.
- `src/main.jsx` monta la aplicación React.
- `src/App.jsx` maneja la navegación y estado global.
- `src/components/` contiene componentes reutilizables.
- `src/features/` contiene las vistas/modales por dominio.
- `src/storage/` contiene la configuración de Dexie y utilidades de backup.
- `src/data/` contiene el catálogo de ejercicios.
- `src/utils/` contiene helpers de audio, vibración y wake lock.

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo en http://localhost:3000
npm run build    # Build de producción en dist/
npm run preview  # Preview del build de producción
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Despliegue en Vercel

El proyecto es estático y se despliega como sitio estático en Vercel.

1. Confirma que `index.html`, `src/`, `public/` y `vercel.json` estén incluidos en el repositorio.
2. La rama conectada a Vercel debe apuntar a la rama con la versión a desplegar.
3. Vercel hará un nuevo despliegue automáticamente al detectar cambios.

No se necesita base de datos ni variables de entorno para el funcionamiento base. Los datos se guardan en IndexedDB. No hay sincronización en la nube en esta versión.

## Calidad y límites actuales

- Las calorías son una estimación basada en fórmulas MET, no una medición médica.
- Los datos se almacenan en IndexedDB, por lo que no sobreviven al borrado de datos del navegador.
- Antes de producción multiusuario se recomienda: autenticación robusta, base de datos remota, sincronización real y política de privacidad.

## Estado del proyecto

- Build: `npm run build` debe pasar sin errores antes de cada push.
- Verificaciones: la app debe cargar correctamente en `npm run dev`.

## Licencia

MIT
