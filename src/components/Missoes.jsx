import { useEffect, useState } from "react";
import { increment } from "firebase/firestore";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";

export default function Missoes({ tasks = [], user, onComplete }) {
    const [userReady, setUserReady] = useState(false);
    const [missaoDia, setMissaoDia] = useState(null);
    const [missaoSemana, setMissaoSemana] = useState(null);
    const [xpDia, setXpDia] = useState(0);
    const [xpSemana, setXpSemana] = useState(0);
    const [resgatadaDia, setResgatadaDia] = useState(false);
    const [resgatadaSemana, setResgatadaSemana] = useState(false);

    const MISSOES_DIA = [
        { texto: "Conclua pelo menos 1 exercício hoje", tipo: "tasks_dia", valor: 1 },
        { texto: "Conclua 3 exercícios hoje", tipo: "tasks_dia", valor: 3 },
        { texto: "Conclua todos os exercícios do dia", tipo: "dia_completo", valor: 0 }
    ];

    const MISSOES_SEMANA = [
        { texto: "Conclua 5 exercícios na semana", tipo: "tasks_semana", valor: 5 },
        { texto: "Conclua 10 exercícios na semana", tipo: "tasks_semana", valor: 10 },
        { texto: "Conclua 3 dias completos na semana", tipo: "dias_completos", valor: 3 },
        { texto: "Conclua todos os dias da semana", tipo: "semana_completa", valor: 7 }
    ];

    const XP_DIA_MIN = 50;
    const XP_DIA_MAX = 150;
    const XP_SEMANA_MIN = 200;
    const XP_SEMANA_MAX = 500;

    /* ================= DATA ================= */
    function diaHoje() {
        const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
        const jsDay = new Date().getDay();
        return dias[(jsDay + 6) % 7];
    }

    function tasksHoje() {
        return tasks.filter(t => t.day === diaHoje());
    }

    function progressoHoje() {
        return tasksHoje().filter(t => t.done).length;
    }

    function totalHoje() {
        return tasksHoje().length;
    }

    function progressoSemana() {
        return tasks.filter(t => t.done).length;
    }

    function diasCompletosSemana() {
        const dias = {};
        tasks.forEach(t => {
            if (!dias[t.day]) dias[t.day] = [];
            dias[t.day].push(t.done);
        });
        return Object.values(dias).filter(lista => lista.length && lista.every(Boolean)).length;
    }

    /* ================= INIT USER ================= */
    useEffect(() => {
        if (!user?.uid) return;

        const userRef = doc(db, "usuarios", user.uid);

        async function initUser() {
            try {
                const snap = await getDoc(userRef);

                if (!snap.exists()) {
                    await setDoc(userRef, {
                        xp: 0,
                        criadoEm: Date.now()
                    });
                }

                // 🔥 Mesmo se der erro de permissão, não trava a UI
                setUserReady(true);

            } catch (err) {
                console.error("Erro ao iniciar usuário:", err);
                setUserReady(true); // evita travamento infinito
            }
        }

        initUser();
    }, [user?.uid]);

    /* ================= MISSÕES ================= */
    useEffect(() => {
        if (!userReady || !user?.uid) return;

        const hoje = new Date();
        const dataHoje = hoje.toLocaleDateString("sv-SE");
        const semana = getSemanaISO(hoje);

        setMissaoDia(seededPick(MISSOES_DIA, dataHoje));
        setMissaoSemana(seededPick(MISSOES_SEMANA, semana));
        setXpDia(gerarXp(dataHoje, XP_DIA_MIN, XP_DIA_MAX));
        setXpSemana(gerarXp(semana, XP_SEMANA_MIN, XP_SEMANA_MAX));

        const refDia = doc(db, "missoes", user.uid, "resgates", `dia_${dataHoje}`);
        const refSemana = doc(db, "missoes", user.uid, "resgates", `semana_${semana}`);

        const unsubDia = onSnapshot(refDia, snap => setResgatadaDia(snap.exists()));
        const unsubSemana = onSnapshot(refSemana, snap => setResgatadaSemana(snap.exists()));

        return () => {
            unsubDia();
            unsubSemana();
        };
    }, [userReady, tasks, user?.uid]);

    /* ================= RESGATAR ================= */
    async function resgatar(tipo) {
        if (!user?.uid) return;

        const hoje = new Date();
        const dataHoje = hoje.toLocaleDateString("sv-SE");
        const semana = getSemanaISO(hoje);
        const userRef = doc(db, "usuarios", user.uid);

        if (tipo === "dia" && concluida(missaoDia) && !resgatadaDia) {
            await setDoc(doc(db, "missoes", user.uid, "resgates", `dia_${dataHoje}`),
                { tipo: "dia", xp: xpDia, criadoEm: serverTimestamp() });
            await updateDoc(userRef, { xp: increment(xpDia) });
            onComplete?.(xpDia);
        }

        if (tipo === "semana" && concluida(missaoSemana) && !resgatadaSemana) {
            await setDoc(doc(db, "missoes", user.uid, "resgates", `semana_${semana}`),
                { tipo: "semana", xp: xpSemana, criadoEm: serverTimestamp() });
            await updateDoc(userRef, { xp: increment(xpSemana) });
            onComplete?.(xpSemana);
        }
    }

    function concluida(m) {
        if (!m) return false;
        switch (m.tipo) {
            case "tasks_dia": return progressoHoje() >= m.valor;
            case "dia_completo": return totalHoje() > 0 && progressoHoje() === totalHoje();
            case "tasks_semana": return progressoSemana() >= m.valor;
            case "dias_completos": return diasCompletosSemana() >= m.valor;
            case "semana_completa": return diasCompletosSemana() >= 7;
            default: return false;
        }
    }

    function progresso(m) {
        if (!m) return { atual: 0, meta: 0 };
        switch (m.tipo) {
            case "tasks_dia": return { atual: progressoHoje(), meta: m.valor };
            case "dia_completo": return { atual: progressoHoje(), meta: totalHoje() };
            case "tasks_semana": return { atual: progressoSemana(), meta: m.valor };
            case "dias_completos": return { atual: diasCompletosSemana(), meta: m.valor };
            case "semana_completa": return { atual: diasCompletosSemana(), meta: 7 };
            default: return { atual: 0, meta: 0 };
        }
    }

    if (!userReady) {
        return <div className="loading">Carregando missões...</div>;
    }

    return (
        <div className="page missions">
            <Missao tipo="Missão Diária" missao={missaoDia} xp={xpDia}
                progresso={progresso(missaoDia)}
                concluida={concluida(missaoDia)} resgatada={resgatadaDia}
                onClick={() => resgatar("dia")} />

            <Missao tipo="Missão Semanal" missao={missaoSemana} xp={xpSemana}
                progresso={progresso(missaoSemana)}
                concluida={concluida(missaoSemana)} resgatada={resgatadaSemana}
                onClick={() => resgatar("semana")} />
        </div>
    );
}

/* ================= COMPONENTE MISSÃO ================= */
function Missao({ tipo, missao, xp, progresso, concluida, resgatada, onClick }) {
    const { atual, meta } = progresso;

    return (
        <section className="sys-panel mission">
            <div className="sys-head">
                <span className="sys-mark">!</span>
                <span className="sys-title">Quest Info</span>
            </div>

            <div className="sys-body">
                <span className="mission-kind">[ {tipo} ]</span>
                <p className="mission-goal">{missao?.texto ?? "Gerando missão..."}</p>

                <div className={`mission-goal-row ${concluida ? "ok" : ""}`}>
                    <span>Objetivo</span>
                    <span className="count">[{Math.min(atual, meta)}/{meta}]</span>
                </div>

                <div className="mission-reward">
                    <span className="eyebrow">Recompensa</span>
                    <b>+{xp} XP</b>
                </div>

                <button
                    className={`btn btn-block ${resgatada ? "claimed" : concluida ? "btn-primary" : ""}`}
                    disabled={!concluida || resgatada}
                    onClick={onClick}
                >
                    {resgatada ? "Recompensa resgatada" : concluida ? "Resgatar recompensa" : "Em progresso"}
                </button>

                <p className="mission-warning">
                    <em>Aviso:</em> missões não concluídas serão substituídas no próximo ciclo.
                </p>
            </div>
        </section>
    );
}

/* ================= UTILS ================= */
function gerarXp(seed, min, max) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return min + (Math.abs(hash) % (max - min + 1));
}

function seededPick(lista, seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return lista[Math.abs(hash) % lista.length];
}

function getSemanaISO(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
}
