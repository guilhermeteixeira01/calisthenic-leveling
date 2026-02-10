import { XP_POR_RANK } from "../constants/xpPorRank";

const RANKS = Object.entries(XP_POR_RANK);

/**
 * FUNÇÃO ÚNICA E OFICIAL
 * Corrige bug do limite do Rank S (4550 XP)
 */
export function calcularProgressoXp(xpTotal = 0) {
    let acumulado = 0;

    for (let i = 0; i < RANKS.length; i++) {
        const [rank, xpRank] = RANKS[i];

        // Encontrou o rank atual
        if (xpTotal < acumulado + xpRank) {
            const xpAtual = xpTotal - acumulado;
            const progresso = Math.min((xpAtual / xpRank) * 100, 100);

            return {
                rankAtual: rank,
                nivel: i + 1,
                xpAtual,
                xpMax: xpRank,
                progresso
            };
        }

        acumulado += xpRank;
    }

    // === RANK S (XP ACIMA DO TOTAL DOS RANKS) ===
    const xpExtra = xpTotal - acumulado;

    return {
        rankAtual: "S",
        nivel: RANKS.length,
        xpAtual: Math.max(0, xpExtra),
        xpMax: XP_POR_RANK.S,
        progresso: Math.min((xpExtra / XP_POR_RANK.S) * 100, 100)
    };
}

export function calcularRankPorXp(xpTotal) {
    let acumulado = 0;

    for (const [rank, xpRank] of RANKS) {
        acumulado += xpRank;
        if (xpTotal < acumulado) {
            return rank;
        }
    }

    return "S";
}
