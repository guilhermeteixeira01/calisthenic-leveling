import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import { calcularProgressoXp, calcularRankPorXp } from "../utils/rankUtils";
import LOGOVIP from "../assets/img/vip.png";

export default function PerfilCFG({ user }) {
    const [userData, setUserData] = useState(null);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);

    // Temas disponíveis
    const isVIP = userData?.cargo === "vip";
    const THEMES_PUBLIC = ["dark", "light"];
    const THEMES_VIP = ["vip-theme"];

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

    // ===== CSS THEMES =====
    useEffect(() => {
        if (!userData) return;

        const theme = isVIP ? userData.theme || "vip-theme" : userData.theme || "dark";

        switch (theme) {
            case "light":
                document.documentElement.style.setProperty('--purple', '#fafafa');
                document.documentElement.style.setProperty('--purple2', '#5d5663');
                document.documentElement.style.setProperty('--purple-glow', 'rgba(223, 215, 235, 0.45)');
                document.documentElement.style.setProperty('--back1', '#58505f');
                document.documentElement.style.setProperty('--back2', '#302d33');
                document.documentElement.style.setProperty('--back3', '#0d0d0d');
                document.documentElement.style.setProperty('--back4', '#050505');
                document.documentElement.style.setProperty('--backbox', 'rgba(231, 224, 248, 0.15)');
                break;
            case "vip-theme":
                document.documentElement.style.setProperty('--purple', 'gold');
                document.documentElement.style.setProperty('--purple2', '#5a451d');
                document.documentElement.style.setProperty('--purple-glow', 'rgba(238, 207, 34, 0.45)');
                document.documentElement.style.setProperty('--back1', '#5a4c1d');
                document.documentElement.style.setProperty('--back2', '#2c2510');
                document.documentElement.style.setProperty('--back3', '#0d0d0d');
                document.documentElement.style.setProperty('--back4', '#050505');
                document.documentElement.style.setProperty('--backbox', 'rgba(255, 193, 60, 0.15)');
                break;
            default: // dark
                document.documentElement.style.setProperty('--purple', '#7f5af0');
                document.documentElement.style.setProperty('--purple2', '#3b1d5a');
                document.documentElement.style.setProperty('--purple-glow', 'rgba(122, 34, 238, 0.45)');
                document.documentElement.style.setProperty('--back1', '#3b1d5a');
                document.documentElement.style.setProperty('--back2', '#1c102c');
                document.documentElement.style.setProperty('--back3', '#0d0d0d');
                document.documentElement.style.setProperty('--back4', '#050505');
                document.documentElement.style.setProperty('--backbox', 'rgba(120, 60, 255, 0.15)');
                break;
        }
    }, [userData, isVIP]);

    if (!userData) return <h2>Carregando...</h2>;

    const xpTotal = userData?.xp ?? 0;
    const rank = calcularRankPorXp(xpTotal);
    const { xpAtual, xpMax, progresso, nivel } =
        calcularProgressoXp(xpTotal);

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

    return (
        <div className="perfil-container">
            <h1>Configuração de Perfil</h1>

            {/* Avatar */}
            <div className="perfil-avatar-section">
                <div className="avatar-wrapper" onClick={handleChangePhoto}>
                    <div className="avatar-hover-layer">
                        <img
                            src={
                                userData?.photoURL ||
                                "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                            }
                            alt="Perfil"
                            className="avatarusersidebarvip"
                        />
                    </div>
                    {isVIP && (
                        <img src={LOGOVIP} alt="VIP" className="vip-badge" />
                    )}
                </div>

                <p className="cargo-text">
                    Cargo:{" "}
                    <strong style={{ color: isVIP ? "gold" : "#aaa" }}>
                        {isVIP ? "VIP 👑" : "FREE"}
                    </strong>
                </p>
            </div>

            {/* Nome */}
            <div className="perfil-section">
                <label>Nome de exibição</label>
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={handleUpdateName} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Nome"}
                </button>
            </div>

            {/* Tema */}
            <div className="perfil-section">
                <label>Escolher Tema</label>
                <div className="select-wrapper">
                    <select
                        className={isVIP ? "vip" : ""}
                        value={isVIP ? userData.theme || "vip-theme" : userData.theme || "dark"}
                        onChange={async (e) => {
                            const selectedTheme = e.target.value;

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
                        }}
                    >
                        {availableThemes.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme.replace("-", " ").toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <span className="select-arrow">▼</span>
                </div>
            </div>

            {/* XP e Rank */}
            <div className="perfil-section">
                <h3>Seu Progresso</h3>
                <div className="xp-container">
                    <div className="xp-info">
                        {xpTotal === 7550
                            ? <span className="nivel-text">Nível Max</span>
                            : <span className="nivel-text">Nível {nivel}</span>
                        }
                        <span className="xp-text">
                            {xpAtual} / {xpMax} XP
                        </span>
                    </div>

                    <div className="xp-bar">
                        <div
                            className={`xp-fill rank-${rank}`}
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}