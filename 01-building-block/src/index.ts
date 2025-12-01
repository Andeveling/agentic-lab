import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import cors from "cors";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import { searchProductsTool } from "./tools/index.js";

const app = express();
const PORT = 3032;

// Middleware
app.use(express.json());
app.use(cors());

// Ruta raíz
app.get("/", (_req: Request, res: Response) => {
    res.send("Chatbot API - Puerto 3032");
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "API is running" });
});

// Endpoint POST /chat para el chatbot con AI SDK
app.post("/api/chat", async (req: Request, res: Response) => {
    try {
        const { messages } = req.body as { messages: UIMessage[] };

        console.log("Received body:", JSON.stringify(req.body, null, 2));

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                ok: false,
                error: "El campo 'messages' es requerido y debe ser un array no vacío",
                example: {
                    messages: [
                        {
                            id: "msg-1",
                            role: "user",
                            parts: [ { type: "text", text: "Hola, busca el SKU 12345" } ],
                        },
                    ],
                },
            });
        }

        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: `Eres un asistente de ventas amigable y profesional para Leonisa. 
Ayudas a los clientes a buscar productos en el catálogo usando códigos SKU.
Cuando el usuario mencione códigos de producto o SKUs, usa la herramienta de búsqueda.
Responde siempre en español y de forma clara y concisa.`,
            messages: convertToModelMessages(messages),
            tools: {
                searchProducts: searchProductsTool,
            },
        });

        // Stream UI messages to response
        result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
        console.error("Error en /api/chat:", error);
        res.status(500).json({
            ok: false,
            error: "Error al procesar la solicitud",
        });
    }
});

// Manejo de rutas no encontradas
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found", ok: false });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    console.log(`📝 Endpoint POST: http://localhost:${PORT}/api/chat`);
    console.log(`✅ Health check GET: http://localhost:${PORT}/api/health`);
});
