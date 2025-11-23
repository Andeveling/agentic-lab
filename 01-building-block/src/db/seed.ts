import { db } from './db.js';
import { catalogs, products } from './schema.js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

/**
 * Script simple para cargar productos desde CSV a la base de datos
 * Uso: pnpm tsx src/db/seed.ts
 */

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  try {
    // 1. Crear catálogo
    console.log('📁 Creando catálogo...');
    const [ catalog ] = await db
      .insert(catalogs)
      .values({
        catalog: 'leonisa',
        campaign: '172025',
        description: 'Catálogo Leonisa Campaña 17 2025',
      })
      .returning()
      .onConflictDoNothing();

    const catalogId = catalog?.id || 1;
    console.log(`✓ Catálogo creado con ID: ${catalogId}\n`);

    // 2. Leer CSV
    console.log('📄 Leyendo CSV...');
    const csvPath = './context/leonisa_c17_skus_v1.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    console.log(`✓ ${rows.length} productos encontrados\n`);

    // 3. Insertar productos
    console.log('💾 Insertando productos...');
    let inserted = 0;
    let skipped = 0;

    for (const row of rows as any[]) {
      try {
        // Normalizar SKU a 6 dígitos
        const sku = String(row.sku).padStart(6, '0');

        await db
          .insert(products)
          .values({
            sku,
            catalogId,
            productName: row.product_name,
            colorVariant: row.color_variant,
            sizeVariant: row.size_variant,
            unitPrice: Number(row.unit_price),
            page: row.page ? Number(row.page) : undefined,
          })
          .onConflictDoNothing();

        inserted++;
        if (inserted % 50 === 0) {
          console.log(`  ${inserted} productos insertados...`);
        }
      } catch (error) {
        skipped++;
        console.error(`  ⚠️  Error en SKU ${row.sku}:`, error);
      }
    }

    console.log(`\n✅ Seed completado!`);
    console.log(`   - Insertados: ${inserted}`);
    console.log(`   - Omitidos: ${skipped}`);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
