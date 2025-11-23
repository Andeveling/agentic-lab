# Building Blocks: The Augmented LLM

Este repositorio implementa un ejemplo práctico del patrón **"Building block: The augmented LLM"** descrito por Anthropic. Este patrón utiliza un modelo de lenguaje mejorado con capacidades adicionales como recuperación de información, uso de herramientas y memoria para resolver tareas complejas de manera eficiente.

## Componentes

### 1. **Retrieval System**
Sistema de recuperación de información que permite al modelo acceder a datos relevantes en tiempo real.

### 2. **Tools**
Herramientas externas que el modelo puede invocar para realizar acciones específicas, como cálculos, consultas a APIs, entre otros.

### 3. **Memory**
Un sistema de memoria que permite al modelo almacenar y recuperar información contextual relevante durante múltiples interacciones.

## Base de Datos

La base de datos está diseñada utilizando **Drizzle ORM** y **SQLite**. Contiene las siguientes tablas principales:

### Tabla `catalogs`
- **id**: Identificador único (Primary Key).
- **catalog**: Nombre del catálogo (e.g., "leonisa").
- **campaign**: Identificador de la campaña (e.g., "172025").
- **description**: Descripción opcional del catálogo.
- **createdAt**: Fecha de creación.
- **updatedAt**: Fecha de última actualización.

Restricciones:
- Los campos `catalog` y `campaign` deben ser únicos en combinación.

### Tabla `products`
- **id**: Identificador único (Primary Key).
- **sku**: Código único del producto (6 dígitos).
- **catalogId**: Referencia a la tabla `catalogs`.
- **productName**: Nombre del producto.
- **colorVariant**: Variante de color.
- **sizeVariant**: Variante de tamaño.
- **unitPrice**: Precio unitario.
- **page**: Número de página en el catálogo.
- **createdAt**: Fecha de creación.
- **updatedAt**: Fecha de última actualización.

### Validaciones con Zod
Se utilizan esquemas de validación con **Zod** para garantizar la integridad de los datos:
- **`skuSchema`**: Valida que el SKU sea un número de 6 dígitos.
- **`insertCatalogSchema`**: Valida los datos al insertar un nuevo catálogo.
- **`insertProductSchema`**: Valida los datos al insertar un nuevo producto.

## Librerías y Dependencias

- **AI SDK Vercel V5**
- **Node.js v22**
- **ZOD v4**
- **GoogleProvider**
- **OpenAIProvider**
- **ChromaDB File**
- **BetterSQLite**
- **Drizzle ORM**

## Cómo ejecutar el proyecto

1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Configura las variables de entorno necesarias en un archivo `.env`.

4. Ejecuta el proyecto:
   ```bash
   pnpm start
   ```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios importantes antes de implementarlos.

---

**Autor:** Andeveling

**Fecha:** 23 de noviembre de 2025