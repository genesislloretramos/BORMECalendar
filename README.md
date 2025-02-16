# Vite React TS PDF & BORME Viewer

Aplicación web moderna desarrollada con Vite, React y TypeScript para extraer, procesar y visualizar texto extraído de PDFs provenientes de la API BOE/BORME. El proyecto integra herramientas de análisis estático (ESLint), procesamiento de PDFs (pdfjs-dist) y una interfaz de calendario interactiva, ofreciendo una solución robusta y escalable para desarrolladores que requieren trabajar con datos oficiales y estructurados.

---

## Tabla de Contenidos

- [Descripción Técnica](#descripción-técnica)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Uso](#instalación-y-uso)
- [Desarrollo](#desarrollo)
- [Despliegue](#despliegue)
- [Configuración](#configuración)
- [Licencia](#licencia)

---

## Descripción Técnica

Este proyecto se centra en la integración de múltiples tecnologías y herramientas para ofrecer una experiencia de desarrollo de alto nivel:

- **Extracción y Procesamiento de PDFs:** Se utiliza `pdfjs-dist` para extraer texto de documentos PDF, seguido de un procesamiento personalizado que limpia y estructura el contenido. Se realiza la transformación de texto, eliminando líneas innecesarias y fusionando contenido según patrones definidos, garantizando que la información relevante se mantenga claramente delimitada.
  
- **Consumo y Parseo de Datos:** La aplicación consume datos de la API BOE/BORME, manejando respuestas en XML y JSON. Se implementa una función recursiva para transformar XML en objetos JSON, facilitando su manipulación y visualización.
  
- **Interfaz de Usuario Dinámica:** Se implementa una vista de calendario que permite navegar por días específicos. Cada celda del calendario refleja el estado de la extracción de datos (éxito, error o cargando), y al interactuar, se despliega un modal con información detallada y la opción de visualizar el texto del PDF.
  
- **Calidad y Mantenibilidad del Código:** La configuración personalizada de ESLint asegura que el código se mantenga limpio y conforme a las mejores prácticas. La integración de TypeScript refuerza la tipificación, previniendo errores comunes y facilitando la escalabilidad.

---

## Características

- **Extracción de Texto de PDF:** Uso de `pdfjs-dist` para obtener y procesar contenido textual de PDFs.
- **Parseo de XML y JSON:** Conversión de respuestas XML a JSON mediante una función recursiva.
- **Interfaz de Calendario:** Visualización de datos diarios con estados dinámicos y manejo de errores.
- **Modal de Información:** Ventana emergente para ver detalles y el texto extraído del PDF.
- **Proxy y Reescrituras en Vercel:** Configuración para redirigir peticiones API y de PDFs, facilitando la integración con servicios externos.
- **Configuración ESLint y TypeScript:** Estándares de código robustos para mantener la calidad y consistencia en el desarrollo.

---

## Stack Tecnológico

- **Frontend:** React, TypeScript
- **Build Tool:** Vite
- **Linter:** ESLint con configuraciones personalizadas para JavaScript y TypeScript, incluyendo plugins para React Hooks y React Refresh.
- **Procesamiento de PDF:** pdfjs-dist
- **Estilos:** CSS con enfoque en diseño responsive y accesibilidad.
- **Despliegue:** Configuración optimizada para Vercel, utilizando reescrituras y proxies.

---

## Estructura del Proyecto

```
.
├── eslint.config.js         // Configuración personalizada de ESLint
├── index.html               // Plantilla HTML principal
├── package.json             // Manifiesto del proyecto con scripts y dependencias
├── vercel.json              // Configuración de Vercel para reescrituras y proxy
├── tsconfig.json            // Configuración base de TypeScript
├── tsconfig.app.json        // Configuración TypeScript para la aplicación
├── tsconfig.node.json       // Configuración TypeScript para el entorno Node (Vite, etc.)
├── vite.config.ts           // Configuración de Vite con el plugin de React y proxy
└── src
    ├── App.tsx              // Componente principal de la aplicación
    ├── App.css              // Estilos para el componente principal de la aplicación
    ├── Calendar.tsx         // Componente de calendario para navegación de fechas y visualización de datos
    ├── Calendar.css         // Estilos para el componente de Calendar
    ├── PdfTextExtractor.tsx // Componente para extracción y procesamiento de texto de PDFs
    ├── SumarioViewer.tsx    // Componente para visualizar el resumen y detalles del contenido
    ├── SumarioViewer.css    // Estilos para el componente de SumarioViewer
    ├── index.css            // Estilos globales de la aplicación
    ├── main.tsx             // Punto de entrada de la aplicación
    └── vite-env.d.ts        // Declaraciones de tipos para Vite
```

---

## Instalación y Uso

1. **Clonar el Repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/vite-react.git
   cd vite-react
   ```

2. **Instalar Dependencias:**

   ```bash
   npm install
   ```

3. **Ejecutar el Servidor de Desarrollo:**

   ```bash
   npm run dev
   ```

   Accede a [http://localhost:3000](http://localhost:3000) para visualizar la aplicación.

4. **Construir para Producción:**

   ```bash
   npm run build
   ```

5. **Previsualizar la Construcción de Producción:**

   ```bash
   npm run preview
   ```

6. **Ejecutar Linter:**

   ```bash
   npm run lint
   ```

---

## Desarrollo

- **Recarga en Caliente:** Vite ofrece una experiencia de desarrollo rápida gracias a su Hot Module Replacement (HMR).
- **Calidad del Código:** La configuración de ESLint impide errores comunes y promueve el uso de buenas prácticas.
- **Tipado Estricto:** TypeScript refuerza la robustez del código, facilitando la identificación temprana de errores y mejorando la mantenibilidad.
- **Integración de APIs:** El uso de proxies en Vite y Vercel permite consumir APIs externas sin enfrentar problemas de CORS.

---

## Despliegue

- **Vercel:** La aplicación está preparada para ser desplegada en Vercel. El archivo `vercel.json` define reescrituras para:
  - `/api-borme/:match*` → `https://boe.es/datosabiertos/api/borme/:match*`
  - `/pdf-proxy/:path*` → `https://www.boe.es/:path*`
- **Optimización de Producción:** Utiliza `npm run build` para generar una versión optimizada y lista para producción.

---

## Configuración

- **ESLint:** La configuración personalizada (`eslint.config.js`) extiende configuraciones recomendadas y añade reglas específicas para React Hooks y React Refresh, garantizando un código limpio y seguro.
- **TypeScript:** Se manejan varias configuraciones (`tsconfig.app.json`, `tsconfig.node.json`) para separar la configuración del entorno del cliente y del servidor.
- **Vite:** `vite.config.ts` incluye el plugin de React y define proxies para redirigir peticiones a la API y a los PDFs, simplificando el desarrollo local y la integración con servicios externos.

---

## Licencia

Este proyecto se distribuye bajo la [Licencia MIT](LICENSE).

---

*Para cualquier duda, sugerencia o contribución, por favor consulta las directrices del repositorio o abre un issue en GitHub.*
