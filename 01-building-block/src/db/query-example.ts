import { db } from './db.js';
import { catalogs, products } from './schema.js';
import { eq } from 'drizzle-orm';

/**
 * Script simple para consultar la base de datos
 * Uso: pnpm tsx src/db/query-example.ts
 */

async function queryExamples() {
  console.log('🔍 Consultando base de datos...\n');

  // 1. Contar productos
  const allProducts = await db.select().from(products);
  console.log(`📦 Total de productos: ${allProducts.length}`);

  // 2. Ver catálogos
  const allCatalogs = await db.select().from(catalogs);
  console.log(`📁 Catálogos:`);
  allCatalogs.forEach((cat) => {
    console.log(`   - ${cat.catalog} / ${cat.campaign} (ID: ${cat.id})`);
  });

  // 3. Buscar producto por SKU (normalizado a 6 dígitos)
  const sku = '019976'; // SKU normalizado
  const [ product ] = await db.select().from(products).where(eq(products.sku, sku));

  console.log(`\n🔎 Producto con SKU ${sku}:`);
  if (product) {
    console.log(`   - Nombre: ${product.productName}`);
    console.log(`   - Color: ${product.colorVariant}`);
    console.log(`   - Talla: ${product.sizeVariant}`);
    console.log(`   - Precio: $${product.unitPrice.toLocaleString()}`);
    console.log(`   - Página: ${product.page}`);
  } else {
    console.log('   No encontrado');
  }

  // 4. Primeros 5 productos
  console.log(`\n📋 Primeros 5 productos:`);
  const firstFive = await db.select().from(products).limit(5);
  firstFive.forEach((p) => {
    console.log(`   ${p.sku} - ${p.productName} (${p.colorVariant}, ${p.sizeVariant})`);
  });

  console.log('\n✅ Consulta completada!');
}

queryExamples();
