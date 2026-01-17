import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// SVGs
import { ReactComponent as ForcaIcon } from "../assets/icons/forca.svg";
import { ReactComponent as FocoIcon } from "../assets/icons/foco.svg";
import { ReactComponent as VitalidadeIcon } from "../assets/icons/vitalidade.svg";
import { ReactComponent as CarismaIcon } from "../assets/icons/carisma.svg";
import { ReactComponent as SabedoriaIcon } from "../assets/icons/sabedoria.svg";

// 🔥 FUNÇÃO UNIFICADA
import { calcularProgressoXp } from "../utils/rankUtils";


const ATRIBUTOS = [
    { id: "forca", nome: "Força", Icon: ForcaIcon },
    { id: "foco", nome: "Foco", Icon: FocoIcon },
    { id: "vitalidade", nome: "Vitalidade", Icon: VitalidadeIcon },
    { id: "carisma", nome: "Carisma", Icon: CarismaIcon },
    { id: "sabedoria", nome: "Sabedoria", Icon: SabedoriaIcon },
];

export default function UserProfileCard({ userId, onClose }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const ref = doc(db, "usuarios", userId);
        const unsub = onSnapshot(ref, snap => {
            if (snap.exists()) setUser(snap.data());
        });

        return () => unsub();
    }, [userId]);

    if (!user) return null;

    const photoURL =
        user.photoURL ||
        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg";

    const {
        rankAtual,
        nivel,
        xpAtual,
        xpMax,
        progresso
    } = calcularProgressoXp(user.xp || 0);

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-card" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                <img
                    src={photoURL}
                    alt={user.displayName}
                    className="profile-avatar"
                />

                <h2>{user.displayName}</h2>

                {/* 🔥 Rank / Nível com cores */}
                <div style={{ marginBottom: "12px" }}>
                    <div>
                        <strong className={`rank-${rankAtual}`}>Rank {rankAtual}</strong>
                    </div>
                    <div>
                        <strong className={`rank-${rankAtual}`}>Nível {nivel}</strong>
                    </div>
                </div>

                {/* 🔥 XP */}
                <div className="xp-container">
                    <div className="xp-info">
                        <span>{xpAtual} / {xpMax} XP</span>
                    </div>

                    <div className="xp-bar">
                        <div
                            className="xp-fill"
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                </div>

                <h3 style={{ marginTop: "16px" }}>⚡ Atributos</h3>

                <div className="profile-atributos">
                    {ATRIBUTOS.map(a => (
                        <div key={a.id} className="atributo">
                            <a.Icon />
                            <span>{a.nome}</span>
                            <b>{user.atributos?.[a.id] || 0}</b>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
