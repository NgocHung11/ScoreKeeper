export interface Player {
    id: string;
    name: string;
    score: number;
}

export interface RoundRecord {
    id: string;
    timestamp: number;
    dealerId: string;
    scoresChange: Record<string, number>;
}

export interface Game {
    players: Player[];
    currentDealerId: string | null;
    history: RoundRecord[]
}