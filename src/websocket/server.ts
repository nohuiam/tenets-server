/**
 * Tenets Server WebSocket Server
 * Port 9027 - Real-time events
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';

interface WSMessage {
  type: string;
  data?: unknown;
  id?: string;
}

// SECURITY: Maximum message size (1MB)
const MAX_MESSAGE_SIZE = 1024 * 1024;

/**
 * SECURITY: Sanitize error messages to prevent information disclosure
 */
function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error';

  // Strip sensitive patterns
  const sensitivePatterns = [
    /\/Users\/[^/\s]+/g,           // User paths
    /\/home\/[^/\s]+/g,            // Linux home paths
    /at\s+.+:\d+:\d+/g,            // Stack trace lines
    /SQLITE_\w+/g,                 // SQLite error codes
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

export function createWebSocketServer(
  db: DatabaseManager,
  evaluator: Evaluator,
  port: number
): WebSocketServer {
  const wss = new WebSocketServer({ port });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.error('[tenets-server] WebSocket client connected');

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      data: {
        server: 'tenets-server',
        version: '1.0.0',
        tenets_count: db.getTenetCount(),
      },
    }));

    ws.on('message', (message: Buffer) => {
      // SECURITY: Check message size limit
      if (message.length > MAX_MESSAGE_SIZE) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Message too large' },
        }));
        return;
      }

      try {
        const msg: WSMessage = JSON.parse(message.toString());
        handleMessage(ws, msg);
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' },
        }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.error('[tenets-server] WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('[tenets-server] WebSocket error:', error);
    });
  });

  function handleMessage(ws: WebSocket, msg: WSMessage) {
    switch (msg.type) {
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          data: { timestamp: Date.now() },
          id: msg.id,
        }));
        break;

      case 'evaluate':
        handleEvaluate(ws, msg);
        break;

      case 'subscribe':
        // Client wants to receive real-time events
        ws.send(JSON.stringify({
          type: 'subscribed',
          data: { events: ['evaluation_complete', 'violation_detected', 'counterfeit_matched'] },
          id: msg.id,
        }));
        break;

      case 'get_stats':
        ws.send(JSON.stringify({
          type: 'stats',
          data: db.getStats(),
          id: msg.id,
        }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: `Unknown message type: ${msg.type}` },
          id: msg.id,
        }));
    }
  }

  function handleEvaluate(ws: WebSocket, msg: WSMessage) {
    try {
      const data = msg.data as { decision_text?: string; context?: Record<string, unknown>; stakeholders?: string[]; depth?: 'quick' | 'standard' | 'deep' };

      if (!data?.decision_text) {
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'decision_text is required' },
          id: msg.id,
        }));
        return;
      }

      const evaluation = evaluator.evaluate(data.decision_text, {
        context: data.context,
        stakeholders: data.stakeholders,
        depth: data.depth,
      });

      // Send evaluation complete event
      ws.send(JSON.stringify({
        type: 'evaluation_complete',
        data: {
          evaluation_id: evaluation.id,
          assessment: evaluation.overall_assessment,
          violation_count: evaluation.violations.length,
          counterfeit_count: evaluation.counterfeits_matched.length,
        },
        id: msg.id,
      }));

      // Send individual violation events
      for (const violation of evaluation.violations) {
        ws.send(JSON.stringify({
          type: 'violation_detected',
          data: {
            tenet: violation.tenet_name,
            severity: violation.severity,
            description: violation.description,
          },
        }));
      }

      // Send counterfeit match events
      for (const match of evaluation.counterfeits_matched) {
        ws.send(JSON.stringify({
          type: 'counterfeit_matched',
          data: {
            tenet: match.tenet_name,
            counterfeit_pattern: match.counterfeit_pattern,
            confidence: match.confidence,
          },
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: sanitizeError(error) },
        id: msg.id,
      }));
    }
  }

  // Broadcast function for external use
  (wss as WebSocketServer & { broadcast: (type: string, data: unknown) => void }).broadcast = (type: string, data: unknown) => {
    const message = JSON.stringify({ type, data, timestamp: Date.now() });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  };

  return wss;
}
