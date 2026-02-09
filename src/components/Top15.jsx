import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { calcularProgressoXp } from "../utils/rankUtils";

// Medalhas PNG
import GoldMedal from "../assets/icons/1.png";
import SilverMedal from "../assets/icons/2.png";
import BronzeMedal from "../assets/icons/3.png";
import LOGOVIP from "../assets/img/vip.png"

const medals = {
    1: GoldMedal,
    2: SilverMedal,
    3: BronzeMedal,
};

const nameColors = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
};

export default function Top15({ onOpenProfile }) {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "usuarios"),
            orderBy("xp", "desc"),
            limit(15)
        );

        const unsub = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(docSnap => {
                const user = docSnap.data();
                return {
                    id: docSnap.id,
                    displayName: user.displayName || "Usuário",
                    photoURL:
                        user.photoURL ||
                        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg",
                    xp: user.xp || 0,
                    cargo: user.cargo?.toLowerCase() || "", // ✅ minúscula
                };
            });

            setUsuarios(data);
        });

        return () => unsub();
    }, []);

    return (
        <div className="top15-container">
            <h2>Top 15 Usuários</h2>

            <ol className="top15-list">
                {usuarios.map((user, index) => {
                    const rankPosicao = index + 1;
                    const { rankAtual, nivel } = calcularProgressoXp(user.xp);
                    const medalSrc = medals[rankPosicao];

                    const isVIP = user.cargo === "vip";

                    return (
                        <li
                            key={user.id}
                            className="top15-item"
                            onClick={() => onOpenProfile(user.id)}
                        >
                            {/* ESQUERDA */}
                            <div className="top15-left">
                                {rankPosicao > 3 && (
                                    <span className="top15-position">{rankPosicao}</span>
                                )}

                                {medalSrc && (
                                    <img
                                        src={medalSrc}
                                        alt={`Medalha ${rankPosicao}`}
                                        className="medal"
                                    />
                                )}

                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className={isVIP ? "avatarvip" : "avatar"} 
                                />

                                <span
                                    className="name"
                                    style={{
                                        color: nameColors[rankPosicao] || "#22c55e",
                                        fontWeight: rankPosicao <= 3 ? "bold" : "normal",
                                    }}
                                >
                                    {isVIP ? (
                                        <>
                                            <div className="usernamevip">
                                                {user.displayName} <img src={LOGOVIP} alt="logovip" className="Logovip" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {user.displayName}
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* DIREITA */}
                            <div className="top15-right">
                                <div className="rank-info">
                                    <strong className={`rank-${rankAtual}`}>
                                        Rank {rankAtual}
                                    </strong>
                                    <span>•</span>
                                    <strong className={`rank-${rankAtual}`}>
                                        Nível {nivel}
                                    </strong>
                                </div>

                                <span className="xp">{user.xp} XP</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}