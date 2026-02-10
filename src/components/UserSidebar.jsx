import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, getDoc, writeBatch, collection } from "firebase/firestore";
import { db } from "../firebase";

// XP necessário por rank
import { SITENAME, XP_POR_RANK } from "../constants/xpPorRank";
import { calcularProgressoXp, calcularRankPorXp } from "../utils/rankUtils";

import LOGOVIP from "../assets/img/vip.png";

const RANKS = Object.entries(XP_POR_RANK);

export default function UserSidebar({
    user,
    onLogout,
    menuOpen,
    setMenuOpen,
    onOpenTreino,
    onOpenMissoes,
    onOpenUpgrades,
    onOpenTop15
}) {
    const [userData, setUserData] = useState(null);
    const [showNovidades, setShowNovidades] = useState(false);
    const [isVIP, setIsVIP] = useState(false);
    const [isResetting, setIsResetting] = useState(false); // ✅ status do reset

    const handleMenuClick = (action) => {
        setMenuOpen(false);
        action?.();
    };

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
            const snapshot = await getDoc(usuariosRef);

            if (snapshot.empty) {
                alert("Nenhum usuário encontrado!");
                setIsResetting(false);
                return;
            }

            const batch = writeBatch(db);

            snapshot.forEach((userDoc) => {
                const userRef = doc(db, "usuarios", userDoc.id);
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

    /* ===== Atualiza foto por URL ===== */
    const handleChangePhotoURL = async () => {
        const url = prompt("Cole a URL da imagem do seu avatar:");
        if (!url || !user?.uid) return;

        try {
            await updateDoc(doc(db, "usuarios", user.uid), { photoURL: url });
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

    // ===== VIP CSS =====
    useEffect(() => {
        if (isVIP) {
            document.documentElement.style.setProperty('--purple', 'gold');
            document.documentElement.style.setProperty('--purple2', '#5a451d');
            document.documentElement.style.setProperty('--purple-glow', 'rgba(238, 207, 34, 0.45)');
            document.documentElement.style.setProperty('--back1', '#5a4c1d');
            document.documentElement.style.setProperty('--back2', '#2c2510');
            document.documentElement.style.setProperty('--back3', '#0d0d0d');
            document.documentElement.style.setProperty('--back4', '#050505');
            document.documentElement.style.setProperty('--backbox', 'rgba(255, 193, 60, 0.15)');
        } else {
            document.documentElement.style.setProperty('--purple', '#7f5af0');
            document.documentElement.style.setProperty('--purple2', '#3b1d5a');
            document.documentElement.style.setProperty('--purple-glow', 'rgba(122, 34, 238, 0.45)');
            document.documentElement.style.setProperty('--back1', '#3b1d5a');
            document.documentElement.style.setProperty('--back2', '#1c102c');
            document.documentElement.style.setProperty('--back3', '#0d0d0d');
            document.documentElement.style.setProperty('--back4', '#050505');
            document.documentElement.style.setProperty('--backbox', 'rgba(120, 60, 255, 0.15)');
        }
    }, [isVIP]);

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
                            <div
                                className="avatar-wrapper"
                                onClick={handleChangePhotoURL}
                                title="Clique para mudar a foto"
                            >
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

                                {/* Badge VIP */}
                                <img src={LOGOVIP} alt="VIP" className="vip-badge" />
                            </div>

                            <span className="user-name-vip">{user.displayName || "Usuário"}</span>
                        </>
                    ) : (
                        <>
                            <div
                                className="avatar-wrapper"
                                onClick={handleChangePhotoURL}
                                title="Clique para mudar a foto"
                            >
                                <div className="avatar-hover-layer">
                                    <img
                                        src={
                                            userData?.photoURL ||
                                            "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                                        }
                                        alt="Perfil"
                                        className="avatarusersidebar"
                                    />
                                </div>
                            </div>

                            <span className="user-name">{user.displayName || "Usuário"}</span>
                        </>
                    )}


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
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M4 14v-4h2V7h2v10H6v-3H4zm14-7v3h2v4h-2v3h-2V7h2zm-6-2h-2v14h2V5z" />
                        </svg>
                        Treino Semanal
                    </button>

                    <button onClick={() => handleMenuClick(onOpenMissoes)}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                        Missões
                    </button>

                    <button onClick={() => handleMenuClick(onOpenUpgrades)}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M13 2L3 14h7v8l10-12h-7z" />
                        </svg>
                        Upgrades
                    </button>

                    <button onClick={() => handleMenuClick(onOpenTop15)}>
                        <svg className="icon" viewBox="0 0 24 24">
                            <path d="M17 3h4v2c0 3.3-2.7 6-6 6h-1a5 5 0 01-10 0H3V3h4V1h16v2zm-2 2H9v2a3 3 0 006 0V5zM6 21h12v-2H6v2z" />
                        </svg>
                        Top 15
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
                                <strong>1.</strong> <span style={{ color: "red", fontWeight: "bold" }}>Mega Update</span>: todo o visual do Aplicatvo foi reformulado para ficar
                                ainda mais fiel ao tema esportivo e gamer.
                            </p>

                            <p>
                                <strong>2.</strong> O sistema de <span style={{ color: "red", fontWeight: "bold" }}>Missões Diárias</span> já está ativo!
                                Complete desafios, evolua e ganhe XP extra todos os dias.
                            </p>

                            <p>
                                <strong>3.</strong> O novo <span style={{ color: "red", fontWeight: "bold" }}>Sistema de Upgrades</span> permite
                                aprimorar atributos, desbloquear vantagens e evoluir ainda mais seu status
                                dentro da plataforma.
                            </p>

                            {userData?.admin && (
                                <button
                                    className="btn-reset-novidades"
                                    onClick={resetNovidadesParaTodos}
                                    style={{
                                        backgroundColor: "red",
                                        color: "#fff",
                                        marginTop: "10px",
                                        padding: "5px 10px",
                                        border: "2px solid rgba(255, 255, 255, 0.6)",
                                        borderRadius: 20,
                                        cursor: "pointer"
                                    }}
                                >
                                    🔄 Resetar Novidades (Admin)
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}