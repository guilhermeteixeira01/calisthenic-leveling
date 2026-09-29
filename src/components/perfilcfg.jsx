import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import { calcularProgressoXp, calcularRankPorXp } from "../utils/rankUtils";
import { THEMES_PUBLIC, THEMES_VIP, THEME_LABELS, resolveTheme } from "../utils/theme";
import { DEFAULT_AVATAR, handleAvatarError } from "../utils/avatar";
import LOGOVIP from "../assets/img/vip.png";


const THEME_SWATCH = {
    dark: "#3aa0ff",
    light: "#9b6bff",
    "vip-theme": "#f5c542",
    anime: "#5dffb0"
};

export default function PerfilCFG({ user }) {
    const [userData, setUserData] = useState(null);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);

    // Temas disponíveis
    const isVIP = userData?.cargo === "vip";

    const availableThemes = isVIP
        ? [...THEMES_PUBLIC, ...THEMES_VIP]
        : THEMES_PUBLIC;

    useEffect(() => {
        if (!user?.uid) return;

        const userRef = doc(db, "usuarios", user.uid);

        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setUserData(data);
                setNewName(data.displayName || user.displayName || "");
            }
        });

        return () => unsub();
    }, [user]);

    if (!userData) return <div className="loading">Carregando perfil...</div>;

    const xpTotal = userData?.xp ?? 0;
    const rank = calcularRankPorXp(xpTotal);
    const { xpAtual, xpMax, progresso, nivel } =
        calcularProgressoXp(xpTotal);
    const temaAtual = resolveTheme(userData);

    // 🔥 Atualizar nome
    const handleUpdateName = async () => {
        if (!newName.trim()) return alert("Nome inválido");

        try {
            setLoading(true);

            await updateDoc(doc(db, "usuarios", user.uid), {
                displayName: newName,
                displayNameLower: newName.toLowerCase()
            });

            alert("Nome atualizado com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar nome");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Atualizar foto
    const handleChangePhoto = async () => {
        const url = prompt("Cole a URL da imagem:");
        if (!url) return;

        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                photoURL: url,
            });
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar foto");
        }
    };

    // 🔥 Atualizar tema
    const handleChangeTheme = async (selectedTheme) => {
        if (!isVIP && THEMES_VIP.includes(selectedTheme)) {
            return alert("Somente VIPs podem selecionar esse tema!");
        }

        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                theme: selectedTheme
            });
        } catch (err) {
            console.error("Erro ao atualizar tema:", err);
        }
    };

    return (
        <div className="page settings">
            {/* Identidade */}
            <section className="sys-panel identity">
                <div className="sys-head">
                    <span className="sys-mark">!</span>
                    <span className="sys-title">Jogador</span>
                </div>
                <div className="sys-body">
                    <button className="avatar-edit" onClick={handleChangePhoto} aria-label="Alterar foto">
                        <div className={`avatar ${isVIP ? "vip" : ""}`}>
                            <img src={userData?.photoURL || DEFAULT_AVATAR} alt="Perfil" loading="lazy" onError={handleAvatarError} />
                            {isVIP && <img src={LOGOVIP} alt="VIP" className="vip-badge" loading="lazy" />}
                        </div>
                        <span className="avatar-edit-hint">Alterar</span>
                    </button>

                    <div className={`identity-name ${isVIP ? "name-vip" : ""}`}>
                        {userData.displayName || user.displayName}
                    </div>

                    <span className={`role-chip ${isVIP ? "vip" : ""}`}>{isVIP ? "VIP 👑" : "FREE"}</span>

                    <div className="xp-block">
                        <div className="xp-row">
                            <span className="lvl">
                                <span className={`rank-text rank-${rank}`}>Rank {rank}</span>
                                {" · "}
                                {xpTotal === 7550 ? "Nível Max" : `Nível ${nivel}`}
                            </span>
                            <span className="xp">{xpAtual} / {xpMax} XP</span>
                        </div>
                        <div className="meter">
                            <div className={`meter-fill rank-${rank}`} style={{ width: `${progresso}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            <div className="settings-stack">
                {/* Nome */}
                <section className="sys-panel">
                    <div className="sys-head">
                        <span className="sys-mark">!</span>
                        <span className="sys-title">Nome de exibição</span>
                    </div>
                    <div className="sys-body">
                        <div className="form-row">
                            <input
                                className="input"
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleUpdateName} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Tema */}
                <section className="sys-panel">
                    <div className="sys-head">
                        <span className="sys-mark">!</span>
                        <span className="sys-title">Tema do Sistema</span>
                        {!isVIP && <span className="sys-head-extra">+2 temas VIP</span>}
                    </div>
                    <div className="sys-body theme-grid">
                        {availableThemes.map((theme) => (
                            <button
                                key={theme}
                                className={`theme-option ${temaAtual === theme ? "active" : ""}`}
                                onClick={() => handleChangeTheme(theme)}
                                aria-pressed={temaAtual === theme}
                            >
                                <span
                                    className="theme-swatch"
                                    style={{ color: THEME_SWATCH[theme], background: THEME_SWATCH[theme] }}
                                />
                                {THEME_LABELS[theme]}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
