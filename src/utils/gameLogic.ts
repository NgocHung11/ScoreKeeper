import { Player } from "../types";


export const calculateNewScores = (
    currentPlayers: Player[],
    dealerId: string,
    playerChanges: Record<string, number>
) => {
    const newPlayers = currentPlayers.map(p => ({...p}))

    const dealerIndex = currentPlayers.findIndex(p => p.id === dealerId)
    if (dealerIndex === -1) return currentPlayers

    let dealerProfit = 0;

    newPlayers.forEach(player => {
        if (player.id === dealerId) return;

        const change =  playerChanges[player.id] || 0;
        if (change !== 0) {
            player.score += change;
            dealerProfit -= change;
        }
    })
    newPlayers[dealerIndex].score += dealerProfit;
    return newPlayers;
}