# 🛒 PreciosFacil v2

Una aplicación moderna de comparación de precios que utiliza web scraping para obtener precios en tiempo real de diferentes marketplaces peruanos.

## 🚀 Características

- **Comparación en tiempo real**: Obtén precios actualizados de múltiples marketplaces
- **Interfaz moderna**: UI construida con Material-UI y Next.js
- **Web Scraping avanzado**: Soporte para Puppeteer y Cheerio
- **Arquitectura escalable**: Estructura modular y mantenible
- **TypeScript**: Tipado completo para mejor desarrollo
- **APIs RESTful**: Endpoints para integración con otras aplicaciones

## 🛠️ Tecnologías

### Frontend
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes de UI modernos
- **Tailwind CSS** - Estilos utilitarios
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios

### Backend (API Routes)
- **Next.js API Routes** - APIs del lado del servidor
- **Web Scraping**:
  - Puppeteer - Navegación headless del navegador
  - Cheerio - Análisis HTML
  - Playwright - Automatización web alternativa

### Librerías de utilidad
- **Axios** - Cliente HTTP
- **Winston** - Logging
- **Zod** - Validación de esquemas
- **Lodash** - Utilidades de JavaScript
- **Moment.js** - Manejo de fechas

## 📁 Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── scraping/      # Endpoints de scraping
│   ├── dashboard/         # Página del dashboard
│   ├── products/          # Página de productos
│   ├── compare/           # Página de comparación
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
│   ├── providers/         # Context providers
│   └── ui/                # Componentes de UI
├── constants/             # Constantes de la aplicación
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades compartidas
├── services/              # Servicios de negocio
│   └── scraping/          # Servicios de scraping
├── styles/                # Estilos globales
├── types/                 # Definiciones TypeScript
└── utils/                 # Utilidades
```

## 🚀 Instalación y ejecución

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/preciosfacil-v2.git
   cd preciosfacil-v2
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

4. **Ejecuta el proyecto**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

## 📋 Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica tipos TypeScript

## 🌐 Marketplaces soportados

- **Mercado Libre** - marketplace principal de Latinoamérica
- **Amazon** - tienda global de e-commerce
- **Linio** - marketplace regional
- **Falabella** - retailer chileno con presencia en Perú
- **Ripley** - cadena de tiendas por departamento
- **Walmart** - tienda de retail estadounidense

## 🔧 Configuración de scraping

### Selectores CSS

Cada marketplace tiene selectores específicos configurados en `src/constants/marketplaces.ts`:

```typescript
{
  id: 'mercadolibre',
  name: 'Mercado Libre',
  domain: 'mercadolibre.com',
  selectors: {
    price: '.andes-money-amount__fraction',
    name: '.ui-pdp-title',
    availability: '.ui-pdp-stock',
    image: '.ui-pdp-image img'
  }
}
```

### Estrategias de scraping

1. **Cheerio (rápido)**: Análisis HTML directo para sitios simples
2. **Puppeteer (robusto)**: Navegación completa del navegador para sitios complejos
3. **Fallback automático**: Si un método falla, intenta el otro

## 📊 API Endpoints

### GET /api/scraping
Buscar productos en múltiples marketplaces.

**Parámetros de consulta:**
- `query` (requerido): Término de búsqueda
- `category` (opcional): Categoría del producto
- `marketplaces` (opcional): Lista de marketplaces a buscar
- `limit` (opcional): Número máximo de resultados (1-50)

**Ejemplo:**
```
GET /api/scraping?query=iPhone+15&marketplaces=mercadolibre&marketplaces=amazon&limit=10
```

### POST /api/scraping
Obtener precios de URLs específicas.

**Cuerpo de la solicitud:**
```json
{
  "url": "https://articulo.mercadolibre.com.pe/MLM123456789"
}
```

O para múltiples URLs:
```json
[
  "https://mercadolibre.com.pe/product1",
  "https://amazon.com.pe/product2"
]
```

## 🔒 Consideraciones de seguridad

- **Rate limiting**: Protección contra abuso de APIs
- **User agents**: Headers realistas para evitar bloqueos
- **Timeouts**: Límites de tiempo para evitar recursos bloqueados
- **Logging**: Registro de actividades para monitoreo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**PreciosFacil Team** - [GitHub](https://github.com/preciosfacil)

## 🙏 Agradecimientos

- Next.js team por el increíble framework
- Material-UI por los componentes de UI
- La comunidad open source por todas las librerías utilizadas