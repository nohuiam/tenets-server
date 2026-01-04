# Tenets Server Barespec

**Server:** tenets-server
**Version:** 1.0.0
**Port Assignment:** MCP stdio | UDP 3027 | HTTP 8027 | WS 9027
**Purpose:** Ethical decision evaluation against 25 Gospel tenets

---

## Definition

Tenets Server evaluates decisions/actions against 25 ethical principles derived from Christ's canonical Gospel teachings. Flags violations, identifies counterfeits, affirms aligned actions, provides remediation guidance.

**Core Principle:** "Evaluate by tenets, not by tribe"

---

## The 25 Tenets

| ID | Tenet | Category | Core Test |
|----|-------|----------|-----------|
| 1 | LOVE | foundation | Seeks highest good of others? |
| 2 | HEALING | action | Empowers or creates dependency? |
| 3 | COMPASSION | action | Responds with practical help? |
| 4 | FORGIVENESS | restoration | Breaks cycles of retaliation? |
| 5 | PEACE | community | Addresses root causes? |
| 6 | MERCY | restoration | Relieves crushing burdens? |
| 7 | JUSTICE | action | Protects vulnerable from exploitation? |
| 8 | SERVICE | action | Uses power to serve others? |
| 9 | TRUTH | character | Accurate and delivered with compassion? |
| 10 | HUMILITY | character | Acknowledges limitations honestly? |
| 11 | FAITH | character | Maintains hope with action? |
| 12 | HOPE | character | Pairs vision with practical work? |
| 13 | SACRIFICE | action | Genuine giving for others' benefit? |
| 14 | UNITY | community | Builds bridges across divisions? |
| 15 | GENEROSITY | community | Gives to meet genuine need? |
| 16 | WISDOM | character | Discernment over tribalism? |
| 17 | GRACE | restoration | Offers acceptance before performance? |
| 18 | RIGHTEOUSNESS | character | Stands against corruption? |
| 19 | FELLOWSHIP | community | Creates inclusive community? |
| 20 | DISCIPLESHIP | community | Develops others' capacity? |
| 21 | REPENTANCE | restoration | Acknowledges wrongs with change? |
| 22 | REDEMPTION | restoration | Creates genuine second chances? |
| 23 | FAITHFULNESS | character | Consistent through trials? |
| 24 | JOY | character | Gladness in meaningful service? |
| 25 | DIGNITY | restoration | Restores worth to marginalized? |

**Categories:**
- foundation (1): LOVE - all others flow from this
- action (5): HEALING, COMPASSION, JUSTICE, SERVICE, SACRIFICE
- character (8): TRUTH, HUMILITY, FAITH, HOPE, WISDOM, RIGHTEOUSNESS, FAITHFULNESS, JOY
- community (5): PEACE, UNITY, GENEROSITY, FELLOWSHIP, DISCIPLESHIP
- restoration (6): FORGIVENESS, MERCY, GRACE, REDEMPTION, REPENTANCE, DIGNITY

---

## 4-Layer Architecture

| Layer | Transport | Port | Purpose |
|-------|-----------|------|---------|
| MCP | stdio | stdin/stdout | Claude Desktop/web app interface |
| InterLock | UDP | 3027 | Mesh signals |
| HTTP | REST | 8027 | API access |
| WebSocket | WS | 9027 | Real-time events |

---

## MCP Tools (8)

### evaluate_decision
Assess decision/action against all 25 tenets.

**Input:**
```typescript
{
  decision_text: string;      // Required
  context?: object;           // Optional context
  stakeholders?: string[];    // Optional affected parties
  depth?: 'quick' | 'standard' | 'deep';  // Default: 'standard'
}
```

**Output:**
```typescript
{
  evaluation_id: string;
  overall_assessment: 'affirm' | 'caution' | 'reject';
  tenet_scores: Record<number, number>;
  violations: Violation[];
  counterfeits_matched: CounterfeitMatch[];
  recommendations: string[];
}
```

### check_counterfeit
Check if action matches known counterfeit patterns.

**Input:**
```typescript
{
  action_description: string;  // Required
  claimed_tenet?: string;      // Optional specific tenet
}
```

**Output:**
```typescript
{
  is_counterfeit: boolean;
  matched_counterfeits: CounterfeitMatch[];
  authentic_alternative?: string;
  explanation: string;
}
```

### identify_blind_spots
Find ethical gaps in a plan or decision.

**Input:**
```typescript
{
  plan_text: string;          // Required
  scope?: 'stakeholders' | 'harms' | 'tenets' | 'all';  // Default: 'all'
}
```

**Output:**
```typescript
{
  blind_spots: BlindSpot[];
  missing_stakeholders: string[];
  unaddressed_harms: string[];
  recommendations: string[];
}
```

### record_evaluation
Store evaluation for pattern detection.

**Input:**
```typescript
{
  decision_id: string;         // Required
  assessment: 'affirm' | 'caution' | 'reject';  // Required
  violations?: string[];       // Optional
  notes?: string;              // Optional
}
```

**Output:**
```typescript
{
  recorded: true;
  evaluation_id: string;
  patterns_triggered: Pattern[];
}
```

### get_evaluation_history
Retrieve past evaluations.

**Input:**
```typescript
{
  tenet_filter?: string;       // Filter by tenet name
  assessment_filter?: 'affirm' | 'caution' | 'reject';
  time_range?: '24h' | '7d' | '30d' | 'all';  // Default: 'all'
  limit?: number;              // Default: 50
}
```

**Output:**
```typescript
{
  evaluations: Evaluation[];
  count: number;
  violation_patterns: Pattern[];
}
```

### get_tenet
Retrieve full tenet details.

**Input:**
```typescript
{
  tenet_name?: string;  // Either name
  tenet_id?: number;    // Or ID required
}
```

**Output:**
```typescript
{
  id: number;
  name: string;
  definition: string;
  scripture_anchors: string[];
  decision_criteria: string[];
  counterfeits: string[];
  sub_tenets: string[] | null;
  transformation_pattern: string;
  category: string;
}
```

### list_tenets
List all tenets with optional filtering.

**Input:**
```typescript
{
  category?: 'foundation' | 'action' | 'character' | 'community' | 'restoration';
}
```

**Output:**
```typescript
{
  tenets: TenetSummary[];
  count: number;
}
```

### suggest_remediation
Get guidance to address violations.

**Input:**
```typescript
{
  violation_description: string;  // Required
  tenet_violated: string;         // Required
  context?: object;               // Optional
}
```

**Output:**
```typescript
{
  remediation_steps: string[];
  scripture_guidance: string[];
  transformation_path: string;
  related_tenets: string[];
}
```

---

## Database Schema (SQLite)

### Tables

**tenets** - 25 pre-seeded ethical principles
- id, name, definition, scripture_anchors (JSON), decision_criteria (JSON)
- counterfeits (JSON), sub_tenets (JSON), transformation_pattern, category

**evaluations** - Decision assessments
- id, decision_text, context (JSON), stakeholders (JSON), overall_assessment
- tenet_scores (JSON), violations (JSON), counterfeits_matched (JSON)
- recommendations (JSON), depth, created_at

**violations** - Tenet violations
- id, evaluation_id, tenet_id, severity, description
- counterfeit_pattern, remediation_applied, resolved_at, created_at

**patterns** - Learned patterns
- id, pattern_type, description, related_tenets (JSON)
- frequency, last_seen, confidence, created_at

---

## Evaluation Logic

### 5 Primary Tests
1. **Love Test:** Seeks highest good of others?
2. **Vulnerability Test:** Protects or exploits vulnerable?
3. **Counterfeit Test:** Matches counterfeit pattern?
4. **Systemic Test:** Addresses root causes?
5. **Transformation Test:** Empowers or creates dependency?

### Scoring Algorithm
```
tenet_score = base(0.5)
            + positive_keywords * 0.03
            - negative_keywords * 0.05
            + criteria_bonus(0.1)
            - counterfeit_penalty(0.15)
            - gap_penalty(0.08)
```

### Assessment Thresholds
- AFFIRM: avgScore >= 0.65, no violations, love+vulnerability tests pass
- REJECT: critical violations OR 2+ counterfeits
- CAUTION: default for borderline cases

---

## HTTP REST API (Port 8027)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server health check |
| GET | /api/stats | Evaluation statistics |
| GET | /api/tenets | List all tenets |
| GET | /api/tenets/:id | Get specific tenet |
| GET | /api/tenets/category/:cat | Tenets by category |
| POST | /api/evaluate | Evaluate a decision |
| POST | /api/check-counterfeit | Check counterfeit patterns |
| POST | /api/blind-spots | Identify ethical gaps |
| GET | /api/evaluations | List evaluations |
| GET | /api/evaluations/:id | Get evaluation |
| GET | /api/violations | List violations |
| POST | /api/remediation | Get remediation guidance |

---

## WebSocket Events (Port 9027)

| Direction | Event | Data |
|-----------|-------|------|
| S→C | evaluation_complete | { evaluation_id, assessment, violation_count } |
| S→C | violation_detected | { tenet, severity, description } |
| S→C | counterfeit_matched | { tenet, counterfeit_pattern } |
| S→C | blind_spot_identified | { area, severity, recommendation } |
| S→C | pattern_emerged | { pattern_type, description, confidence } |
| C↔S | ping/pong | { timestamp } |

---

## InterLock Signals

### Listens To
| Signal | Code | From | Action |
|--------|------|------|--------|
| DECISION_PENDING | 0xD0 | consciousness | Evaluate decision |
| OPERATION_COMPLETE | 0xFF | * | Check moral implications |
| LESSON_LEARNED | 0xE5 | consciousness | Update patterns |
| HEARTBEAT | 0x00 | * | Track health |

### Emits
| Signal | Code | To | When |
|--------|------|----|------|
| TENET_VIOLATION | 0xB0 | consciousness | Violation detected |
| COUNTERFEIT_DETECTED | 0xB1 | consciousness | Counterfeit matched |
| ETHICS_AFFIRMED | 0xB2 | consciousness | Decision affirmed |
| BLIND_SPOT_ALERT | 0xB3 | consciousness | Gap found |
| REMEDIATION_NEEDED | 0xB4 | consciousness | Guidance required |

---

## File Structure

```
tenets-server/
├── config/
│   └── interlock.json
├── data/
│   └── tenets.json
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── database/
│   │   ├── schema.ts
│   │   └── seed.ts
│   ├── tools/
│   │   ├── index.ts
│   │   └── [8 tool files]
│   ├── services/
│   │   ├── evaluator.ts
│   │   └── counterfeit-detector.ts
│   ├── interlock/
│   │   ├── index.ts
│   │   ├── socket.ts
│   │   ├── protocol.ts
│   │   ├── handlers.ts
│   │   └── tumbler.ts
│   ├── http/
│   │   └── server.ts
│   └── websocket/
│       └── server.ts
├── tests/
│   └── [6 test files, 141 tests]
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Dependencies

- @modelcontextprotocol/sdk: ^0.6.0
- better-sqlite3: ^11.0.0
- express: ^4.21.0
- ws: ^8.18.0
- zod: ^3.23.0
- uuid: ^11.0.3

**Dev:**
- typescript: ^5.6.0
- jest: ^29.7.0
- @types/node, @types/better-sqlite3, @types/express, @types/ws

---

## Test Coverage

- **141 tests total**
- database.test.ts: 24 tests
- evaluator.test.ts: 24 tests
- counterfeit.test.ts: 28 tests
- tools.test.ts: 30 tests
- interlock.test.ts: 21 tests
- integration.test.ts: 14 tests

---

## Usage

**Build:**
```bash
npm run build
```

**Test:**
```bash
npm test
```

**Start (stdio):**
```bash
npm start
```

**Environment Variables:**
- TENETS_DB_PATH: Database path (default: :memory:)
- TENETS_HTTP_PORT: HTTP port (default: 8027)
- TENETS_WS_PORT: WebSocket port (default: 9027)
- TENETS_UDP_PORT: InterLock port (default: 3027)
