import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import "dotenv/config";
import { saveMarkdown } from './utils/save-markdown';

// 35691,"Chaqueta manga larga","Negro","ÚNICO",139990,90
// 34058,"Jean bota recta","Negro","ÚNICO",139990,91
// 11270,"Short corto","Café","ÚNICO",94990,97
const searchSkus = [ "35691", "34058", "11270" ]

const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Quiero hacer un pedido de los skus 019976, 019977 y 019978.',
});

await saveMarkdown(text);   