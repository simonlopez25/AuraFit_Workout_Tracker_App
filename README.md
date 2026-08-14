# AuraFit Workout Tracker

AuraFit es un prototipo web de seguimiento para fuerza, calistenia y cardio. Funciona completamente en el navegador: permite crear rutinas, programarlas por día de la semana, registrar entrenamientos y consultar el progreso acumulado.

## Funciones principales

- Rutinas personalizadas con ejercicios, series, repeticiones y carga.
- Planificador semanal con sesiones puntuales y repetición semanal (por ejemplo, todos los viernes).
- Excepciones por fecha: un día concreto puede quedar libre sin eliminar el resto de la repetición.
- Modo tradicional y modo circuito, con temporizador de descanso.
- Cronómetro de cardio con distancia exacta, ritmo, velocidad, esfuerzo percibido y calorías estimadas según peso corporal.
- Progreso por sesiones, volumen, minutos, experiencia y logros.
- Importación desde texto y copia de seguridad de rutinas.

## Uso

1. Pulsa **Nueva rutina**, añade ejercicios y marca los días en los que quieres repetirla.
2. También puedes tocar un día del calendario, elegir una rutina y activar **Repetir todos los viernes** (o el día que corresponda).
3. En cardio escribe la distancia exacta en kilómetros, indica tu peso y comienza el cronómetro. El ritmo se actualiza como minutos por kilómetro y las calorías se estiman con la fórmula MET × peso (kg) × horas.
4. Finaliza cada sesión para guardar el historial y actualizar el progreso.

## Desarrollo local

No requiere instalación de dependencias. Sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 4173
```

Después abre `http://localhost:4173`.

## Despliegue en Vercel

El proyecto es estático: Vercel debe usar esta carpeta como **Root Directory**. La configuración actual publica `index.html`, `css/` y `js/` completos.

1. Confirma que `index.html`, `css/` y `js/` estén incluidos en el repositorio.
2. Sube los cambios a la rama conectada a Vercel.
3. Lanza un nuevo despliegue desde Vercel.

No se necesita una base de datos ni variables de entorno para el primer prototipo. Los datos se guardan localmente en el navegador mediante `localStorage`; por ello no se sincronizan automáticamente entre dispositivos ni sobreviven al borrado de los datos del navegador.

## Calidad y límites del prototipo

- Las calorías son una estimación, no una medición médica.
- La aplicación valida las distancias entre 0,01 y 999,99 km y el peso entre 30 y 250 kg.
- Antes de producción multiusuario se recomienda añadir autenticación, una base de datos remota, sincronización y una política de privacidad.
