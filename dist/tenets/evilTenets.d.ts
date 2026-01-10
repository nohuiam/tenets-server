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
    indicators: string[];
    examples: string[];
}
/**
 * The 25 Tenets of Evil - opposites of the Gospel Tenets
 */
export declare const EVIL_TENETS: Record<number, EvilTenet>;
/**
 * Get evil tenet by ID
 */
export declare function getEvilTenet(id: number): EvilTenet | undefined;
/**
 * Get evil tenet by its opposite Christ tenet name
 */
export declare function getEvilTenetByOpposite(christTenetName: string): EvilTenet | undefined;
/**
 * Get the tenet pair (Christ + Evil) by ID
 */
export declare function getTenetPair(id: number): {
    christ: string;
    evil: string;
} | undefined;
/**
 * All tenet pairs for display
 */
export declare const TENET_PAIRS: Array<{
    id: number;
    christ: string;
    evil: string;
}>;
