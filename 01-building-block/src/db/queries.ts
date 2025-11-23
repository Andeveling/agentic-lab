import { db } from './db.js';
import { catalogs, products, insertProductSchema, csvProductRowSchema, type InsertCatalog, type InsertProduct } from './schema.js';
import { eq, and } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

/**
 * Procesa un archivo CSV de productos y los guarda en la base de datos
 * @param csvFilePath Ruta al archivo CSV
 * @param catalog Nombre del catálogo (ej: 'leonisa')
 * @param campaign Código de campaña (ej: '172025')
 */
export async function importProductsFromCSV(
  csvFilePath: string,
  catalog: string,
  campaign: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  try {
    // 1. Obtener o crear el catálogo
    let catalogId: number;
    const existingCatalog = await db
      .select()
      .from(catalogs)
      .where(and(eq(catalogs.catalog, catalog), eq(catalogs.campaign, campaign)));

    if (existingCatalog.length > 0) {
      catalogId = existingCatalog[ 0 ].id;
    } else {
      const newCatalog: InsertCatalog = { catalog, campaign };
      const result = await db.insert(catalogs).values(newCatalog).returning();
      catalogId = result[ 0 ].id;
    }

    // 2. Leer y parsear el CSV
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // 3. Procesar cada fila
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[ rowIndex ];
      try {
        // Validar y transformar datos del CSV
        const validatedRow = csvProductRowSchema.parse(row);

        // Crear objeto de producto
        const productData: InsertProduct = {
          sku: validatedRow.sku,
          catalogId,
          productName: validatedRow.product_name,
          colorVariant: validatedRow.color_variant,
          sizeVariant: validatedRow.size_variant,
          unitPrice: validatedRow.unit_price,
          page: validatedRow.page,
        };

        // Validar esquema de inserción
        const validProduct = insertProductSchema.parse(productData);

        // Insertar o actualizar producto
        await db
          .insert(products)
          .values(validProduct)
          .onConflictDoUpdate({
            target: products.sku,
            set: {
              productName: validProduct.productName,
              colorVariant: validProduct.colorVariant,
              sizeVariant: validProduct.sizeVariant,
              unitPrice: validProduct.unitPrice,
              page: validProduct.page,
              updatedAt: new Date(),
            },
          });

        success++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Fila ${rowIndex + 2}: ${errorMessage}`);
      }
    }

    return { success, failed, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error procesando CSV: ${errorMessage}`);
  }
}

/**
 * Obtiene todos los productos de un catálogo específico
 */
export async function getProductsByCatalog(catalog: string, campaign: string) {
  const catalogRecord = await db
    .select()
    .from(catalogs)
    .where(and(eq(catalogs.catalog, catalog), eq(catalogs.campaign, campaign)));

  if (catalogRecord.length === 0) {
    return [];
  }

  return db
    .select()
    .from(products)
    .where(eq(products.catalogId, catalogRecord[ 0 ].id));
}

/**
 * Obtiene un producto por SKU
 */
export async function getProductBySKU(sku: string) {
  const normalizedSku = String(sku).padStart(6, '0');
  return db.select().from(products).where(eq(products.sku, normalizedSku));
}
