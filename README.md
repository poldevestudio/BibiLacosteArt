# Bibi Lacoste — El Rumbo del Recuerdo

> **Obra de Arte Digital Interactiva 3D**  
> Un cosmos procedural de memoria, migración y materia inspirado en la poética visual de la artista **Bibiana María Cristina Lacoste** (Tigre / Belén de Escobar, Buenos Aires).

---

## 🧭 Concepto Narrativo

En esta pieza interactiva, el archivo familiar no es un documento estático: es un tejido vivo que el espectador devela con sus propias manos.

### Fase 1: El Instrumento y el Vacío (0s - 6s)
En una penumbra cálida flotan partículas de polvo de ladrillo, lino crudo y oro antiguo. En el centro descansa un fragmento inclinado de arpillera y papel artesanal.
* **Toque 1:** **Tierra y origen** → *Taipas de arroz* (despierta *«Toda memoria»*).
* **Toque 2:** **Desarraigo** → *Distancias de ultramar* (despierta *«es un viaje»* y nace el hilo conductor).
* **Toque 3:** **Oficios** → *Cítricos que transforman paisajes* (despierta *«que busca»*).
* **Toque 4:** **Memoria** → *El papel como recuerdo* (despierta *«su rumbo.»* y se completa la constelación con un acorde armónico).

### Transición: El Hiperzoom (6s)
Al dar el **5º toque**:
* Las cuatro palabras se dispersan hacia los costados en el vacío.
* El relicario se abre y la cámara realiza un **hiperzoom** atravesando el centro del espacio.
* Las partículas de polvo de ladrillo se aceleran en estelas a través de un túnel temporal con sonido de viento y resonancia grave.

### Fase 2: El Cosmos 3D de la Materia (Inspiración Olafur Eliasson)
La cámara emerge dentro de un espacio infinito rodeado por una lluvia continua de **1.600 partículas de polvo de ladrillo y oro** en 3D.
* **10 fragmentos escultóricos flotantes:** retazos de óleo turquesa estilo *Solapado*, prensa antigua de ultramar 1967, taipas de arrozales, pulpa de algodón calada, corteza de cítricos, bocetos arquitectónicos del taller en Tigre, betún con pan de oro, gasa y trama disgregada, estratigrafía acrílica y siluetas de araucaria.
* **Exploración orbital:**
  * **Arrastrar (Mouse / Dedo):** Orbita suavemente en 3D alrededor de los fragmentos.
  * **Rueda del mouse / Pellizco (Pinch-to-zoom):** Acercamiento (*Zoom In*) para ver texturas al detalle o alejamiento (*Zoom Out*) para contemplar la constelación completa.
  * **Roce / Hover táctil:** Al pasar el cursor sobre un fragmento, este se ilumina con halo dorado, se orienta hacia la cámara, emite un armónico cristalino y devela una tarjeta flotante con su microfrase poética.

---

## 🛠️ Tecnologías

* **Three.js (r128):** Renderizado WebGL 3D, geometrías deformadas proceduralmente con curvatura orgánica, materiales `MeshStandardMaterial` de doble faz con canal de emisión.
* **HTML5 Procedural Canvas:** Generación 100% autónoma en tiempo real de texturas textiles de arpillera, hilos de trama/urdimbre, bordes deshilachados con transparencia alpha y 10 fragmentos pictóricos. **Sin dependencias externas ni problemas de CORS**.
* **Web Audio API:** Síntesis sonora procedural en tiempo real (crujido de rasgado textil, viento cósmico y acordes armónicos en escala pentatónica).
* **SVG Dinámico:** Curvas cúbicas Bézier subdivididas matemáticamente con el algoritmo De Casteljau para el trazo progresivo del hilo conductor `- - - - - - -`.

---

## 🚀 Despliegue Rápido

El proyecto está 100% autocontenido en un único archivo `index.html`. Podés subirlo directamente a **GitHub Pages**, **Vercel** o **Netlify**:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```
