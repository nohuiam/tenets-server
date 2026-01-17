/**
 * Tenets Server HTTP REST API
 * Port 8027
 */

import express, { Request, Response, NextFunction } from 'express';
import type { Server } from 'http';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import type { CounterfeitDetector } from '../services/counterfeit-detector.js';
import { getInterLock } from '../interlock/index.js';
import {
  allToolDefinitions,
  createEvaluateDecisionHandler,
  createCheckCounterfeitHandler,
  createIdentifyBlindSpotsHandler,
  createRecordEvaluationHandler,
  createGetEvaluationHistoryHandler,
  createGetTenetHandler,
  createListTenetsHandler,
  createSuggestRemediationHandler,
} from '../tools/index.js';

const SERVER_NAME = 'tenets-server';

// Trace context for distributed tracing (Linus audit recommendation)
interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      trace?: TraceContext;
    }
  }
}

function createTraceContext(parent?: Partial<TraceContext>): TraceContext {
  return {
    traceId: parent?.traceId ?? randomUUID(),
    spanId: randomUUID(),
    parentSpanId: parent?.spanId
  };
}

function parseTraceparent(header: string): { traceId: string; parentSpanId: string } | null {
  const parts = header.split('-');
  if (parts.length < 3) return null;
  return { traceId: parts[1], parentSpanId: parts[2] };
}

function formatTraceparent(trace: TraceContext): string {
  return `00-${trace.traceId}-${trace.spanId}-01`;
}

// SECURITY: API key for HTTP authentication
const API_KEY = process.env.TENETS_API_KEY;

// Input validation schemas
const EvaluateSchema = z.object({
  decision_text: z.string().min(1).max(50000),
  context: z.record(z.unknown()).optional(),
  stakeholders: z.array(z.string().max(200)).max(20).optional(),
  depth: z.enum(['quick', 'standard', 'deep']).optional()
});

const CheckCounterfeitSchema = z.object({
  action_description: z.string().min(1).max(10000),
  claimed_tenet: z.string().max(100).optional()
});

const BlindSpotsSchema = z.object({
  plan_text: z.string().min(1).max(100000),
  scope: z.string().max(1000).optional()
});

const RemediationSchema = z.object({
  violation_description: z.string().min(1).max(10000),
  tenet_violated: z.string().min(1).max(100),
  context: z.string().max(10000).optional()
});

/**
 * SECURITY: Sanitize error messages to prevent information disclosure
 */
function sanitizeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return 'Invalid input: ' + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  // Strip sensitive patterns
  const sensitivePatterns = [
    /\/Users\/[^/\s]+/g,           // User paths
    /\/home\/[^/\s]+/g,            // Linux home paths
    /at\s+.+:\d+:\d+/g,            // Stack trace lines
    /SQLITE_\w+/g,                 // SQLite error codes
    /ENOENT:|EACCES:/g,            // System error codes
  ];

  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }

  return sanitized;
}

export function createHttpServer(
  db: DatabaseManager,
  evaluator: Evaluator,
  counterfeitDetector: CounterfeitDetector,
  port: number
): Server {
  const app = express();

  // Middleware - SECURITY: Limit body size to 1MB
  app.use(express.json({ limit: '1mb' }));

  // CORS - TODO: Consider restricting origins in production
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, traceparent');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Distributed tracing middleware (Linus audit recommendation)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip tracing for health checks
    if (req.path === '/health') {
      next();
      return;
    }

    // Extract or create trace context
    const traceparent = req.headers['traceparent'] as string;
    let trace: TraceContext;

    if (traceparent) {
      const parsed = parseTraceparent(traceparent);
      if (parsed) {
        trace = createTraceContext({ traceId: parsed.traceId, spanId: parsed.parentSpanId });
      } else {
        trace = createTraceContext();
      }
    } else {
      trace = createTraceContext();
    }

    req.trace = trace;

    // Set response headers for trace propagation
    res.setHeader('X-Trace-ID', trace.traceId);
    res.setHeader('X-Span-ID', trace.spanId);
    res.setHeader('traceparent', formatTraceparent(trace));

    next();
  });

  // SECURITY: API key authentication for all /api/* routes
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // Skip auth if no API key is configured (development mode)
    if (!API_KEY) {
      next();
      return;
    }

    const providedKey = req.headers['x-api-key'] as string;
    if (!providedKey || providedKey !== API_KEY) {
      res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
      return;
    }
    next();
  });

  // Track server start time for uptime
  const startTime = Date.now();

  // Health check (standardized cognitive server format)
  app.get('/health', (_req: Request, res: Response) => {
    const interlock = getInterLock();
    const stats = db.getStats();

    res.json({
      status: 'healthy',
      server: 'tenets-server',
      version: '1.0.0',
      uptime_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      stats: {
        totalTenets: stats.totalTenets,
        totalEvaluations: stats.totalEvaluations,
        totalViolations: stats.totalViolations
      },
      interlock: interlock ? {
        active: true,
        peers: interlock.getPeers().length,
        stats: interlock.getStats()
      } : {
        active: false
      }
    });
  });

  // Stats
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = db.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // InterLock stats
  app.get('/api/interlock/stats', (_req: Request, res: Response) => {
    try {
      const interlock = getInterLock();
      if (!interlock) {
        res.status(503).json({ error: 'InterLock not active' });
        return;
      }

      res.json({
        socket: interlock.getStats(),
        tumbler: interlock.getTumblerStats(),
        peers: interlock.getPeers(),
      });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // List all tenets
  app.get('/api/tenets', (_req: Request, res: Response) => {
    try {
      const tenets = db.getAllTenets();
      res.json({ tenets, count: tenets.length });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Get specific tenet by ID
  app.get('/api/tenets/:id', (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const tenet = db.getTenetById(id);
      if (!tenet) {
        res.status(404).json({ error: `Tenet ${id} not found` });
        return;
      }
      res.json(tenet);
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Get tenets by category
  app.get('/api/tenets/category/:category', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate category parameter
      const validCategories = ['foundation', 'action', 'character', 'community', 'restoration'] as const;
      const category = req.params.category as typeof validCategories[number];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }
      const tenets = db.getTenetsByCategory(category);
      res.json({ tenets, count: tenets.length, category });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Evaluate a decision
  app.post('/api/evaluate', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate input with Zod schema
      const validated = EvaluateSchema.parse(req.body);

      const evaluation = evaluator.evaluate(validated.decision_text, {
        context: validated.context,
        stakeholders: validated.stakeholders,
        depth: validated.depth,
      });

      res.json({
        evaluation_id: evaluation.id,
        overall_assessment: evaluation.overall_assessment,
        tenet_scores: evaluation.tenet_scores,
        violations: evaluation.violations,
        counterfeits_matched: evaluation.counterfeits_matched,
        recommendations: evaluation.recommendations,
      });
    } catch (error) {
      const status = error instanceof z.ZodError ? 400 : 500;
      res.status(status).json({ error: sanitizeError(error) });
    }
  });

  // Check for counterfeit patterns
  app.post('/api/check-counterfeit', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate input with Zod schema
      const validated = CheckCounterfeitSchema.parse(req.body);

      const result = counterfeitDetector.check(validated.action_description, validated.claimed_tenet);
      res.json(result);
    } catch (error) {
      const status = error instanceof z.ZodError ? 400 : 500;
      res.status(status).json({ error: sanitizeError(error) });
    }
  });

  // Identify blind spots
  app.post('/api/blind-spots', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate input with Zod schema
      const validated = BlindSpotsSchema.parse(req.body);

      // Simplified blind spot detection for HTTP API
      const tenets = db.getAllTenets();
      const textLower = validated.plan_text.toLowerCase();

      const blindSpots: { area: string; description: string; severity: string }[] = [];

      // Check for missing tenet categories
      const categories = ['foundation', 'action', 'character', 'community', 'restoration'];
      for (const category of categories) {
        const categoryTenets = tenets.filter(t => t.category === category);
        const mentioned = categoryTenets.some(t => textLower.includes(t.name.toLowerCase()));
        if (!mentioned) {
          blindSpots.push({
            area: `${category} tenets`,
            description: `Plan does not address ${category} principles`,
            severity: category === 'foundation' ? 'high' : 'medium',
          });
        }
      }

      res.json({
        blind_spots: blindSpots,
        recommendations: blindSpots.length > 0
          ? [`Address ${blindSpots.length} identified blind spots`]
          : ['Plan appears comprehensive'],
      });
    } catch (error) {
      const status = error instanceof z.ZodError ? 400 : 500;
      res.status(status).json({ error: sanitizeError(error) });
    }
  });

  // List evaluations
  app.get('/api/evaluations', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate query parameters
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 1000);
      const validAssessments = ['affirm', 'caution', 'reject'] as const;
      const assessmentParam = req.query.assessment as string | undefined;
      const assessment = assessmentParam && validAssessments.includes(assessmentParam as typeof validAssessments[number])
        ? assessmentParam as typeof validAssessments[number]
        : undefined;

      const evaluations = db.getEvaluations({ assessment, limit });
      res.json({ evaluations, count: evaluations.length });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Get specific evaluation
  app.get('/api/evaluations/:id', (req: Request, res: Response) => {
    try {
      // SECURITY: Basic ID validation
      const id = req.params.id;
      if (!id || id.length > 100) {
        res.status(400).json({ error: 'Invalid evaluation ID' });
        return;
      }

      const evaluation = db.getEvaluationById(id);
      if (!evaluation) {
        res.status(404).json({ error: 'Evaluation not found' });
        return;
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // List violations
  app.get('/api/violations', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate and limit query parameters
      const tenetId = req.query.tenet_id ? parseInt(req.query.tenet_id as string, 10) : undefined;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 100, 1000);

      if (tenetId !== undefined && (isNaN(tenetId) || tenetId < 0)) {
        res.status(400).json({ error: 'Invalid tenet_id' });
        return;
      }

      let violations;
      if (tenetId) {
        violations = db.getViolationsByTenet(tenetId, limit);
      } else {
        // Get all violations by fetching from all tenets
        const tenets = db.getAllTenets();
        violations = tenets.flatMap(t => db.getViolationsByTenet(t.id, limit));
      }

      res.json({ violations, count: violations.length });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Suggest remediation
  app.post('/api/remediation', (req: Request, res: Response) => {
    try {
      // SECURITY: Validate input with Zod schema
      const validated = RemediationSchema.parse(req.body);

      const tenet = db.getTenetByName(validated.tenet_violated);
      if (!tenet) {
        res.status(404).json({ error: 'Tenet not found' });
        return;
      }

      const remediationSteps = [
        `Apply the primary test: "${tenet.decision_criteria[0]}"`,
        `Review against counterfeit patterns for ${tenet.name}`,
        `Consider the transformation pattern: ${tenet.transformation_pattern}`,
      ];

      res.json({
        remediation_steps: remediationSteps,
        scripture_guidance: tenet.scripture_anchors[0] || 'Study the tenet deeply',
        transformation_path: tenet.transformation_pattern,
        related_tenets: [],
      });
    } catch (error) {
      const status = error instanceof z.ZodError ? 400 : 500;
      res.status(status).json({ error: sanitizeError(error) });
    }
  });

  // ===== GATEWAY INTEGRATION ENDPOINTS =====

  // List all MCP tools (for gateway_tools)
  app.get('/api/tools', (_req: Request, res: Response) => {
    try {
      const tools = allToolDefinitions.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }));
      res.json({ tools, count: tools.length });
    } catch (error) {
      res.status(500).json({ error: sanitizeError(error) });
    }
  });

  // Execute MCP tool via HTTP (for gateway_mcp)
  app.post('/api/tools/:toolName', async (req: Request, res: Response) => {
    try {
      const { toolName } = req.params;
      const args = req.body.arguments || req.body;

      // Create handlers - cast to any to avoid strict type mismatches between MCP and HTTP argument types
      const handlers: Record<string, (args: any) => Promise<unknown>> = {
        'evaluate_decision': createEvaluateDecisionHandler(evaluator),
        'check_counterfeit': createCheckCounterfeitHandler(counterfeitDetector),
        'identify_blind_spots': createIdentifyBlindSpotsHandler(db),
        'record_evaluation': createRecordEvaluationHandler(db),
        'get_evaluation_history': createGetEvaluationHistoryHandler(db),
        'get_tenet': createGetTenetHandler(db),
        'list_tenets': createListTenetsHandler(db),
        'suggest_remediation': createSuggestRemediationHandler(db),
      };

      const handler = handlers[toolName];
      if (!handler) {
        res.status(404).json({
          success: false,
          error: `Tool '${toolName}' not found. Available: ${Object.keys(handlers).join(', ')}`
        });
        return;
      }

      const result = await handler(args);
      res.json({ success: true, result });
    } catch (error) {
      res.status(400).json({ success: false, error: sanitizeError(error) });
    }
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Start server
  return app.listen(port, () => {
    console.error(`[tenets-server] HTTP API available at http://localhost:${port}`);
  });
}
