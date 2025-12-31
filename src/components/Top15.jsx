import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

// SVGs para medalhas
const medals = {
    1: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    2: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#C0C0C0">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    3: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#CD7F32">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
};

// Cores para os nomes dos 3 primeiros
const nameColors = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
};

// XP necessário por rank
const XP_POR_RANK = {
    E: 150,
    D: 300,
    C: 500,
    B: 800,
    A: 1200,
    S: 1800,
};

// Ordem dos ranks
const RANKS = [
    ["E", XP_POR_RANK.E],
    ["D", XP_POR_RANK.D],
    ["C", XP_POR_RANK.C],
    ["B", XP_POR_RANK.B],
    ["A", XP_POR_RANK.A],
    ["S", XP_POR_RANK.S],
];

export default function Top15() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "usuarios"),
            orderBy("xp", "desc"),
            limit(15)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((docSnap) => {
                const user = docSnap.data();
                return {
                    id: docSnap.id,
                    displayName: user.displayName || "Usuário",
                    photoURL:
                        user.photoURL ||
                        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg",
                    xp: user.xp || 0,
                };
            });

            setUsuarios(data);
        });

        return () => unsub();
    }, []);

    // Funções de Rank e Level
    function calcularRankPorXp(xpTotal) {
        let acumulado = 0;
        for (const [rank, xpRank] of RANKS) {
            acumulado += xpRank;
            if (xpTotal < acumulado) return rank;
        }
        return "S";
    }

    function calcularProgressoXp(xpTotal) {
        let acumulado = 0;
        let nivel = 1;
        let rankAtual = "E";

        for (const [rank, xpRank] of RANKS) {
            if (xpTotal < acumulado + xpRank) {
                rankAtual = rank;
                break;
            }
            acumulado += xpRank;
            nivel++;
        }

        if (rankAtual === "S") {
            const xpS = XP_POR_RANK.S;
            const xpExtra = xpTotal - acumulado;
            const niveisExtras = Math.floor(xpExtra / xpS);
            nivel += niveisExtras;
            acumulado += niveisExtras * xpS;
        }

        const xpMax = XP_POR_RANK[rankAtual];
        const xpAtual = xpTotal - acumulado;

        return { xpAtual, xpMax, nivel, rankAtual };
    }

    return (
        <div className="top15-container">
            <h2>Top 15 Usuários</h2>
            <ol className="top15-list">
                {usuarios.map((user, index) => {
                    const { xp, displayName, photoURL } = user;
                    const rank = index + 1;

                    const rankPorXp = calcularRankPorXp(xp);
                    const { nivel } = calcularProgressoXp(xp);

                    return (
                        <li
                            key={user.id}
                            className="top15-item"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                            }}
                        >
                            {/* Medalha ou número */}
                            <span className="rank" style={{ marginRight: "10px" }}>
                                {medals[rank] || rank}
                            </span>

                            {/* Avatar */}
                            <img
                                src={photoURL}
                                alt={displayName}
                                className="avatar"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginRight: "10px",
                                }}
                            />

                            {/* Nome e Rank/Level */}
                            <span
                                className="name"
                                style={{
                                    marginRight: "10px",
                                    fontWeight: rank <= 3 ? "bold" : "normal",
                                    color: nameColors[rank] || "#000",
                                }}
                            >
                                {displayName}
                            </span>
                            <span style={{ marginRight: "10px" }}>
                                Rank: {rankPorXp} | Level: {nivel}
                            </span>

                            {/* XP */}
                            <span className="xp">{xp} XP</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
