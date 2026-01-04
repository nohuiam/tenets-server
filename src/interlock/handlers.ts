/**
 * InterLock Signal Handlers
 */

import type { DatabaseManager } from '../database/schema.js';
import type { Evaluator } from '../services/evaluator.js';
import type { Signal } from './protocol.js';
import { createSignal } from './protocol.js';
import { SignalTypes } from '../types.js';

export interface HandlerContext {
  db: DatabaseManager;
  evaluator: Evaluator;
  emit: (signal: Signal) => void;
}

/**
 * Handle incoming signals
 */
export function handleSignal(signal: Signal, context: HandlerContext): void {
  switch (signal.code) {
    case SignalTypes.DECISION_PENDING:
      handleDecisionPending(signal, context);
      break;

    case SignalTypes.OPERATION_COMPLETE:
      handleOperationComplete(signal, context);
      break;

    case SignalTypes.LESSON_LEARNED:
      handleLessonLearned(signal, context);
      break;

    case SignalTypes.HEARTBEAT:
      handleHeartbeat(signal, context);
      break;

    default:
      console.error(`[tenets-server] Unknown signal code: ${signal.code}`);
  }
}

/**
 * Handle DECISION_PENDING (0xD0) from consciousness
 * Evaluate the pending decision
 */
function handleDecisionPending(signal: Signal, context: HandlerContext): void {
  const data = signal.data;
  if (!data?.decision_text) {
    console.error('[tenets-server] DECISION_PENDING missing decision_text');
    return;
  }

  const decisionText = data.decision_text as string;
  const evaluation = context.evaluator.evaluate(decisionText, {
    context: data.context as Record<string, unknown>,
    stakeholders: data.stakeholders as string[],
    depth: 'standard',
  });

  // Emit appropriate signal based on assessment
  if (evaluation.overall_assessment === 'affirm') {
    context.emit(createSignal(SignalTypes.ETHICS_AFFIRMED, {
      evaluation_id: evaluation.id,
      decision_text: decisionText.substring(0, 100),
    }));
  } else if (evaluation.overall_assessment === 'reject') {
    // Emit violation for each violation
    for (const violation of evaluation.violations) {
      context.emit(createSignal(SignalTypes.TENET_VIOLATION, {
        evaluation_id: evaluation.id,
        tenet: violation.tenet_name,
        severity: violation.severity,
        description: violation.description,
      }));
    }

    // Emit counterfeit detection
    for (const match of evaluation.counterfeits_matched) {
      context.emit(createSignal(SignalTypes.COUNTERFEIT_DETECTED, {
        evaluation_id: evaluation.id,
        tenet: match.tenet_name,
        pattern: match.counterfeit_pattern,
        confidence: match.confidence,
      }));
    }
  } else {
    // Caution - emit blind spot alert
    context.emit(createSignal(SignalTypes.BLIND_SPOT_ALERT, {
      evaluation_id: evaluation.id,
      recommendations: evaluation.recommendations,
    }));
  }
}

/**
 * Handle OPERATION_COMPLETE (0xFF)
 * Check if the operation had moral implications
 */
function handleOperationComplete(signal: Signal, context: HandlerContext): void {
  const data = signal.data;
  if (!data?.operation) {
    return; // Silent ignore if no operation details
  }

  // Quick check for moral implications
  const operation = String(data.operation);
  const quickResult = context.evaluator.quickEvaluate(operation);

  if (quickResult.counterfeitDetected) {
    context.emit(createSignal(SignalTypes.COUNTERFEIT_DETECTED, {
      operation,
      sender: signal.sender,
    }));
  }
}

/**
 * Handle LESSON_LEARNED (0xE5) from consciousness
 * Update patterns based on the lesson
 */
function handleLessonLearned(signal: Signal, context: HandlerContext): void {
  const data = signal.data;
  if (!data?.lesson) {
    return;
  }

  const lesson = String(data.lesson);

  // Check if this lesson creates a new pattern
  const existingPattern = context.db.findPatternByDescription(lesson);

  if (existingPattern) {
    context.db.updatePatternFrequency(existingPattern.id);
  } else {
    // Determine pattern type from lesson content
    let patternType: 'violation' | 'success' | 'counterfeit' | 'blind_spot' = 'success';

    if (lesson.toLowerCase().includes('violation') || lesson.toLowerCase().includes('wrong')) {
      patternType = 'violation';
    } else if (lesson.toLowerCase().includes('counterfeit') || lesson.toLowerCase().includes('fake')) {
      patternType = 'counterfeit';
    } else if (lesson.toLowerCase().includes('missed') || lesson.toLowerCase().includes('blind spot')) {
      patternType = 'blind_spot';
    }

    context.db.insertPattern({
      pattern_type: patternType,
      description: lesson,
      related_tenets: [],
      frequency: 1,
      last_seen: Date.now(),
      confidence: 0.5,
    });
  }
}

/**
 * Handle HEARTBEAT (0x00)
 * Track server health
 */
function handleHeartbeat(_signal: Signal, _context: HandlerContext): void {
  // Just acknowledge - could be used for peer health tracking
}
