/**
 * Tenets Server WebSocket Server
 * Port 9027 - Real-time events
 */
import { WebSocketServer, WebSocket } from 'ws';
export function createWebSocketServer(db, evaluator, port) {
    const wss = new WebSocketServer({ port });
    const clients = new Set();
    wss.on('connection', (ws) => {
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
        ws.on('message', (message) => {
            try {
                const msg = JSON.parse(message.toString());
                handleMessage(ws, msg);
            }
            catch (error) {
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
    function handleMessage(ws, msg) {
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
    function handleEvaluate(ws, msg) {
        try {
            const data = msg.data;
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
        }
        catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                data: { message: String(error) },
                id: msg.id,
            }));
        }
    }
    // Broadcast function for external use
    wss.broadcast = (type, data) => {
        const message = JSON.stringify({ type, data, timestamp: Date.now() });
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    };
    return wss;
}
