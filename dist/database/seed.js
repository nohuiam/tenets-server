/**
 * Tenets Server Database Seeding
 * Initializes the 25 Gospel tenets from seed data
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Load tenets from seed file and insert into database
 */
export function seedTenets(db) {
    // Check if tenets already exist
    const existingCount = db.getTenetCount();
    if (existingCount > 0) {
        return existingCount;
    }
    // Load seed data
    const seedPath = join(__dirname, '../../data/tenets.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));
    // Insert each tenet
    let insertedCount = 0;
    for (const tenet of seedData.tenets) {
        db.insertTenet({
            id: tenet.id,
            name: tenet.name,
            definition: tenet.definition,
            scripture_anchors: tenet.scripture_anchors,
            decision_criteria: tenet.decision_criteria,
            counterfeits: tenet.counterfeits,
            sub_tenets: tenet.sub_tenets,
            transformation_pattern: tenet.transformation_pattern,
            category: tenet.category,
        });
        insertedCount++;
    }
    return insertedCount;
}
/**
 * Seed tenets with inline data (for testing without file dependency)
 */
export function seedTenetsInline(db) {
    const existingCount = db.getTenetCount();
    if (existingCount > 0) {
        return existingCount;
    }
    const tenets = [
        {
            id: 1,
            name: 'LOVE',
            definition: 'Unconditional, sacrificial action (agape) seeking the highest good of others regardless of personal cost.',
            scripture_anchors: ['John 13:34', 'John 13:35'],
            decision_criteria: [
                'Does this action seek the other\'s highest good?',
                'Does this cross boundaries to include the vulnerable stranger?',
                'Is this active care, not passive sentiment?',
            ],
            counterfeits: [
                'Transactional conditions',
                'Possessiveness and jealousy',
                'Manipulation through flattery',
                'Abuse claiming to be love',
            ],
            sub_tenets: ['Kindness', 'Courtesy'],
            transformation_pattern: 'Love creates the safety necessary for all other tenets to function.',
            category: 'foundation',
        },
        {
            id: 2,
            name: 'HEALING',
            definition: 'Restoring what is broken while empowering people to take ownership of their own recovery.',
            scripture_anchors: ['Matthew 9:35', 'Mark 5:34'],
            decision_criteria: [
                'Does this empower or create dependency?',
                'Does this address root causes or just symptoms?',
            ],
            counterfeits: [
                'Medical paternalism',
                'Prosperity theology healing',
                'Dependency-creating care',
            ],
            sub_tenets: null,
            transformation_pattern: 'Love recognizes wounds; Healing restores them.',
            category: 'action',
        },
        {
            id: 3,
            name: 'COMPASSION',
            definition: 'Feeling others\' pain and responding with practical action to alleviate suffering.',
            scripture_anchors: ['Matthew 14:14'],
            decision_criteria: [
                'Does this respond to genuine need with practical help?',
                'Is this wise compassion (not naive enabling)?',
            ],
            counterfeits: [
                'Sentiment without action',
                'Enabling destructive behavior',
                'Performative compassion',
            ],
            sub_tenets: null,
            transformation_pattern: 'Compassion sees the need that Healing addresses.',
            category: 'action',
        },
        {
            id: 4,
            name: 'FORGIVENESS',
            definition: 'Breaking cycles of harm through release of resentment while maintaining appropriate accountability.',
            scripture_anchors: ['Luke 23:34', 'Matthew 18:22'],
            decision_criteria: [
                'Does this break cycles of retaliation?',
                'Does this include accountability and truth-telling?',
            ],
            counterfeits: [
                'Cheap grace',
                'Toxic forgiveness',
                'Revenge disguised as justice',
            ],
            sub_tenets: null,
            transformation_pattern: 'REPENTANCE → FORGIVENESS → REDEMPTION',
            category: 'restoration',
        },
        {
            id: 5,
            name: 'PEACE',
            definition: 'Doing the hard work of reconciliation and addressing root causes of conflict.',
            scripture_anchors: ['Matthew 5:9'],
            decision_criteria: [
                'Does this address root causes or just avoid symptoms?',
                'Is this peacemaking (active) or peacekeeping (passive avoidance)?',
            ],
            counterfeits: [
                'Peacekeeping (avoiding conflict at all costs)',
                'Superficial harmony that ignores injustice',
            ],
            sub_tenets: null,
            transformation_pattern: 'Peace creates the environment where Mercy can flourish.',
            category: 'community',
        },
        {
            id: 6,
            name: 'MERCY',
            definition: 'Showing unearned kindness to those who cannot repay. Relieving crushing burdens.',
            scripture_anchors: ['Luke 6:36', 'Matthew 18:21-35'],
            decision_criteria: [
                'Does this relieve crushing burdens?',
                'Does this choose healing over punishment?',
            ],
            counterfeits: [
                'Cruelty disguised as tough love',
                'Punishment for its own sake',
            ],
            sub_tenets: null,
            transformation_pattern: 'Peace creates space for Mercy; Mercy enables Justice to be restorative.',
            category: 'restoration',
        },
        {
            id: 7,
            name: 'JUSTICE',
            definition: 'Overturning corrupt systems that exploit the vulnerable. Protecting the innocent.',
            scripture_anchors: ['Matthew 23:23', 'Matthew 5:6'],
            decision_criteria: [
                'Does this protect the vulnerable from exploitation?',
                'Does this address systemic corruption?',
            ],
            counterfeits: [
                'Vengeance disguised as justice',
                'Justice for some but not all',
            ],
            sub_tenets: null,
            transformation_pattern: 'Justice protects; Mercy heals. Both are required.',
            category: 'action',
        },
        {
            id: 8,
            name: 'SERVICE',
            definition: 'Leading by serving. Using authority to meet others\' needs rather than your own.',
            scripture_anchors: ['Mark 10:45', 'John 13:1-17'],
            decision_criteria: [
                'Does this use power to serve or to be served?',
                'Is this genuine service or self-promotion?',
            ],
            counterfeits: [
                'Self-promotion disguised as service',
                'Service with strings attached',
            ],
            sub_tenets: null,
            transformation_pattern: 'Service demonstrates Love in tangible form.',
            category: 'action',
        },
        {
            id: 9,
            name: 'TRUTH',
            definition: 'Speaking reality in love. Combating deception while maintaining compassion.',
            scripture_anchors: ['John 8:32', 'John 18:37'],
            decision_criteria: [
                'Is this accurate and verifiable?',
                'Is truth delivered with compassion?',
            ],
            counterfeits: [
                'Truth without love (weaponized honesty)',
                'Propaganda disguised as truth',
            ],
            sub_tenets: null,
            transformation_pattern: 'Truth enables authentic relationship; deception destroys it.',
            category: 'character',
        },
        {
            id: 10,
            name: 'HUMILITY',
            definition: 'Recognizing our limits and maintaining teachability. The opposite of pride.',
            scripture_anchors: ['Luke 14:11'],
            decision_criteria: [
                'Does this acknowledge limitations honestly?',
                'Is this open to correction and growth?',
            ],
            counterfeits: [
                'False humility',
                'Pride disguised as confidence',
            ],
            sub_tenets: ['Cleanliness'],
            transformation_pattern: 'Humility enables learning; pride blocks it.',
            category: 'character',
        },
        {
            id: 11,
            name: 'FAITH',
            definition: 'Trusting despite uncertainty. Active commitment, not passive belief.',
            scripture_anchors: ['Matthew 17:20'],
            decision_criteria: [
                'Does this maintain hope in the face of difficulty?',
                'Is this faith that produces action?',
            ],
            counterfeits: [
                'Faith that refuses to act',
                'Blind faith that enables manipulation',
            ],
            sub_tenets: ['Loyalty'],
            transformation_pattern: 'Faith sustains action when outcomes are uncertain.',
            category: 'character',
        },
        {
            id: 12,
            name: 'HOPE',
            definition: 'Believing in better futures and working toward them. Grounded confidence.',
            scripture_anchors: ['John 16:33'],
            decision_criteria: [
                'Does this maintain vision for positive change?',
                'Is this hope paired with practical action?',
            ],
            counterfeits: [
                'Naive optimism',
                'Hope without action',
            ],
            sub_tenets: null,
            transformation_pattern: 'Hope sustains long-term commitment to difficult work.',
            category: 'character',
        },
        {
            id: 13,
            name: 'SACRIFICE',
            definition: 'Giving up privilege, comfort, or resources for others\' benefit.',
            scripture_anchors: ['John 15:13'],
            decision_criteria: [
                'Is this genuine sacrifice or performative giving?',
                'Does this sacrifice create benefit for others?',
            ],
            counterfeits: [
                'Martyrdom complex',
                'Self-destruction disguised as sacrifice',
            ],
            sub_tenets: null,
            transformation_pattern: 'Love motivates Sacrifice; Sacrifice proves Love is genuine.',
            category: 'action',
        },
        {
            id: 14,
            name: 'UNITY',
            definition: 'Building bridges across divisions while maintaining truth and justice.',
            scripture_anchors: ['John 17:11'],
            decision_criteria: [
                'Does this build bridges across legitimate differences?',
                'Is this authentic unity or forced uniformity?',
            ],
            counterfeits: [
                'Forced uniformity',
                'Tribalism claiming to be unity',
            ],
            sub_tenets: null,
            transformation_pattern: 'Unity multiplies effectiveness of all other tenets.',
            category: 'community',
        },
        {
            id: 15,
            name: 'GENEROSITY',
            definition: 'Giving from abundance and scarcity to meet others\' needs.',
            scripture_anchors: ['Luke 6:30', 'Mark 12:41-44'],
            decision_criteria: [
                'Does this give to meet genuine need?',
                'Does this give without expectation of return?',
            ],
            counterfeits: [
                'Generosity for recognition',
                'Giving that creates dependency',
            ],
            sub_tenets: ['Thrift'],
            transformation_pattern: 'Generosity flows from recognizing all resources as entrusted for service.',
            category: 'community',
        },
        {
            id: 16,
            name: 'WISDOM',
            definition: 'Choosing truth over tribalism. Making decisions based on careful discernment.',
            scripture_anchors: ['Matthew 7:24'],
            decision_criteria: [
                'Is this decision based on careful discernment?',
                'Does this transcend tribal thinking?',
            ],
            counterfeits: [
                'Cleverness without ethics',
                'Tribal loyalty disguised as principle',
            ],
            sub_tenets: null,
            transformation_pattern: 'Wisdom guides application of all other tenets.',
            category: 'character',
        },
        {
            id: 17,
            name: 'GRACE',
            definition: 'Offering undeserved favor. Extending acceptance before performance.',
            scripture_anchors: ['John 1:17'],
            decision_criteria: [
                'Does this offer acceptance before performance?',
                'Does this balance grace with truth?',
            ],
            counterfeits: [
                'Cheap grace',
                'Conditional grace',
            ],
            sub_tenets: null,
            transformation_pattern: 'Grace creates the safety for Repentance; Law alone produces shame.',
            category: 'restoration',
        },
        {
            id: 18,
            name: 'RIGHTEOUSNESS',
            definition: 'Standing against corruption, injustice, and harm even when personally costly.',
            scripture_anchors: ['Matthew 6:33'],
            decision_criteria: [
                'Does this stand against corruption regardless of cost?',
                'Does this avoid self-righteousness?',
            ],
            counterfeits: [
                'Self-righteousness',
                'Righteousness without mercy',
            ],
            sub_tenets: null,
            transformation_pattern: 'Righteousness channels Love into confrontation with evil.',
            category: 'character',
        },
        {
            id: 19,
            name: 'FELLOWSHIP',
            definition: 'Creating inclusive community that bridges divisions.',
            scripture_anchors: ['Matthew 18:20'],
            decision_criteria: [
                'Does this create genuine connection across differences?',
                'Does this include the marginalized?',
            ],
            counterfeits: [
                'Networking disguised as fellowship',
                'Exclusive clubs claiming to be community',
            ],
            sub_tenets: null,
            transformation_pattern: 'Fellowship provides the context where all other tenets are practiced.',
            category: 'community',
        },
        {
            id: 20,
            name: 'DISCIPLESHIP',
            definition: 'Teaching others to serve and engage. Reproducing servant-leaders.',
            scripture_anchors: ['Matthew 28:19-20'],
            decision_criteria: [
                'Does this develop others\' capacity for service?',
                'Does this create leaders, not just followers?',
            ],
            counterfeits: [
                'Creating dependence instead of developing leaders',
                'Indoctrination rather than formation',
            ],
            sub_tenets: null,
            transformation_pattern: 'Discipleship multiplies all other tenets across generations.',
            category: 'community',
        },
        {
            id: 21,
            name: 'REPENTANCE',
            definition: 'Acknowledging wrongs and actively working to correct them.',
            scripture_anchors: ['Matthew 4:17', 'Luke 19:1-10'],
            decision_criteria: [
                'Does this acknowledge specific wrongs?',
                'Does this include concrete steps toward change?',
            ],
            counterfeits: [
                'Apology without change',
                'Confession as manipulation technique',
            ],
            sub_tenets: null,
            transformation_pattern: 'REPENTANCE → FORGIVENESS → REDEMPTION',
            category: 'restoration',
        },
        {
            id: 22,
            name: 'REDEMPTION',
            definition: 'Creating genuine second chances. Transforming past harm into future contribution.',
            scripture_anchors: ['John 21:15-19', 'Luke 15:11-32'],
            decision_criteria: [
                'Does this create genuine pathway to restoration?',
                'Does this believe in people\'s capacity for change?',
            ],
            counterfeits: [
                'Redemption without accountability',
                'Cheap redemption that ignores victims',
            ],
            sub_tenets: null,
            transformation_pattern: 'REPENTANCE → FORGIVENESS → REDEMPTION',
            category: 'restoration',
        },
        {
            id: 23,
            name: 'FAITHFULNESS',
            definition: 'Staying true through trials. Consistent commitment over time.',
            scripture_anchors: ['Luke 22:42', 'Matthew 25:21'],
            decision_criteria: [
                'Does this demonstrate consistency over time?',
                'Does this remain true to principles under pressure?',
            ],
            counterfeits: [
                'Stubbornness disguised as faithfulness',
                'Selective faithfulness',
            ],
            sub_tenets: null,
            transformation_pattern: 'Faithfulness sustains all other tenets over time.',
            category: 'character',
        },
        {
            id: 24,
            name: 'JOY',
            definition: 'Finding gladness in service. Deep satisfaction in meaningful contribution.',
            scripture_anchors: ['John 15:11'],
            decision_criteria: [
                'Does this cultivate genuine gladness in service?',
                'Is this deep satisfaction or superficial happiness?',
            ],
            counterfeits: [
                'Forced cheerfulness',
                'Joy at others\' expense',
            ],
            sub_tenets: null,
            transformation_pattern: 'Joy sustains servant work and attracts others to the path.',
            category: 'character',
        },
        {
            id: 25,
            name: 'DIGNITY',
            definition: 'Restoring worth to the shamed and marginalized. Treating all people as having inherent value.',
            scripture_anchors: ['Mark 14:6', 'John 4:4-26'],
            decision_criteria: [
                'Does this restore worth to those who\'ve been shamed?',
                'Does this fight dehumanizing systems?',
            ],
            counterfeits: [
                'Dignity for some but not all',
                'Conditional dignity',
            ],
            sub_tenets: null,
            transformation_pattern: 'Dignity is the opposite of shame; restoring dignity breaks shame cycles.',
            category: 'restoration',
        },
    ];
    let insertedCount = 0;
    for (const tenet of tenets) {
        db.insertTenet(tenet);
        insertedCount++;
    }
    return insertedCount;
}
