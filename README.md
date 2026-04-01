# 🚀 Carta Calipso: Arquitectura Web-App "Zero-Build"

Carta Calipso es un motor de menús digitales de alto rendimiento diseñado bajo una arquitectura modular y orientada a datos. A diferencia de las aplicaciones tradicionales, este sistema utiliza una estrategia de **"Zero-Build"**, lo que permite un despliegue instantáneo y una mantenibilidad extrema a través de archivos de configuración TOML.

## 🏗️ Arquitectura del Sistema
La arquitectura se divide en tres capas desacopladas, lo que permite modificar el diseño, la lógica o los datos sin riesgo de efectos secundarios:

### 1. Capa de Datos (TOML-Driven)
El sistema es completamente agnóstico al contenido. Toda la información reside en dos archivos clave:
*   **`config.toml`**: Define el ADN visual (colores, marca) y configuraciones globales como el idioma.
*   **`menu.toml`**: Actúa como la base de datos relacional del menú, organizando categorías, productos y variaciones de precios.

### 2. Caja de Herramientas CSS (Modular Toolkit)
En lugar de un archivo CSS monolítico, se ha creado una estructura de componentes independientes inspirada en la metodología atómica:
*   **Componentes de Visualización**: Diferentes archivos (`type-simple.css`, `type-pills.css`, `type-grid.css`) que el motor activa según la complejidad del producto.
*   **Layout Adaptativo**: Un sistema de navegación "Sticky" que optimiza el espacio en dispositivos móviles.

### 3. El Motor Lógico (`engine.js`)
El núcleo del proyecto es un objeto orquestador que maneja el ciclo de vida de la aplicación:
*   **Inyección de Branding**: Sincroniza en tiempo real las variables de `config.toml` con las propiedades `:root` del CSS.
*   **Renderizado Condicional**: Aplica la Regla de Visualización Automática basada en la cantidad de precios (`types`) de cada producto.

## 🛠️ Soluciones a Problemas de Ingeniería

### 🧩 Desafío: La "Anidación" en TOML
**Problema:** Los parsers de TOML ligeros para navegador suelen fallar al leer estructuras anidadas profundas como `[[categories.products.types]]`.  
**Solución:** Se implementó un `toml-parser.js` personalizado capaz de navegar por puntos en las claves, permitiendo que el navegador entienda jerarquías complejas de datos sin necesidad de un backend.

### 📍 Desafío: UX de "Scroll Infinito"
**Problema:** En menús extensos, el usuario pierde el contexto de en qué categoría se encuentra.  
**Solución:** Se integró un `IntersectionObserver` avanzado. Este "espía" de scroll detecta qué sección está en pantalla y sincroniza automáticamente la barra de navegación horizontal, moviéndola para que el "Tab" activo siempre sea visible y esté resaltado.

### ⚡ Desafío: Rendimiento y SEO
**Problema:** El uso de frameworks como React o Vue añade peso innecesario para un menú digital.  
**Solución:** Arquitectura **Vanilla JS**. El tiempo de carga es casi nulo y es ideal para ser servido en Cloudflare Pages, aprovechando su red de borde (Edge) para entregas de milisegundos.

## 📂 Estructura de Archivos
```plaintext
/CartaCalipso
├── config.toml           # Configuración de Marca (Colores, Nombre)
├── menu.toml             # Base de Datos de Productos
├── index.html            # Ensamblador de Componentes
├── /js
│   ├── engine.js         # Orquestador y Lógica de UX
│   └── toml-parser.js    # Parser de Datos Optimizado
└── /css
    ├── base.css          # Reset y Variables de Diseño
    ├── layout.css        # Navegación y Estructura Global
    └── /components       # Herramientas de Visualización Atómica
```

## 🛠️ Cómo Mantenerlo
Para actualizar el menú, no es necesario tocar el código. Simplemente edite el archivo `menu.toml`. El motor detectará si un producto tiene 1, 2 o más precios y elegirá automáticamente la mejor "herramienta" visual para mostrarlo.

---
**Autor:** Jefferson Vaca Santana  
**Tecnologías:** TOML, Vanilla JS, CSS3 Moderno (Grid & Flexbox), Intersection Observer API.
