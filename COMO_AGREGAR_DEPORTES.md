# 📖 Guía: Cómo Agregar Nuevos Deportes en Hercix

¡Hola Sebastian! Si en el futuro el Sr. Mario te pide añadir un nuevo deporte (por ejemplo, **Karate**, **Ciclismo** o **Pádel**), no te preocupes. Tú mismo puedes hacerlo en menos de 1 minuto siguiendo estos sencillos pasos, sin necesidad de saber programar cosas complejas.

Solo debes modificar una lista en **dos archivos de texto** del frontend.

---

## 🛠️ Paso 1: Agregar el deporte al formulario (Modal)

Abre el archivo:
📁 `frontend/src/pages/gyms/CreateGymModal.tsx`

Busca al inicio del archivo (alrededor de la línea 87) una lista llamada `AVAILABLE_SPORTS` que se ve así:

```typescript
const AVAILABLE_SPORTS = [
  { id: 'Gimnasio', label: '🏋️ Gimnasio' },
  { id: 'Fútbol', label: '⚽ Fútbol' },
  { id: 'Vóley', label: '🏐 Vóley' },
  ...
];
```

Para añadir un nuevo deporte, simplemente agrega una línea al final de la lista con una coma `,` y el nuevo deporte con su emoji. Por ejemplo, si quieres agregar **Karate**:

```diff
const AVAILABLE_SPORTS = [
  { id: 'Gimnasio', label: '🏋️ Gimnasio' },
  { id: 'Fútbol', label: '⚽ Fútbol' },
  { id: 'Vóley', label: '🏐 Vóley' },
  { id: 'Básquetbol', label: '🏀 Básquetbol' },
  { id: 'Tenis', label: '🎾 Tenis' },
  { id: 'Natación', label: '🏊 Natación' },
  { id: 'Box', label: '🥊 Box' },
  { id: 'Atletismo', label: '🏃 Atletismo' },
+ { id: 'Karate', label: '🥋 Karate' }
];
```

---

## 🔍 Paso 2: Agregar el deporte al Buscador del Mapa

Abre el archivo:
📁 `frontend/src/pages/discovery/MapSearchPage.tsx`

Busca al inicio del archivo (alrededor de la línea 181) una lista llamada `SPORT_FILTERS` que se ve así:

```typescript
const SPORT_FILTERS = [
  { label: 'Todos', value: '' },
  { label: '🏋️ Gimnasio', value: 'Gimnasio' },
  { label: '⚽ Fútbol', value: 'Fútbol' },
  ...
];
```

Igual que en el paso anterior, añade el deporte con su emoji al final de la lista. Siguiendo el ejemplo de **Karate**:

```diff
const SPORT_FILTERS = [
  { label: 'Todos', value: '' },
  { label: '🏋️ Gimnasio', value: 'Gimnasio' },
  { label: '⚽ Fútbol', value: 'Fútbol' },
  { label: '🏐 Vóley', value: 'Vóley' },
  { label: '🏀 Básquetbol', value: 'Básquetbol' },
  { label: '🎾 Tenis', value: 'Tenis' },
  { label: '🏊 Natación', value: 'Natación' },
  { label: '🥊 Box', value: 'Box' },
  { label: '🏃 Atletismo', value: 'Atletismo' },
+ { label: '🥋 Karate', value: 'Karate' }
];
```

---

## 🚀 Paso 3: Guardar y Desplegar

1. Guarda los dos archivos en tu editor de código.
2. Sube los cambios al repositorio remoto ejecutando en tu terminal:
   ```bash
   git add .
   git commit -m "feat: añadir categoría Karate"
   git push jefe main
   ```

¡Y listo! En 1 minuto el nuevo deporte aparecerá en el formulario para los dueños y en los filtros del mapa para todos los usuarios.
