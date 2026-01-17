import React, { useEffect, useState } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// SVGs
import { ReactComponent as ForcaIcon } from "../assets/icons/forca.svg";
import { ReactComponent as FocoIcon } from "../assets/icons/foco.svg";
import { ReactComponent as VitalidadeIcon } from "../assets/icons/vitalidade.svg";
import { ReactComponent as CarismaIcon } from "../assets/icons/carisma.svg";
import { ReactComponent as SabedoriaIcon } from "../assets/icons/sabedoria.svg";

const XP_POR_PONTO = 800;

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

                // ⚠️ NÃO retorna — deixa o snapshot rodar novamente
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
        return <div style={{ color: "#aaa" }}>Carregando upgrades...</div>;
    }

    return (
        <div className="upgrades-container">
            <div className="upgrades-header">
                <h2>⚡ Atributos</h2>
                <span>
                    XP Total: <b>{xp}</b> • Pontos: <b>{pontos}</b>
                </span>
            </div>

            <div className="upgrades-grid">
                {ATRIBUTOS.map(a => (
                    <div key={a.id} className="upgrade-card">
                        <div className="upgrade-icon">
                            <a.Icon />
                        </div>

                        <h3>{a.nome}</h3>
                        <p>Nível {atributos[a.id] || 0}</p>

                        <button
                            type="button"
                            className="upgrade-btn"
                            disabled={pontos <= 0}
                            onClick={() => upar(a.id)}
                        >
                            + Upgrade
                        </button>


                    </div>
                ))}
            </div>
        </div>
    );
}
