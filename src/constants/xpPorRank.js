export const SITENAME = "Calisthenic Leveling";
export const LEVELMAX = 100;
export const XP_POR_PONTO = 200;

export const XP_POR_RANK = {
    E: 300,    // 3 semanas ≈ 0 meses
    D: 1000,   // 10 semanas ≈ 2 meses e 2 semanas
    C: 2500,   // 25 semanas ≈ 5 meses e 3 semanas
    B: 6000,   // 60 semanas ≈ 1 ano e 8 semanas (≈ 1 ano e 2 meses)
    A: 12000,  // 120 semanas ≈ 2 anos e 16 semanas (≈ 2 anos e 4 meses)
    S: 20000,  // 200 semanas ≈ 3 anos e 44 semanas (≈ 3 anos e 10 meses)
};

export const RANKS = [
    ["E", XP_POR_RANK.E],
    ["D", XP_POR_RANK.D],
    ["C", XP_POR_RANK.C],
    ["B", XP_POR_RANK.B],
    ["A", XP_POR_RANK.A],
    ["S", XP_POR_RANK.S],
];
