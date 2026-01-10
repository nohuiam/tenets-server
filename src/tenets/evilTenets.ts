/**
 * Tenets of Evil - The Opposites of Christ's Gospel Tenets
 *
 * Each Tenet of Evil is the direct opposite of a Tenet of Christ,
 * creating a moral spectrum for the Christ-Oh-Meter:
 *
 * TENETS OF EVIL (-1.0) <------- NEUTRAL (0) -------> TENETS OF CHRIST (+1.0)
 *
 * Used by NIWS Story Briefs to rate government actions and decisions.
 */

export interface EvilTenet {
  id: number;
  name: string;
  opposite_of: string;
  definition: string;
  indicators: string[];  // Signs this anti-tenet is present
  examples: string[];    // Real-world examples
}

/**
 * The 25 Tenets of Evil - opposites of the Gospel Tenets
 */
export const EVIL_TENETS: Record<number, EvilTenet> = {
  1: {
    id: 1,
    name: 'HATRED',
    opposite_of: 'LOVE',
    definition: 'Seeking the harm, destruction, or diminishment of others. Treating people as enemies to be conquered rather than neighbors to be served.',
    indicators: [
      'Dehumanizing language about groups',
      'Policies designed to harm specific populations',
      'Celebrating others\' suffering',
      'Actions that deliberately damage others',
    ],
    examples: [
      'Ethnic cleansing campaigns',
      'Deliberately cruel policies targeting vulnerable groups',
      'Public demonization of minorities',
    ],
  },

  2: {
    id: 2,
    name: 'WOUNDING',
    opposite_of: 'HEALING',
    definition: 'Creating damage, breaking what is whole, and causing harm that leaves lasting scars.',
    indicators: [
      'Actions that create trauma',
      'Breaking functioning systems',
      'Inflicting psychological damage',
      'Destroying relationships and communities',
    ],
    examples: [
      'Family separation policies',
      'Destroying healthcare access',
      'Actions that create PTSD',
    ],
  },

  3: {
    id: 3,
    name: 'CRUELTY',
    opposite_of: 'COMPASSION',
    definition: 'Taking pleasure in suffering, showing callous disregard for pain, and actively inflicting harm.',
    indicators: [
      'Indifference to suffering when you have power to help',
      'Making situations worse for the suffering',
      'Mocking those in distress',
      'Creating unnecessary hardship',
    ],
    examples: [
      'Denying aid during disasters',
      'Mocking disabled individuals',
      'Policies that maximize suffering',
    ],
  },

  4: {
    id: 4,
    name: 'VENGEANCE',
    opposite_of: 'FORGIVENESS',
    definition: 'Perpetuating cycles of retaliation, seeking punishment beyond justice, and refusing to break chains of harm.',
    indicators: [
      'Disproportionate responses to wrongs',
      'Seeking to destroy rather than restore',
      'Holding grudges as policy',
      'Using past wrongs to justify current cruelty',
    ],
    examples: [
      'Punitive policies that serve no rehabilitative purpose',
      'Collective punishment for individual actions',
      'Generational punishment',
    ],
  },

  5: {
    id: 5,
    name: 'STRIFE',
    opposite_of: 'PEACE',
    definition: 'Sowing discord, creating conflict where none existed, and profiting from division.',
    indicators: [
      'Deliberately inflaming tensions',
      'Creating "us vs them" narratives',
      'Sabotaging peace efforts',
      'Benefiting from continued conflict',
    ],
    examples: [
      'Stoking culture wars for political gain',
      'Arming both sides of a conflict',
      'Fear-mongering to maintain power',
    ],
  },

  6: {
    id: 6,
    name: 'RUTHLESSNESS',
    opposite_of: 'MERCY',
    definition: 'Showing no relief, maximizing burdens, and refusing to temper justice with compassion.',
    indicators: [
      'Zero tolerance without discretion',
      'Maximum penalties regardless of circumstances',
      'No exceptions even when warranted',
      'Treating people as disposable',
    ],
    examples: [
      'Mandatory minimum sentences for minor offenses',
      'Deporting people to certain death',
      'Denying clemency in clear cases of injustice',
    ],
  },

  7: {
    id: 7,
    name: 'OPPRESSION',
    opposite_of: 'JUSTICE',
    definition: 'Exploiting the vulnerable, protecting the powerful, and using systems to entrench inequality.',
    indicators: [
      'Different rules for different classes',
      'Using power to extract from the powerless',
      'Systemic barriers against advancement',
      'Corruption that benefits elites',
    ],
    examples: [
      'Two-tiered justice systems',
      'Tax policies that burden the poor',
      'Voter suppression of minorities',
    ],
  },

  8: {
    id: 8,
    name: 'EXPLOITATION',
    opposite_of: 'SERVICE',
    definition: 'Using power to extract from others rather than to serve them. Treating people as means to your ends.',
    indicators: [
      'Taking credit for others\' work',
      'Using position for personal gain',
      'Extracting value while returning nothing',
      'Treating people as resources',
    ],
    examples: [
      'Wage theft',
      'Corruption and self-dealing',
      'Using office to enrich family and friends',
    ],
  },

  9: {
    id: 9,
    name: 'DECEPTION',
    opposite_of: 'TRUTH',
    definition: 'Lying, misleading, obscuring reality, and weaponizing information.',
    indicators: [
      'Deliberate falsehoods',
      'Strategic omissions',
      'Gaslighting',
      'Propaganda campaigns',
    ],
    examples: [
      'Knowingly spreading disinformation',
      'Covering up wrongdoing',
      'Manufacturing false narratives',
    ],
  },

  10: {
    id: 10,
    name: 'PRIDE',
    opposite_of: 'HUMILITY',
    definition: 'Exalting self, claiming unearned credit, refusing correction, and believing yourself above accountability.',
    indicators: [
      'Taking credit for others\' accomplishments',
      'Refusing to admit mistakes',
      'Believing rules don\'t apply to you',
      'Demanding special treatment',
    ],
    examples: [
      'Leaders who refuse to acknowledge errors',
      'Claiming divine mandate for personal ambition',
      'Exempting self from standards applied to others',
    ],
  },

  11: {
    id: 11,
    name: 'DESPAIR',
    opposite_of: 'FAITH',
    definition: 'Abandoning hope, spreading hopelessness, and acting as if positive change is impossible.',
    indicators: [
      'Discouraging action with fatalism',
      'Spreading defeatism',
      'Undermining others\' faith',
      'Acting as if nothing matters',
    ],
    examples: [
      '"Nothing can be done" rhetoric',
      'Discouraging civic engagement',
      'Nihilistic governance',
    ],
  },

  12: {
    id: 12,
    name: 'NIHILISM',
    opposite_of: 'HOPE',
    definition: 'Denying meaning, discouraging positive action, and treating values as worthless.',
    indicators: [
      'Cynical dismissal of ideals',
      'Treating ethics as naive',
      '"Everyone does it" justifications',
      'Mocking those who try to do good',
    ],
    examples: [
      'Normalizing corruption',
      'Treating integrity as weakness',
      'Policies designed around lowest expectations',
    ],
  },

  13: {
    id: 13,
    name: 'GREED',
    opposite_of: 'SACRIFICE',
    definition: 'Taking for self at others\' expense, hoarding when others lack, and valuing accumulation over all.',
    indicators: [
      'Taking more than your share',
      'Prioritizing wealth over welfare',
      'Refusing to share resources',
      'Profiting from others\' loss',
    ],
    examples: [
      'Price gouging during emergencies',
      'Cutting programs to fund tax cuts for wealthy',
      'Hoarding during shortages',
    ],
  },

  14: {
    id: 14,
    name: 'DIVISION',
    opposite_of: 'UNITY',
    definition: 'Tearing apart what should be together, creating factions, and preventing solidarity.',
    indicators: [
      'Pitting groups against each other',
      'Creating artificial tribes',
      'Breaking coalitions',
      'Preventing cooperation',
    ],
    examples: [
      'Racial wedge politics',
      'Manufactured cultural conflicts',
      'Breaking up alliances',
    ],
  },

  15: {
    id: 15,
    name: 'HOARDING',
    opposite_of: 'GENEROSITY',
    definition: 'Withholding from those in need, accumulating beyond need, and refusing to share abundance.',
    indicators: [
      'Excess while others lack',
      'Refusing aid when able',
      'Protecting wealth over lives',
      'Blocking resource distribution',
    ],
    examples: [
      'Blocking food aid to starving populations',
      'Destroying surplus rather than distributing',
      'Cutting social programs during abundance',
    ],
  },

  16: {
    id: 16,
    name: 'FOOLISHNESS',
    opposite_of: 'WISDOM',
    definition: 'Rejecting discernment, following tribalism over truth, and refusing to learn from evidence.',
    indicators: [
      'Ignoring expert consensus',
      'Tribal loyalty over truth',
      'Repeating failed approaches',
      'Rejecting evidence',
    ],
    examples: [
      'Denying scientific consensus',
      'Policy by ideology rather than evidence',
      'Loyalty tests over competence',
    ],
  },

  17: {
    id: 17,
    name: 'CONDEMNATION',
    opposite_of: 'GRACE',
    definition: 'Demanding performance before acceptance, withholding forgiveness, and treating people as irredeemable.',
    indicators: [
      'No second chances',
      'Defining people by worst moments',
      'Requiring perfection to be treated humanely',
      'Permanent punishment for temporary failures',
    ],
    examples: [
      'Lifetime disqualifications for minor offenses',
      'Denying aid based on past mistakes',
      'Treating people as unchangeable',
    ],
  },

  18: {
    id: 18,
    name: 'CORRUPTION',
    opposite_of: 'RIGHTEOUSNESS',
    definition: 'Enabling or participating in moral decay, normalizing wrongdoing, and abandoning ethical standards.',
    indicators: [
      'Looking the other way at wrongdoing',
      'Participating in systems of harm',
      'Lowering standards for convenience',
      'Normalizing what should be condemned',
    ],
    examples: [
      'Covering up crimes by allies',
      'Participating in bribery schemes',
      'Abandoning ethics for expedience',
    ],
  },

  19: {
    id: 19,
    name: 'ISOLATION',
    opposite_of: 'FELLOWSHIP',
    definition: 'Excluding, creating loneliness, and breaking community bonds.',
    indicators: [
      'Excluding people from community',
      'Breaking social bonds',
      'Creating outcasts',
      'Preventing connection',
    ],
    examples: [
      'Solitary confinement as standard practice',
      'Policies that separate families',
      'Social exclusion of minorities',
    ],
  },

  20: {
    id: 20,
    name: 'STUNTING',
    opposite_of: 'DISCIPLESHIP',
    definition: 'Preventing growth, creating dependency, and keeping people from reaching potential.',
    indicators: [
      'Keeping people dependent',
      'Blocking advancement opportunities',
      'Creating permanent underclasses',
      'Discouraging development',
    ],
    examples: [
      'Defunding education',
      'Blocking job training for incarcerated',
      'Policies that trap people in poverty',
    ],
  },

  21: {
    id: 21,
    name: 'OBSTINACY',
    opposite_of: 'REPENTANCE',
    definition: 'Refusing to acknowledge wrong, doubling down on errors, and treating criticism as attack.',
    indicators: [
      'Never admitting mistakes',
      'Attacking those who point out errors',
      'Treating criticism as disloyalty',
      'Repeating harmful actions',
    ],
    examples: [
      'Refusing to apologize for clear wrongs',
      'Punishing whistleblowers',
      'Treating accountability as persecution',
    ],
  },

  22: {
    id: 22,
    name: 'ABANDONMENT',
    opposite_of: 'REDEMPTION',
    definition: 'Denying second chances, treating people as permanently broken, and refusing pathways to restoration.',
    indicators: [
      'Permanent exclusion',
      'No path back from mistakes',
      'Treating people as irredeemable',
      'Refusing rehabilitation',
    ],
    examples: [
      'Lifetime bans for first offenses',
      'No parole possibilities',
      'Permanent denial of rights',
    ],
  },

  23: {
    id: 23,
    name: 'BETRAYAL',
    opposite_of: 'FAITHFULNESS',
    definition: 'Breaking commitments when convenient, abandoning allies, and proving unreliable.',
    indicators: [
      'Breaking promises',
      'Abandoning commitments under pressure',
      'Selling out allies',
      'Inconsistency between words and actions',
    ],
    examples: [
      'Breaking treaties',
      'Abandoning allies to enemies',
      'Promising one thing, doing another',
    ],
  },

  24: {
    id: 24,
    name: 'MISERY',
    opposite_of: 'JOY',
    definition: 'Spreading despair, crushing gladness, and making life harder than it needs to be.',
    indicators: [
      'Creating unnecessary suffering',
      'Crushing celebrations',
      'Making systems punitive by design',
      'Treating happiness with suspicion',
    ],
    examples: [
      'Criminalization of harmless activities',
      'Policies designed to humiliate',
      'Making aid degrading to receive',
    ],
  },

  25: {
    id: 25,
    name: 'DEGRADATION',
    opposite_of: 'DIGNITY',
    definition: 'Stripping worth from persons, dehumanizing treatment, and attacking inherent human value.',
    indicators: [
      'Dehumanizing language',
      'Treating people as less than human',
      'Stripping dignity from processes',
      'Attacking personhood',
    ],
    examples: [
      'Strip searches without cause',
      'Public humiliation as policy',
      'Treating any group as subhuman',
    ],
  },
};

/**
 * Get evil tenet by ID
 */
export function getEvilTenet(id: number): EvilTenet | undefined {
  return EVIL_TENETS[id];
}

/**
 * Get evil tenet by its opposite Christ tenet name
 */
export function getEvilTenetByOpposite(christTenetName: string): EvilTenet | undefined {
  const upperName = christTenetName.toUpperCase();
  return Object.values(EVIL_TENETS).find(
    tenet => tenet.opposite_of.toUpperCase() === upperName
  );
}

/**
 * Get the tenet pair (Christ + Evil) by ID
 */
export function getTenetPair(id: number): { christ: string; evil: string } | undefined {
  const evilTenet = EVIL_TENETS[id];
  if (!evilTenet) return undefined;

  return {
    christ: evilTenet.opposite_of,
    evil: evilTenet.name,
  };
}

/**
 * All tenet pairs for display
 */
export const TENET_PAIRS: Array<{ id: number; christ: string; evil: string }> = Object.values(EVIL_TENETS).map(t => ({
  id: t.id,
  christ: t.opposite_of,
  evil: t.name,
}));
