/**
 * record_evaluation Tool
 * Store an evaluation for learning and pattern detection
 */

import { z } from 'zod';
import type { DatabaseManager } from '../database/schema.js';
import type { RecordEvaluationOutput, Pattern } from '../types.js';

export const recordEvaluationSchema = z.object({
  decision_id: z.string().describe('Unique identifier for this decision'),
  assessment: z.enum(['affirm', 'caution', 'reject']).describe('The assessment result'),
  violations: z.array(z.string()).optional().describe('List of violation descriptions'),
  notes: z.string().optional().describe('Additional notes about the evaluation'),
});

export type RecordEvaluationInput = z.infer<typeof recordEvaluationSchema>;

export function createRecordEvaluationHandler(db: DatabaseManager) {
  return async (input: RecordEvaluationInput): Promise<RecordEvaluationOutput> => {
    // Create the evaluation record
    const evaluation = db.insertEvaluation({
      decision_text: input.decision_id,
      overall_assessment: input.assessment,
      tenet_scores: {},
      violations: input.violations?.map(v => ({
        id: '',
        evaluation_id: '',
        tenet_id: 0,
        severity: 'medium' as const,
        description: v,
        created_at: Date.now(),
      })) || [],
      counterfeits_matched: [],
      recommendations: input.notes ? [input.notes] : [],
      depth: 'standard',
    });

    // Check for patterns
    const patternsTriggered: string[] = [];
    const existingPatterns = db.getAllPatterns();

    // Look for violation patterns
    if (input.violations && input.violations.length > 0) {
      for (const violation of input.violations) {
        // Check if this matches an existing pattern
        const existingPattern = existingPatterns.find(p =>
          violation.toLowerCase().includes(p.description.toLowerCase()) ||
          p.description.toLowerCase().includes(violation.toLowerCase())
        );

        if (existingPattern) {
          db.updatePatternFrequency(existingPattern.id);
          patternsTriggered.push(existingPattern.description);
        } else {
          // Create new pattern if violation appears significant
          const newPattern = db.insertPattern({
            pattern_type: 'violation',
            description: violation,
            related_tenets: [],
            frequency: 1,
            last_seen: Date.now(),
            confidence: 0.5,
          });
          patternsTriggered.push(`New pattern detected: ${violation}`);
        }
      }
    }

    // Track assessment patterns
    const assessmentPatternDesc = `${input.assessment} assessment`;
    const assessmentPattern = existingPatterns.find(p =>
      p.description === assessmentPatternDesc && p.pattern_type === 'success'
    );

    if (assessmentPattern) {
      db.updatePatternFrequency(assessmentPattern.id);
    } else if (input.assessment === 'affirm') {
      db.insertPattern({
        pattern_type: 'success',
        description: assessmentPatternDesc,
        related_tenets: [],
        frequency: 1,
        last_seen: Date.now(),
        confidence: 0.5,
      });
    }

    return {
      recorded: true,
      evaluation_id: evaluation.id,
      patterns_triggered: patternsTriggered,
    };
  };
}

export const recordEvaluationToolDefinition = {
  name: 'record_evaluation',
  description: 'Record an evaluation result for learning and pattern detection. This helps the system identify recurring ethical patterns, both positive and problematic, to improve future guidance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      decision_id: {
        type: 'string',
        description: 'Unique identifier for this decision',
      },
      assessment: {
        type: 'string',
        enum: ['affirm', 'caution', 'reject'],
        description: 'The assessment result',
      },
      violations: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of violation descriptions',
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the evaluation',
      },
    },
    required: ['decision_id', 'assessment'],
  },
};
