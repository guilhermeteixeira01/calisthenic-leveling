import { useEffect, useState } from "react";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Missoes({ tasks = [], user, onComplete }) {
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

    // ======== DATA ========
    function diaHoje() {
        const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        return dias[new Date().getDay()];
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
        return Object.values(dias).filter(lista => lista.length > 0 && lista.every(Boolean)).length;
    }

    // ======== INIT ========
    useEffect(() => {
        if (!user) return;

        async function init() {
            const hoje = new Date();
            const dataHoje = hoje.toLocaleDateString("sv-SE");
            const semana = getSemanaISO(hoje);

            // Missões aleatórias determinísticas
            setMissaoDia(seededPick(MISSOES_DIA, dataHoje));
            setMissaoSemana(seededPick(MISSOES_SEMANA, semana));

            // XP aleatório determinístico
            setXpDia(gerarXp(dataHoje, XP_DIA_MIN, XP_DIA_MAX));
            setXpSemana(gerarXp(semana, XP_SEMANA_MIN, XP_SEMANA_MAX));

            // Verifica se já resgatou
            const refDia = doc(db, "missoes", user.uid, "resgates", `dia_${dataHoje}`);
            const refSemana = doc(db, "missoes", user.uid, "resgates", `semana_${semana}`);

            setResgatadaDia((await getDoc(refDia)).exists());
            setResgatadaSemana((await getDoc(refSemana)).exists());
        }

        init();
    }, [tasks, user]);

    // ======== RESET DIÁRIO ========
    useEffect(() => {
        const agora = new Date();
        const amanha = new Date();
        amanha.setHours(24, 0, 0, 0);
        const timer = setTimeout(() => window.location.reload(), amanha - agora);
        return () => clearTimeout(timer);
    }, []);

    // ======== CONCLUSAO ========
    function concluida(m) {
        if (!m) return false;

        switch (m.tipo) {
            case "tasks_dia":
                return progressoHoje() >= m.valor;
            case "dia_completo":
                return totalHoje() > 0 && progressoHoje() === totalHoje();
            case "tasks_semana":
                return progressoSemana() >= m.valor;
            case "dias_completos":
                return diasCompletosSemana() >= m.valor;
            case "semana_completa":
                return diasCompletosSemana() >= 7;
            default:
                return false;
        }
    }

    // ======== RESGATAR ========
    async function resgatar(tipo) {
        if (!user) return;

        const hoje = new Date();
        const dataHoje = hoje.toLocaleDateString("sv-SE");
        const semana = getSemanaISO(hoje);

        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        const xpAtual = userSnap.data()?.xp || 0;

        if (tipo === "dia" && concluida(missaoDia) && !resgatadaDia) {
            await setDoc(
                doc(db, "missoes", user.uid, "resgates", `dia_${dataHoje}`),
                { tipo: "dia", xp: xpDia, criadoEm: serverTimestamp() }
            );
            await updateDoc(userRef, { xp: xpAtual + xpDia });
            setResgatadaDia(true);
            onComplete?.(xpDia);
        }

        if (tipo === "semana" && concluida(missaoSemana) && !resgatadaSemana) {
            await setDoc(
                doc(db, "missoes", user.uid, "resgates", `semana_${semana}`),
                { tipo: "semana", xp: xpSemana, criadoEm: serverTimestamp() }
            );
            await updateDoc(userRef, { xp: xpAtual + xpSemana });
            setResgatadaSemana(true);
            onComplete?.(xpSemana);
        }
    }

    // ======== RENDER ========
    return (
        <div className="missoes-container">
            <Missao
                titulo="📅 Missão do Dia"
                missao={missaoDia}
                xp={xpDia}
                concluida={concluida(missaoDia)}
                resgatada={resgatadaDia}
                onClick={() => resgatar("dia")}
            />

            <Missao
                titulo="📆 Missão da Semana"
                missao={missaoSemana}
                xp={xpSemana}
                concluida={concluida(missaoSemana)}
                resgatada={resgatadaSemana}
                onClick={() => resgatar("semana")}
            />
        </div>
    );
}

/* =========================
   COMPONENTES / UTILS
========================= */
function Missao({ titulo, missao, xp, concluida, resgatada, onClick }) {
    return (
        <div className="missao-card">
            <h2>{titulo}</h2>
            <p>{missao?.texto || "Carregando..."}</p>
            <span>+{xp} XP</span>

            <button
                className={`missao-btn ${resgatada ? "resgatado" : ""}`}
                disabled={!concluida || resgatada}
                onClick={onClick}
            >
                {resgatada ? "Resgatado" : concluida ? "Resgatar XP" : "Em progresso"}
            </button>
        </div>
    );
}

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
