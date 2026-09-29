import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// SVGs
import { ReactComponent as ForcaIcon } from "../assets/icons/forca.svg";
import { ReactComponent as FocoIcon } from "../assets/icons/foco.svg";
import { ReactComponent as VitalidadeIcon } from "../assets/icons/vitalidade.svg";
import { ReactComponent as CarismaIcon } from "../assets/icons/carisma.svg";
import { ReactComponent as SabedoriaIcon } from "../assets/icons/sabedoria.svg";

// LOGO VIP
import LOGOVIP from "../assets/img/vip.png";

// 🔥 FUNÇÃO UNIFICADA
import { calcularProgressoXp } from "../utils/rankUtils";
import { DEFAULT_AVATAR, handleAvatarError } from "../utils/avatar";

import { LEVELMAX } from "../constants/xpPorRank";
import { IconClose } from "./Icons";

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

    const isVIP = user.cargo === "vip";

    const photoURL =
        user.photoURL ||
        DEFAULT_AVATAR;

    const { rankAtual, nivel, xpAtual, xpMax, progresso } = calcularProgressoXp(user.xp || 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="sys-panel modal" onClick={e => e.stopPropagation()}>
                <div className="sys-head">
                    <span className="sys-mark">!</span>
                    <span className="sys-title">Perfil do Caçador</span>
                    <button className="icon-btn" onClick={onClose} aria-label="Fechar"><IconClose /></button>
                </div>

                <div className="sys-body">
                    <div className="profile-top">
                        <div className={`avatar lg ${isVIP ? "vip" : ""}`}>
                            <img src={photoURL} alt={user.displayName} loading="lazy" onError={handleAvatarError} />
                            {isVIP && <img src={LOGOVIP} alt="VIP" className="vip-badge" loading="lazy" />}
                        </div>

                        <h2 className={`identity-name ${isVIP ? "name-vip" : ""}`}>{user.displayName}</h2>

                        <div className="profile-rank">
                            <span className={`rank-badge rank-${rankAtual}`}>{rankAtual}</span>
                            <span className={`rank-text rank-${rankAtual}`}>Rank {rankAtual} · Nível {nivel}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 18 }}>
                        <div className="xp-row">
                            <span className="lvl">Experiência</span>
                            <span className="xp">{xpAtual} / {xpMax} XP</span>
                        </div>
                        <div className="meter">
                            <div className={`meter-fill rank-${rankAtual}`} style={{ width: `${progresso}%` }} />
                        </div>
                    </div>

                    <p className="eyebrow section-label">Atributos</p>

                    <div className="attr-mini">
                        {ATRIBUTOS.map(a => (
                            <div key={a.id} className="attr-mini-item">
                                <a.Icon />
                                <span>{a.nome}</span>
                                <b>{user.atributos?.[a.id] === LEVELMAX ? "MAX" : user.atributos?.[a.id] ?? 0}</b>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}