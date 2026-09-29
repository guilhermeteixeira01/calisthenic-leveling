import React, { useEffect, useState } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// SVGs
import { ReactComponent as ForcaIcon } from "../assets/icons/forca.svg";
import { ReactComponent as FocoIcon } from "../assets/icons/foco.svg";
import { ReactComponent as VitalidadeIcon } from "../assets/icons/vitalidade.svg";
import { ReactComponent as CarismaIcon } from "../assets/icons/carisma.svg";
import { ReactComponent as SabedoriaIcon } from "../assets/icons/sabedoria.svg";

import { LEVELMAX, XP_POR_PONTO } from "../constants/xpPorRank";
import { IconPlus } from "./Icons";

const ATRIBUTOS = [
    { id: "forca", nome: "Força", Icon: ForcaIcon },
    { id: "foco", nome: "Foco", Icon: FocoIcon },
    { id: "vitalidade", nome: "Vitalidade", Icon: VitalidadeIcon },
    { id: "carisma", nome: "Carisma", Icon: CarismaIcon },
    { id: "sabedoria", nome: "Sabedoria", Icon: SabedoriaIcon }
];

export default function Upgrades({ user }) {
    const [xp, setXp] = useState(0);
    const [pontos, setPontos] = useState(0);
    const [atributos, setAtributos] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const ref = doc(db, "usuarios", user.uid);

        const unsub = onSnapshot(ref, async snap => {
            if (!snap.exists()) return;

            const data = snap.data();

            const xpTotal = data.xp || 0;
            const xpConvertido = data.xpConvertidoUpgrade || 0;
            const pontosBanco = data.pontosUpgrade || 0;
            const atributosAtual = data.atributos || {};

            const xpDisponivel = xpTotal - xpConvertido;
            const novosPontos = Math.floor(xpDisponivel / XP_POR_PONTO);

            // 🔁 converte XP → ponto
            if (novosPontos > 0) {
                await updateDoc(ref, {
                    pontosUpgrade: pontosBanco + novosPontos,
                    xpConvertidoUpgrade:
                        xpConvertido + novosPontos * XP_POR_PONTO
                });
                return;
            }

            // ✅ ATUALIZA O ESTADO SEMPRE
            setXp(xpTotal);
            setPontos(pontosBanco);
            setAtributos(atributosAtual);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);


    async function upar(id) {
        if (pontos <= 0) return;

        const ref = doc(db, "usuarios", user.uid);

        await updateDoc(ref, {
            [`atributos.${id}`]: (atributos[id] || 0) + 1,
            pontosUpgrade: pontos - 1
        });
    }

    if (loading) {
        return <div className="loading">Carregando status...</div>;
    }

    return (
        <div className="page">
            <div className="status-summary">
                <div className="stat points"><b>{pontos}</b><span>Pontos disponíveis</span></div>
                <div className="stat"><b>{xp}</b><span>XP total</span></div>
                <div className="stat"><b>{XP_POR_PONTO}</b><span>XP por ponto</span></div>
            </div>

            <section className="sys-panel">
                <div className="sys-head">
                    <span className="sys-mark">!</span>
                    <span className="sys-title">Status</span>
                    <span className="sys-head-extra">Máx. {LEVELMAX}</span>
                </div>

                <div className="attr-list">
                    {ATRIBUTOS.map(a => {
                        const nivel = atributos[a.id] ?? 0;
                        const max = nivel === LEVELMAX;
                        return (
                            <div key={a.id} className="attr">
                                <div className="attr-icon">
                                    <a.Icon />
                                </div>

                                <div>
                                    <div className="attr-head">
                                        <span className="attr-name">{a.nome}</span>
                                        <span className="attr-level">{max ? "MAX" : nivel}</span>
                                    </div>
                                    <div className="meter">
                                        <div className="meter-fill" style={{ width: `${Math.min(nivel / LEVELMAX, 1) * 100}%` }} />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn"
                                    disabled={pontos <= 0 || max}
                                    onClick={() => upar(a.id)}
                                >
                                    <IconPlus /> Upar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
