import { tool } from 'ai';
import { z } from 'zod';
import { getProductBySKU } from '../db/queries.js';

/**
 * Herramienta para buscar productos por SKU en la base de datos
 * Esta herramienta permite al LLM acceder a información de productos cuando el usuario menciona SKUs
 */
export const searchProductsTool = tool({
  description: 'Busca productos en el catálogo por sus códigos SKU. Usa esta herramienta cuando el usuario mencione códigos de producto o SKUs.',
  inputSchema: z.object({
    skus: z.array(z.string()).describe('Array de códigos SKU a buscar. Los SKUs pueden tener entre 5 y 6 dígitos.'),
  }),
  execute: async ({ skus }) => {
    const results = await Promise.all(
      skus.map(async (sku) => {
        const products = await getProductBySKU(sku);
        return {
          sku,
          found: products.length > 0,
          product: products[ 0 ] || null,
        };
      })
    );

    // Formatear los resultados para que sean fáciles de entender por el LLM
    const foundProducts = results.filter(r => r.found);
    const notFoundSkus = results.filter(r => !r.found).map(r => r.sku);

    return {
      total: skus.length,
      found: foundProducts.length,
      notFound: notFoundSkus.length,
      products: foundProducts.map(r => ({
        sku: r.product!.sku,
        name: r.product!.productName,
        color: r.product!.colorVariant,
        size: r.product!.sizeVariant,
        price: r.product!.unitPrice,
        page: r.product!.page,
      })),
      notFoundSkus,
    };
  },
});
