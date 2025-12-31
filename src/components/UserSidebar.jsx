import React, { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/* =========================
   CONFIGURAÇÃO GLOBAL
========================= */

const XP_POR_RANK = {
    E: 150,
    D: 300,
    C: 500,
    B: 800,
    A: 1200,
    S: 1800,
};

const RANKS = Object.entries(XP_POR_RANK);

export default function UserSidebar({
    user,
    onLogout,
    onOpenTreino,
    onOpenMissoes,
    onOpenUpgrades,
    onOpenTop15,
}) {
    const [open, setOpen] = useState(false);
    const [userData, setUserData] = useState(null);

    /* ===== Controla scroll ===== */
    useEffect(() => {
        document.body.classList.toggle("menu-open", open);
    }, [open]);

    /* ===== Carrega / cria usuário ===== */
    useEffect(() => {
        if (!user?.uid) return;

        const userRef = doc(db, "usuarios", user.uid);

        const unsub = onSnapshot(userRef, async (snap) => {
            if (!snap.exists()) {
                await setDoc(userRef, {
                    xp: 0,
                    criadoEm: Date.now(),
                    photoURL: null,
                });
                return;
            }

            setUserData(snap.data());
        });

        return () => unsub();
    }, [user]);

    /* ===== Atualiza foto por URL ===== */
    const handleChangePhotoURL = async () => {
        const url = prompt("Cole a URL da imagem do seu avatar:");
        if (!url || !user?.uid) return;

        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                photoURL: url,
            });
            setUserData((prev) => ({ ...prev, photoURL: url }));
        } catch (err) {
            console.error("Erro ao atualizar a foto:", err);
            alert("Não foi possível atualizar a imagem");
        }
    };

    /* ===== XP TOTAL ===== */
    const xpTotal = userData?.xp ?? 0;
    const rank = calcularRankPorXp(xpTotal);
    const { xpAtual, xpMax, progresso, nivel } = calcularProgressoXp(xpTotal);

    return (
        <>
            {/* Botão mobile */}
            <button className="menu-toggle" onClick={() => setOpen(!open)}>
                ☰
            </button>

            {/* Sidebar */}
            <aside className={`user-sidebar ${open ? "active" : ""}`}>
                <div className="user-profile">
                    {/* Avatar clicável */}
                    <img
                        src={
                            userData?.photoURL ||
                            "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                        }
                        alt="Perfil"
                        className="avatar"
                        onClick={handleChangePhotoURL}
                        title="Clique para mudar a foto"
                        style={{
                            width: "180px",
                            height: "180px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            objectFit: "cover",
                        }}
                    />

                    <span className="user-name">{user.displayName || "Usuário"}</span>
                    <span className={`user-rank rank-${rank}`}>Rank {rank}</span>

                    {/* XP */}
                    <div className="xp-container">
                        <div className="xp-info">
                            <span className="nivel-text">Nível {nivel}</span>
                            <span className="xp-text">
                                {xpAtual} / {xpMax} XP
                            </span>
                        </div>

                        <div className="xp-bar">
                            <div className="xp-fill" style={{ width: `${progresso}%` }} />
                        </div>
                    </div>
                </div>

                {/* Botões */}
                <div className="sidebar-actions">
                    <button onClick={onOpenTreino}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M4 14v-4h2V7h2v10H6v-3H4zm14-7v3h2v4h-2v3h-2V7h2zm-6-2h-2v14h2V5z" />
                        </svg>
                        Treino Semanal
                    </button>

                    <button onClick={onOpenMissoes}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                        Missões
                    </button>

                    <button onClick={onOpenUpgrades}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M13 2L3 14h7v8l10-12h-7z" />
                        </svg>
                        Upgrades
                    </button>

                    <button onClick={onOpenTop15}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M17 3h4v2c0 3.3-2.7 6-6 6h-1a5 5 0 01-10 0H3V3h4V1h16v2zm-2 2H9v2a3 3 0 006 0V5zM6 21h12v-2H6v2z" />
                        </svg>
                        Top 15
                    </button>
                </div>

                <button className="logout-btn" onClick={onLogout}>
                    Sair
                </button>
            </aside>
        </>
    );
}

/* =========================
   FUNÇÕES AUXILIARES
========================= */

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
    const progresso = Math.min((xpAtual / xpMax) * 100, 100);

    return { xpAtual, xpMax, progresso, nivel };
}