import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface SaveMarkdownOptions {
  text: string;
  toolCalls?: any[]; // expects objects with at least toolName, input
  toolResults?: any[]; // expects objects with at least toolName, output
  prompt?: string;
  steps?: Array<{ stepNumber: number; text?: string; toolCalls?: any[]; toolResults?: any[]; finishReason?: string; usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; reasoningTokens?: number } }>; // optional detailed steps
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; reasoningTokens?: number };
  totalUsage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; reasoningTokens?: number };
}

// Utilidad para guardar el texto en un archivo Markdown con nombre único
export async function saveMarkdown(options: SaveMarkdownOptions | string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputDir = path.resolve(__dirname, '../output');
  await fs.mkdir(outputDir, { recursive: true });
  const fileName = `doc-${Date.now()}.md`;
  const filePath = path.join(outputDir, fileName);

  // Soporte para uso simple con solo string
  if (typeof options === 'string') {
    const content = `# Respuesta\n\n${options}\n`;
    await fs.writeFile(filePath, content);
    console.log(`Archivo guardado en: ${filePath}`);
    return;
  }

  // Construir contenido completo
  let content = '# Sesión de LLM Aumentado\n\n';

  if (options.prompt) {
    content += `## Prompt Original\n\n${options.prompt}\n\n`;
  }

  // Usage global (último paso)
  if (options.usage) {
    content += '## Uso (Último Paso)\n\n';
    content += '```json\n' + JSON.stringify(options.usage, null, 2) + '\n```\n\n';
  }

  // Uso total acumulado (multi-step)
  if (options.totalUsage) {
    content += '## Uso Total Acumulado\n\n';
    content += '```json\n' + JSON.stringify(options.totalUsage, null, 2) + '\n```\n\n';
  }

  if (options.toolCalls && options.toolCalls.length > 0) {
    content += `## Herramientas Invocadas (Último Paso)\n\n`;
    options.toolCalls.forEach((call, index) => {
      const input = (call && 'input' in call) ? call.input : undefined;
      content += `### ${index + 1}. ${call.toolName}\n\n`;
      content += `**Input:**\n\n\`\`\`json\n${JSON.stringify(input, null, 2)}\n\`\`\`\n\n`;
    });
  }

  if (options.toolResults && options.toolResults.length > 0) {
    content += `## Resultados de Herramientas (Último Paso)\n\n`;
    options.toolResults.forEach((result, index) => {
      const output = (result && 'output' in result) ? result.output : undefined;
      content += `### ${index + 1}. ${result.toolName}\n\n`;
      content += `\`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\`\n\n`;
    });
  }

  if (options.steps && options.steps.length > 0) {
    content += `## Pasos Detallados\n\n`;
    for (const step of options.steps) {
      content += `### Paso ${step.stepNumber}\n\n`;
      if (step.text) {
        content += `**Texto generado:**\n\n${step.text}\n\n`;
      }
      if (step.toolCalls && step.toolCalls.length > 0) {
        content += `**Tool Calls:**\n\n\`\`\`json\n${JSON.stringify(step.toolCalls.map(c => ({ toolName: c.toolName, input: c.input })), null, 2)}\n\`\`\`\n\n`;
      }
      if (step.toolResults && step.toolResults.length > 0) {
        content += `**Tool Results:**\n\n\`\`\`json\n${JSON.stringify(step.toolResults.map(r => ({ toolName: r.toolName, output: r.output })), null, 2)}\n\`\`\`\n\n`;
      }
      if (step.finishReason) {
        content += `**Finish Reason:** ${step.finishReason}\n\n`;
      }
      if (step.usage) {
        content += `**Uso de Tokens:**\n\n\`\`\`json\n${JSON.stringify(step.usage, null, 2)}\n\`\`\`\n\n`;
      }
    }
  }

  content += `## Respuesta Final\n\n${options.text}\n`;

  await fs.writeFile(filePath, content);
  console.log(`Archivo guardado en: ${filePath}`);
}