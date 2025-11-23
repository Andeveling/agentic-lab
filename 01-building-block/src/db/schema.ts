import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ============================================================================
// SCHEMAS DE VALIDACIÓN CON ZOD
// ============================================================================

// Esquema para validar SKU (debe ser numérico y tener máximo 6 dígitos)
export const skuSchema = z
  .union([ z.string(), z.number() ])
  .transform((val) => {
    const numStr = String(val).trim();
    // Validar que sea numérico
    if (!/^\d+$/.test(numStr)) {
      throw new Error('SKU debe contener solo dígitos');
    }
    // Validar que no exceda 6 dígitos
    if (numStr.length > 6) {
      throw new Error('SKU no puede tener más de 6 dígitos');
    }
    // Rellenar con ceros a la izquierda para obtener 6 dígitos
    return numStr.padStart(6, '0');
  });

// ============================================================================
// TABLAS DRIZZLE
// ============================================================================

// Tabla de catálogos
export const catalogs = sqliteTable('catalogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  catalog: text('catalog').notNull(), // ej: 'leonisa'
  campaign: text('campaign').notNull(), // ej: '172025'
  description: text('description'), // descripción opcional
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => [
  unique().on(table.catalog, table.campaign),
]);

// Tabla de productos
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sku: text('sku').notNull().unique(), // SKU de 6 dígitos (normalizado)
  catalogId: integer('catalog_id').notNull().references(() => catalogs.id),
  productName: text('product_name').notNull(),
  colorVariant: text('color_variant').notNull(),
  sizeVariant: text('size_variant').notNull(),
  unitPrice: real('unit_price').notNull(), // precio en centavos o unidades
  page: integer('page'), // número de página del catálogo
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================================================
// ESQUEMAS INSERTADOS Y SELECCIONADOS CON DRIZZLE-ZOD
// ============================================================================

export const insertCatalogSchema = createInsertSchema(catalogs, {
  campaign: z.string().min(1, 'Campaign es requerido'),
  catalog: z.string().min(1, 'Catalog es requerido'),
});

export const selectCatalogSchema = createSelectSchema(catalogs);

export const insertProductSchema = createInsertSchema(products, {
  sku: skuSchema,
  catalogId: z.number().int().positive(),
  productName: z.string().min(1, 'Nombre del producto es requerido'),
  colorVariant: z.string().min(1, 'Variante de color es requerida'),
  sizeVariant: z.string().min(1, 'Variante de tamaño es requerida'),
  unitPrice: z.number().positive('El precio debe ser positivo'),
});

export const selectProductSchema = createSelectSchema(products);

// ============================================================================
// TIPOS TYPESCRIPT DERIVADOS DE ZOD
// ============================================================================

export type Catalog = z.infer<typeof selectCatalogSchema>;
export type InsertCatalog = z.infer<typeof insertCatalogSchema>;

export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// ============================================================================
// ESQUEMA PARA PROCESAMIENTO DE CSV
// ============================================================================

export const csvProductRowSchema = z.object({
  sku: skuSchema,
  product_name: z.string().min(1),
  color_variant: z.string().min(1),
  size_variant: z.string().min(1),
  unit_price: z.union([ z.string(), z.number() ]).transform((val) => Number(val)),
  page: z.union([ z.string(), z.number() ]).transform((val) => Number(val)).optional(),
});

export type CSVProductRow = z.infer<typeof csvProductRowSchema>;
