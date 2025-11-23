import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import "dotenv/config";
import { saveMarkdown } from './utils/save-markdown';


const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Quiro hacer un pedido de los skus 019976, 019977 y 019978.',
});

await saveMarkdown(text);