import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, getDocs, writeBatch, collection } from "firebase/firestore";
import { db } from "../firebase";

// XP necessário por rank
import { SITENAME } from "../constants/xpPorRank";
import { calcularProgressoXp, calcularRankPorXp } from "../utils/rankUtils";

import LOGOVIP from "../assets/img/vip.png";

export default function UserSidebar({
    user,
    onLogout,
    menuOpen,
    setMenuOpen,
    onOpenTreino,
    onOpenMissoes,
    onOpenUpgrades,
    onOpenTop15,
    onOpenMenuCFG
}) {
    const [userData, setUserData] = useState(null);
    const [showNovidades, setShowNovidades] = useState(false);
    const [isVIP, setIsVIP] = useState(false);
    const [isResetting, setIsResetting] = useState(false); // ✅ status do reset

    const handleMenuClick = (action) => {
        setMenuOpen(false);
        action?.();
    };

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

    /* ===== Controla scroll ===== */
    useEffect(() => {
        document.body.classList.toggle("menu-open", menuOpen);
    }, [menuOpen]);

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
                    cargo: "free", // valor padrão
                    novidadesVistas: false, // adiciona campo
                });
                setShowNovidades(true); // abre modal na primeira vez
                return;
            }

            const data = snap.data();
            setUserData(data);
            setIsVIP(data.cargo === "vip");

            // Abre o modal se não tiver visto ainda
            if (!data.novidadesVistas) {
                setShowNovidades(true);
            }
        });

        return () => unsub();
    }, [user]);

    /* ===== Função para fechar novidades ===== */
    const closeNovidades = async () => {
        setShowNovidades(false);

        if (!user?.uid) return;

        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                novidadesVistas: true
            });
        } catch (err) {
            console.error("Erro ao atualizar novidades:", err);
        }
    };

    /* ===== Resetar novidades de todos (admin) ===== */
    const resetNovidadesParaTodos = async () => {
        if (!userData?.admin) return;

        if (!window.confirm("Tem certeza que deseja resetar as novidades para todos os usuários?")) return;

        try {
            setIsResetting(true);

            const usuariosRef = collection(db, "usuarios");
            const snapshot = await getDocs(usuariosRef); // ✅ CERTO

            if (snapshot.empty) {
                alert("Nenhum usuário encontrado!");
                return;
            }

            const batch = writeBatch(db);

            snapshot.forEach((userDoc) => {
                const userRef = doc(db, "usuarios", userDoc.id); // ✅ DocumentReference
                batch.update(userRef, { novidadesVistas: false });
            });

            await batch.commit();
            alert(`Novidades resetadas para ${snapshot.size} usuários!`);
        } catch (err) {
            console.error("Erro ao resetar novidades:", err);
            alert("Erro ao resetar novidades, veja o console.");
        } finally {
            setIsResetting(false);
        }
    };

    /* ===== XP TOTAL ===== */
    const xpTotal = userData?.xp ?? 0;
    const rank = calcularRankPorXp(xpTotal);
    const { xpAtual, xpMax, progresso, nivel } = calcularProgressoXp(xpTotal);

    return (
        <>
            {/* Botão mobile */}
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar */}
            <aside className={`user-sidebar ${menuOpen ? "active" : ""}`}>
                {/* UPDATE */}
                <button className="btn-novidades" onClick={() => setShowNovidades(true)}>
                    NEW
                </button>

                <div className="user-profile">
                    {/* Avatar clicável */}
                    {isVIP ? (
                        <>
                            <div className="avatar-wrapper">
                                <img
                                    src={
                                        userData?.photoURL ||
                                        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                                    }
                                    alt="Perfil"
                                    className="avatarusersidebarvip"
                                />
                                {/* Badge VIP */}
                                <img src={LOGOVIP} alt="VIP" className="vip-badge" />
                            </div>

                            <span className="user-name-vip">
                                {userData?.displayName || user.displayName || "Usuário"}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="avatar-wrapper">
                                <img
                                    src={
                                        userData?.photoURL ||
                                        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                                    }
                                    alt="Perfil"
                                    className="avatarusersidebar"
                                />
                            </div>

                            <span className="user-name">
                                {userData?.displayName || user.displayName || "Usuário"}
                            </span>
                        </>
                    )}


                    <span className={`user-rank rank-${rank}`}>Rank {rank}</span>

                    {/* XP */}
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

                {/* Botões */}
                <div className="sidebar-actions">
                    <button onClick={() => handleMenuClick(onOpenTreino)}>
                        <svg className={isVIP ? "vip-icon" : "icon"} viewBox="0 0 24 24">
                            <defs>
                                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f6d365" />
                                    <stop offset="40%" stopColor="#ffd700" />
                                    <stop offset="50%" stopColor="#fff8dc" />
                                    <stop offset="60%" stopColor="#ffd700" />
                                    <stop offset="100%" stopColor="#d4af37" />
                                </linearGradient>
                            </defs>
                            <path d="M2 9h2v6H2V9zm3-2h2v10H5V7zm4 3h6v4H9v-4zm8-3h2v10h-2V7zm3 2h2v6h-2V9z" />
                        </svg>

                        Treino Semanal
                    </button>

                    <button onClick={() => handleMenuClick(onOpenMissoes)}>
                        <svg className={isVIP ? "vip-icon" : "icon"} viewBox="0 0 24 24">
                            <path d="M12 2L15 8L22 9L17 14L18 22L12 18L6 22L7 14L2 9L9 8L12 2Z" />
                        </svg>
                        Missões
                    </button>

                    <button onClick={() => handleMenuClick(onOpenUpgrades)}>
                        <svg className={isVIP ? "vip-icon" : "icon"} viewBox="0 0 24 24">
                            <path d="M13 2L3 14h6l-1 8 10-14h-6l1-6z" />
                        </svg>
                        Upgrades
                    </button>

                    <button onClick={() => handleMenuClick(onOpenTop15)}>
                        <svg className={isVIP ? "vip-icon" : "icon"} viewBox="0 0 24 24">
                            <path d="M2 7l5 4 5-6 5 6 5-4-2 13H4L2 7z" />
                        </svg>
                        Top 15
                    </button>

                    <button onClick={() => handleMenuClick(onOpenMenuCFG)}>
                        <svg className={isVIP ? "vip-icon" : "icon"} viewBox="0 0 24 24"> <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.028 7.028 0 00-1.63-.94l-.36-2.54A.5.5 0 0013.9 2h-3.8a.5.5 0 00-.49.42l-.36 2.54c-.58.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.71 8.48a.5.5 0 00.12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32c.14.24.43.34.6.22l2.39-.96c.51.42 1.05.72 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.58-.22 1.12-.52 1.63-.94l2.39.96c.23.09.5 0 .6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z" /> </svg>
                        Configurar Perfil
                    </button>
                </div>

                <button className="logout-btn" onClick={onLogout}>
                    Sair
                </button>

                {/* Copyright */}
                <div
                    style={{
                        marginTop: "10px",
                        paddingBottom: "30px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#888",
                    }}
                >
                    © Desenvolvido por Guilherme Teixeira
                </div>
            </aside>
            {/* Novidades overlay */}
            {showNovidades && (
                <div className="novidades-overlay" onClick={closeNovidades}>
                    <div className="novidades-card" onClick={(e) => e.stopPropagation()}>
                        <button className="novidades-close" onClick={closeNovidades}>
                            ✕
                        </button>

                        <h2 style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", alignContent: "center", gap: 20 }}>
                            <img
                                src="https://media.tenor.com/sRL5jAfDjMcAAAAm/flame-lit.webp"
                                alt="fire"
                                style={{ width: 30 }}
                            />{" "}
                            Novidades
                            <img
                                src="https://media.tenor.com/sRL5jAfDjMcAAAAm/flame-lit.webp"
                                alt="fire"
                                style={{ width: 30 }}
                            />{" "}
                        </h2>

                        <p>
                            Bem-vindo à nova atualização do <strong>{SITENAME}</strong>!
                        </p>

                        <ul>
                            <li>✨ Novo sistema de <span style={{ color: "red", fontWeight: "bold" }}>XP</span> com progressão</li>
                            <li>🎯 Sistema de <span style={{ color: "red", fontWeight: "bold" }}>Missões Diárias</span><strong> já disponível</strong></li>
                            <li>🏆 Ranking <span style={{ color: "red", fontWeight: "bold" }}>Top 15</span> dos atletas</li>
                            <li>🛠️ Novo Sistema de <span style={{ color: "red", fontWeight: "bold" }}>Upgrades</span></li>
                            <li>👑 Novo designer e insignia <span style={{ color: "gold", fontWeight: "bold" }}>VIP</span></li>
                        </ul>

                        <p>
                            <strong>1.</strong> <span style={{ color: "red", fontWeight: "bold" }}>Mega Update</span>: Foi fixado alguns bugs de entrega de <span style={{ color: "gold", fontWeight: "bold" }}>XP</span> e adicionado o botão configurar perfil.
                        </p>


                        {userData?.admin && (
                            <button
                                className="btn-reset-novidades"
                                onClick={resetNovidadesParaTodos}
                            >
                                🔄 Resetar Novidades (Admin)
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}