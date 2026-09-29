import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, getDocs, writeBatch, collection } from "firebase/firestore";
import { db } from "../firebase";

// XP necessário por rank
import { SITENAME } from "../constants/xpPorRank";
import { calcularProgressoXp, calcularRankPorXp } from "../utils/rankUtils";
import { applyTheme, resolveTheme } from "../utils/theme";
import { DEFAULT_AVATAR, handleAvatarError } from "../utils/avatar";

import LOGOVIP from "../assets/img/vip.png";
import {
    IconTraining, IconQuest, IconStatus, IconCrown, IconSettings,
    IconLogout, IconMenu, IconClose, IconBell
} from "./Icons";


const NAV = [
    { id: "treino", label: "Treino Semanal", Icon: IconTraining },
    { id: "missoes", label: "Missões", Icon: IconQuest },
    { id: "upgrades", label: "Atributos", Icon: IconStatus },
    { id: "top15", label: "Top 15", Icon: IconCrown },
    { id: "PerfilCFG", label: "Configurar Perfil", Icon: IconSettings }
];

export default function UserSidebar({
    user,
    onLogout,
    menuOpen,
    setMenuOpen,
    telaAtiva,
    onNavigate
}) {
    const [userData, setUserData] = useState(null);
    const [showNovidades, setShowNovidades] = useState(false);
    const [isVIP, setIsVIP] = useState(false);
    const [isResetting, setIsResetting] = useState(false); // ✅ status do reset

    const handleMenuClick = (id) => {
        setMenuOpen(false);
        onNavigate(id);
    };

    useEffect(() => {
        if (!userData) return;
        applyTheme(resolveTheme(userData));
    }, [userData]);

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
    const nome = userData?.displayName || user.displayName || "Usuário";

    const brand = (
        <div className="brand">
            <div className="brand-mark"><span>CL</span></div>
            <div className="brand-name">
                {SITENAME.split(" ")[0]}
                <small>{SITENAME.split(" ").slice(1).join(" ")}</small>
            </div>
        </div>
    );

    return (
        <>
            {/* Barra mobile */}
            <div className="mobile-bar">
                {brand}
                <div className="mobile-right">
                    <span className={`rank-badge sm rank-${rank}`}>{rank}</span>
                    <button
                        className="icon-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {menuOpen ? <IconClose /> : <IconMenu />}
                    </button>
                </div>
            </div>

            <div className={`sidebar-backdrop ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
                {brand}

                <section className="sys-panel player-card">
                    <div className="sys-head">
                        <span className="sys-mark">!</span>
                        <span className="sys-title">Status</span>
                    </div>
                    <div className="sys-body">
                        <div className="player-id">
                            <div className={`avatar ${isVIP ? "vip" : ""}`}>
                                <img src={userData?.photoURL || DEFAULT_AVATAR} alt="Perfil" loading="lazy" onError={handleAvatarError} />
                                {isVIP && <img src={LOGOVIP} alt="VIP" className="vip-badge" loading="lazy" />}
                            </div>
                            <div className="player-meta">
                                <span className={`player-name ${isVIP ? "name-vip" : ""}`}>{nome}</span>
                                <span className="player-title">{isVIP ? "Monarca · VIP" : "Caçador"}</span>
                            </div>
                            <span className={`rank-badge rank-${rank}`}>{rank}</span>
                        </div>

                        <div>
                            <div className="xp-row">
                                <span className="lvl">{xpTotal === 7550 ? "Nível Max" : `Nível ${nivel}`}</span>
                                <span className="xp">{xpAtual} / {xpMax} XP</span>
                            </div>
                            <div className="meter">
                                <div className={`meter-fill rank-${rank}`} style={{ width: `${progresso}%` }} />
                            </div>
                        </div>
                    </div>
                </section>

                <nav className="nav">
                    <span className="eyebrow nav-label">Menu</span>
                    {NAV.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            className={`nav-item ${telaAtiva === id ? "active" : ""}`}
                            onClick={() => handleMenuClick(id)}
                        >
                            <Icon />
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="row">
                        <button className="btn btn-ghost btn-news" onClick={() => setShowNovidades(true)}>
                            <IconBell /> Novidades
                            {userData && !userData.novidadesVistas && <span className="dot" />}
                        </button>
                        <button className="btn btn-danger" onClick={onLogout}>
                            <IconLogout /> Sair
                        </button>
                    </div>
                    <p className="copyright">© Desenvolvido por Guilherme Teixeira</p>
                </div>
            </aside>

            {/* Novidades overlay */}
            {showNovidades && (
                <div className="modal-overlay" onClick={closeNovidades}>
                    <div className="sys-panel modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sys-head">
                            <span className="sys-mark">!</span>
                            <span className="sys-title">Notificação</span>
                            <button className="icon-btn" onClick={closeNovidades} aria-label="Fechar">
                                <IconClose />
                            </button>
                        </div>

                        <div className="sys-body">
                            <p className="news-note">
                                Bem-vindo à nova atualização do <em className="hl">{SITENAME}</em>!
                            </p>

                            <ul className="news-list">
                                <li>✨ Novo sistema de <em className="hl">XP</em> com progressão</li>
                                <li>🎯 Sistema de <em className="hl">Missões Diárias</em> já disponível</li>
                                <li>🏆 Ranking <em className="hl">Top 15</em> dos atletas</li>
                                <li>🛠️ Novo sistema de <em className="hl">Upgrades</em></li>
                                <li>⚔️ Novo design inspirado no <em className="hl">Sistema</em> de Solo Leveling</li>
                                <li>👑 Insígnia e tema <em className="hl-gold">VIP</em></li>
                            </ul>

                            <p className="news-note">
                                Foram corrigidos bugs na entrega de <em className="hl-gold">XP</em> e adicionada a tela de configurar perfil.
                            </p>

                            {userData?.admin && (
                                <button
                                    className="btn btn-ghost btn-block"
                                    style={{ marginTop: 18 }}
                                    onClick={resetNovidadesParaTodos}
                                    disabled={isResetting}
                                >
                                    {isResetting ? "Resetando..." : "Resetar Novidades (Admin)"}
                                </button>
                            )}

                            <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={closeNovidades}>
                                Aceitar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
