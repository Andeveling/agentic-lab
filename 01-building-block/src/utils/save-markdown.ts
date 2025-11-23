import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utilidad para guardar el texto en un archivo Markdown con nombre único
export async function saveMarkdown(text: string) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputDir = path.resolve(__dirname, '../output');
  await fs.mkdir(outputDir, { recursive: true });
  const fileName = `doc-${Date.now()}.md`;
  const filePath = path.join(outputDir, fileName);
  await fs.writeFile(filePath, `# Respuesta\n\n${text}\n`);
  console.log(`Archivo guardado en: ${filePath}`);
}