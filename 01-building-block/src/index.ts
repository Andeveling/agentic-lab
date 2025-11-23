import { google } from '@ai-sdk/google';
import { generateText, stepCountIs } from 'ai';
import "dotenv/config";
import { saveMarkdown } from './utils/save-markdown.js';
import { searchProductsTool } from './tools/index.js';
import { logger, logLLMSession } from './utils/logger.js';
import { randomUUID } from 'crypto';


// Skus a buscar:
// 22236,"Brasier","Habano","40",77990,205
// 009241,"Panty clásico de control","Habano","L",39990,207
// 22285,"Bóxer","Blanco","S",25990,207

// Generar ID único para la sesión
const sessionId = randomUUID();
const startTime = Date.now();

// Ejemplo de uso del LLM aumentado con herramientas
const userPrompt = 'Quiero hacer un pedido de los skus 22236, 009241 y 22285. ¿Puedes darme información de estos productos?';
const modelName = 'gemini-2.5-flash';


const stepsData: Array<{ stepNumber: number; text?: string; toolCalls?: any[]; toolResults?: any[]; finishReason?: string; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; reasoningTokens?: number } }> = [];
// Ejecutar generación multi-step
const result = await generateText({
    model: google(modelName),
    system: 'Eres un asistente de ventas. Cuando el usuario te pida información de productos, usa la herramienta searchProducts para recuperar datos y luego genera un resumen útil en español con tabla de productos (SKU, nombre, color, talla, precio, página). Si algún SKU no existe, indícalo claramente.',
    tools: {
        searchProducts: searchProductsTool,
    },
    stopWhen: stepCountIs(5), // permitir hasta 5 pasos (tool calls + respuesta final)
    prompt: userPrompt,
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        stepsData.push({
            stepNumber: stepsData.length + 1,
            text,
            toolCalls,
            toolResults,
            finishReason,
            usage,
        });
    },
});

// Extraer valores finales
const { text, toolCalls, toolResults } = result;
const steps = await result.steps; // detalle de pasos original del SDK
const usage = await result.usage; // uso del último paso
const totalUsage = await result.totalUsage; // uso acumulado
const duration = Date.now() - startTime;
// Guardar todo el proceso en markdown
await saveMarkdown({
    text,
    toolCalls,
    toolResults,
    prompt: userPrompt,
    steps: stepsData,
    usage,
    totalUsage,
});