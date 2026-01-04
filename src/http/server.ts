/**
 * Tenets Server HTTP REST API
 * Port 8027
 */

import express, { Request, Response, NextFunction } from 'express';
import type { Server } from 'http';
import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import type { CounterfeitDetector } from '../services/counterfeit-detector.js';

export function createHttpServer(
  db: DatabaseManager,
  evaluator: Evaluator,
  counterfeitDetector: CounterfeitDetector,
  port: number
): Server {
  const app = express();

  // Middleware
  app.use(express.json());

  // CORS
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      server: 'tenets-server',
      version: '1.0.0',
      timestamp: Date.now(),
    });
  });

  // Stats
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = db.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // List all tenets
  app.get('/api/tenets', (_req: Request, res: Response) => {
    try {
      const tenets = db.getAllTenets();
      res.json({ tenets, count: tenets.length });
    } catch (error) {
      res.status(500).json({ error: String(error) });
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
      res.status(500).json({ error: String(error) });
    }
  });

  // Get tenets by category
  app.get('/api/tenets/category/:category', (req: Request, res: Response) => {
    try {
      const category = req.params.category as 'foundation' | 'action' | 'character' | 'community' | 'restoration';
      const tenets = db.getTenetsByCategory(category);
      res.json({ tenets, count: tenets.length, category });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Evaluate a decision
  app.post('/api/evaluate', (req: Request, res: Response) => {
    try {
      const { decision_text, context, stakeholders, depth } = req.body;
      if (!decision_text) {
        res.status(400).json({ error: 'decision_text is required' });
        return;
      }

      const evaluation = evaluator.evaluate(decision_text, {
        context,
        stakeholders,
        depth,
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
      res.status(500).json({ error: String(error) });
    }
  });

  // Check for counterfeit patterns
  app.post('/api/check-counterfeit', (req: Request, res: Response) => {
    try {
      const { action_description, claimed_tenet } = req.body;
      if (!action_description) {
        res.status(400).json({ error: 'action_description is required' });
        return;
      }

      const result = counterfeitDetector.check(action_description, claimed_tenet);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Identify blind spots
  app.post('/api/blind-spots', (req: Request, res: Response) => {
    try {
      const { plan_text, scope } = req.body;
      if (!plan_text) {
        res.status(400).json({ error: 'plan_text is required' });
        return;
      }

      // Simplified blind spot detection for HTTP API
      const tenets = db.getAllTenets();
      const textLower = plan_text.toLowerCase();

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
      res.status(500).json({ error: String(error) });
    }
  });

  // List evaluations
  app.get('/api/evaluations', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const assessment = req.query.assessment as 'affirm' | 'caution' | 'reject' | undefined;

      const evaluations = db.getEvaluations({ assessment, limit });
      res.json({ evaluations, count: evaluations.length });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Get specific evaluation
  app.get('/api/evaluations/:id', (req: Request, res: Response) => {
    try {
      const evaluation = db.getEvaluationById(req.params.id);
      if (!evaluation) {
        res.status(404).json({ error: `Evaluation ${req.params.id} not found` });
        return;
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // List violations
  app.get('/api/violations', (req: Request, res: Response) => {
    try {
      const tenetId = req.query.tenet_id ? parseInt(req.query.tenet_id as string, 10) : undefined;
      const limit = parseInt(req.query.limit as string, 10) || 100;

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
      res.status(500).json({ error: String(error) });
    }
  });

  // Suggest remediation
  app.post('/api/remediation', (req: Request, res: Response) => {
    try {
      const { violation_description, tenet_violated, context } = req.body;
      if (!violation_description || !tenet_violated) {
        res.status(400).json({ error: 'violation_description and tenet_violated are required' });
        return;
      }

      const tenet = db.getTenetByName(tenet_violated);
      if (!tenet) {
        res.status(404).json({ error: `Tenet ${tenet_violated} not found` });
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
      res.status(500).json({ error: String(error) });
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
