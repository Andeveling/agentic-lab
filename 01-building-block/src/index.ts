import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import "dotenv/config";
import { saveMarkdown } from './utils/save-markdown.js';
import { searchProductsTool } from './tools/index.js';


// Skus a bucar:
// 22236,"Brasier","Habano","40",77990,205
// 009241,"Panty clásico de control","Habano","L",39990,207
// 22285,"Bóxer","Blanco","S",25990,207

// Ejemplo de uso del LLM aumentado con herramientas
const { text, toolCalls, toolResults } = await generateText({
    model: google('gemini-2.5-flash'),
    tools: {
        searchProducts: searchProductsTool,
    },
    prompt: 'Quiero hacer un pedido de los skus 22236, 009241 y 22285. ¿Puedes darme información de estos productos?',
});

console.log('=== Respuesta del LLM ===');
console.log(text);

if (toolCalls && toolCalls.length > 0) {
    console.log('\n=== Herramientas usadas ===');
    console.log(JSON.stringify(toolCalls, null, 2));

    console.log('\n=== Resultados de herramientas ===');
    console.log(JSON.stringify(toolResults, null, 2));
}

await saveMarkdown(text);   