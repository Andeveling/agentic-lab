import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de logs
const logsDir = path.resolve(__dirname, '../../logs');

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Formato JSON para archivos
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuración del logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console con colores
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    // Archivo de logs general
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Logger específico para sesiones de LLM
 * Registra todo el flujo de interacción con el modelo
 */
export const llmLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'llm-sessions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

/**
 * Logger para herramientas (tools)
 * Registra las ejecuciones de herramientas
 */
export const toolLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'tools.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Tipos de helpers para logging estructurado
export interface LLMSessionLog {
  sessionId: string;
  prompt: string;
  model: string;
  timestamp: Date;
}

export interface ToolExecutionLog {
  sessionId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  executionTime: number;
  timestamp: Date;
}

export interface LLMResponseLog {
  sessionId: string;
  text: string;
  toolCalls?: number;
  timestamp: Date;
}

/**
 * Helper para loggear sesión completa de LLM
 */
export function logLLMSession(data: {
  sessionId: string;
  prompt: string;
  model: string;
  toolCalls?: unknown[];
  toolResults?: unknown[];
  response: string;
  duration: number;
}) {
  llmLogger.info('LLM Session', {
    sessionId: data.sessionId,
    prompt: data.prompt,
    model: data.model,
    toolCalls: data.toolCalls,
    toolResults: data.toolResults,
    response: data.response,
    duration: data.duration,
    timestamp: new Date(),
  });
}

/**
 * Helper para loggear ejecución de herramienta
 */
export function logToolExecution(data: ToolExecutionLog) {
  toolLogger.info('Tool Execution', data);
}

/**
 * Helper para loggear respuesta del LLM
 */
export function logLLMResponse(data: LLMResponseLog) {
  llmLogger.info('LLM Response', data);
}
