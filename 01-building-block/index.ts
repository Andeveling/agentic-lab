import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import "dotenv/config";

const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Explain the concept of the Hilbert space in Spanish.',
});

console.log(text);