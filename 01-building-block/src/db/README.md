# Schema Drizzle ORM con Zod - Productos de Catálogo

Este directorio contiene la configuración de la base de datos SQLite con Drizzle ORM y validación con Zod para un sistema de gestión de productos de catálogos de venta (como Leonisa).

## Estructura de Archivos

- **`schema.ts`** - Definición de tablas Drizzle y esquemas Zod
- **`db.ts`** - Cliente Drizzle conectado a SQLite
- **`queries.ts`** - Funciones para importar y consultar productos
- **`examples.ts`** - Ejemplos de uso del schema

## Tablas

### `catalogs`

Almacena información sobre los catálogos de venta.

| Campo       | Tipo          | Descripción                         |
| ----------- | ------------- | ----------------------------------- |
| id          | INTEGER (PK)  | ID único                            |
| catalog     | TEXT (UNIQUE) | Nombre del catálogo (ej: 'leonisa') |
| campaign    | TEXT (UNIQUE) | Código de campaña (ej: '172025')    |
| description | TEXT          | Descripción opcional                |
| created_at  | TIMESTAMP     | Fecha de creación                   |
| updated_at  | TIMESTAMP     | Fecha de última actualización       |

**Constraint**: `catalog` y `campaign` forman una clave única (no puede haber duplicados).

### `products`

Almacena los productos del catálogo.

| Campo         | Tipo          | Descripción                   |
| ------------- | ------------- | ----------------------------- |
| id            | INTEGER (PK)  | ID único                      |
| sku           | TEXT (UNIQUE) | SKU normalizado a 6 dígitos   |
| catalog_id    | INTEGER (FK)  | Referencia al catálogo        |
| product_name  | TEXT          | Nombre del producto           |
| color_variant | TEXT          | Variante de color             |
| size_variant  | TEXT          | Variante de tamaño            |
| unit_price    | REAL          | Precio unitario               |
| page          | INTEGER       | Página del catálogo           |
| created_at    | TIMESTAMP     | Fecha de creación             |
| updated_at    | TIMESTAMP     | Fecha de última actualización |

## Validación con Zod

### Normalización de SKU

Los SKU se normalizan automáticamente a 6 dígitos rellenando con ceros a la izquierda:

```typescript
'123'    → '000123'
'19976'  → '019976'
'5'      → '000005'
```

### Esquemas de Validación

- `insertCatalogSchema` - Validación para insertar catálogos
- `insertProductSchema` - Validación para insertar productos
- `csvProductRowSchema` - Validación para filas del CSV
- `selectCatalogSchema` - Schema automático del SELECT
- `selectProductSchema` - Schema automático del SELECT

## Uso

### 1. Importar productos desde CSV

```typescript
import { importProductsFromCSV } from './queries.js';

const result = await importProductsFromCSV(
  './context/leonisa_c17_skus_v1.csv',
  'leonisa',
  '172025'
);

console.log(`Importados: ${result.success}`);
console.log(`Errores: ${result.failed}`);
```

### 2. Consultar productos

```typescript
import { getProductsByCatalog, getProductBySKU } from './queries.js';

// Obtener todos los productos de un catálogo
const products = await getProductsByCatalog('leonisa', '172025');

// Obtener un producto por SKU
const product = await getProductBySKU('19976');
```

### 3. Insertar catálogo manualmente

```typescript
import { db } from './db.js';
import { catalogs, insertCatalogSchema } from './schema.js';

const newCatalog = insertCatalogSchema.parse({
  catalog: 'leonisa',
  campaign: '172025',
  description: 'Catálogo Leonisa Campaña 172025'
});

await db.insert(catalogs).values(newCatalog);
```

### 4. Insertar producto manualmente

```typescript
import { db } from './db.js';
import { products, insertProductSchema } from './schema.js';

const newProduct = insertProductSchema.parse({
  sku: '019976',
  catalogId: 1,
  productName: 'Top sin costuras',
  colorVariant: 'Azul Oscuro',
  sizeVariant: 'S',
  unitPrice: 46990,
  page: 4
});

await db.insert(products).values(newProduct);
```

## Tipos TypeScript

Los tipos se generan automáticamente desde Zod:

```typescript
import { Catalog, Product, InsertCatalog, InsertProduct } from './schema.js';

const catalog: Catalog = await getProductsByCatalog(...);
const product: Product = { /* ... */ };
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_FILE_NAME=./drizzle/sqlite.db
```

## Características

✅ **Normalización automática de SKU** - Los SKU se completan con ceros a la izquierda  
✅ **Validación con Zod** - Todos los datos se validan antes de guardar  
✅ **Importación desde CSV** - Procesa archivos CSV automáticamente  
✅ **Timestamps automáticos** - Fechas de creación y actualización  
✅ **Upsert en importación** - Los SKU duplicados se actualizan  
✅ **Relaciones entre tablas** - Catálogos y productos vinculados  

## Notas de Desarrollo

- El cliente Drizzle usa `better-sqlite3` para máxima performance en SQLite
- Los errores de importación CSV se registran sin detener el proceso
- La base de datos se crea automáticamente en la primera ejecución
- Los timestamps se guardan en formato Unix (integer) para compatibilidad SQLite
