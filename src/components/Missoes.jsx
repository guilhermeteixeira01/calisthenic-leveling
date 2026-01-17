import React, { useEffect, useState } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // ajuste o caminho se necessário

/* =========================
   CONFIGURAÇÃO
========================= */

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

// ⚠️ substitua pelo UID real quando usar Firebase Auth
const userId = "demo-user";

/* =========================
   COMPONENTE
========================= */

export default function Missoes({ tasks = [], onComplete }) {
    const [missaoDia, setMissaoDia] = useState(null);
    const [missaoSemana, setMissaoSemana] = useState(null);

    const [xpDia, setXpDia] = useState(0);
    const [xpSemana, setXpSemana] = useState(0);

    const [resgatadaDia, setResgatadaDia] = useState(false);
    const [resgatadaSemana, setResgatadaSemana] = useState(false);

    /* =========================
       DATA
    ========================= */

    function diaHoje() {
        const dias = [
            "Domingo",
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado"
        ];
        return dias[new Date().getDay()];
    }

    function tasksHoje() {
        return tasks.filter(t => t.day === diaHoje());
    }

    /* =========================
       CONTADORES
    ========================= */

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

        return Object.values(dias).filter(
            lista => lista.length > 0 && lista.every(Boolean)
        ).length;
    }

    /* =========================
       INIT (FIREBASE)
    ========================= */

    useEffect(() => {
        async function init() {
            const hoje = new Date();
            const dataHoje = hoje.toLocaleDateString("sv-SE");
            const semana = `${dataHoje.slice(0, 8)}W`;

            setMissaoDia(
                MISSOES_DIA[Math.floor(Math.random() * MISSOES_DIA.length)]
            );

            setMissaoSemana(
                MISSOES_SEMANA[Math.floor(Math.random() * MISSOES_SEMANA.length)]
            );

            setXpDia(gerarXp(dataHoje, XP_DIA_MIN, XP_DIA_MAX));
            setXpSemana(gerarXp(semana, XP_SEMANA_MIN, XP_SEMANA_MAX));

            const refDia = doc(db, "missoes", userId, "resgates", `dia_${dataHoje}`);
            const refSemana = doc(db, "missoes", userId, "resgates", `semana_${semana}`);

            setResgatadaDia((await getDoc(refDia)).exists());
            setResgatadaSemana((await getDoc(refSemana)).exists());
        }

        init();
    }, []);

    /* =========================
       RESET À MEIA NOITE
    ========================= */

    useEffect(() => {
        const agora = new Date();
        const amanha = new Date();
        amanha.setHours(24, 0, 0, 0);

        const tempo = amanha - agora;
        const timer = setTimeout(() => window.location.reload(), tempo);

        return () => clearTimeout(timer);
    }, []);

    /* =========================
       CONCLUSÃO
    ========================= */

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

    /* =========================
       RESGATAR (FIREBASE)
    ========================= */

    async function resgatar(tipo) {
        const hoje = new Date().toLocaleDateString("sv-SE");
        const semana = `${hoje.slice(0, 8)}W`;

        if (tipo === "dia" && concluida(missaoDia) && !resgatadaDia) {
            const ref = doc(db, "missoes", userId, "resgates", `dia_${hoje}`);

            await setDoc(ref, {
                tipo: "dia",
                xp: xpDia,
                criadoEm: serverTimestamp()
            });

            onComplete?.(xpDia);
            setResgatadaDia(true);
        }

        if (tipo === "semana" && concluida(missaoSemana) && !resgatadaSemana) {
            const ref = doc(db, "missoes", userId, "resgates", `semana_${semana}`);

            await setDoc(ref, {
                tipo: "semana",
                xp: xpSemana,
                criadoEm: serverTimestamp()
            });

            onComplete?.(xpSemana);
            setResgatadaSemana(true);
        }
    }

    /* =========================
       RENDER
    ========================= */

    return (
        <div className="missoes-container">

            <div className="missao-card">
                <h2>📅 Missão do Dia</h2>
                <p>{missaoDia?.texto}</p>
                <span>+{xpDia} XP</span>

                <button
                    className={`missao-btn ${resgatadaDia ? "resgatado" : ""}`}
                    disabled={!concluida(missaoDia) || resgatadaDia}
                    onClick={() => resgatar("dia")}
                >
                    {resgatadaDia
                        ? "Resgatado"
                        : concluida(missaoDia)
                            ? "Resgatar XP"
                            : "Em progresso"}
                </button>

                {totalHoje() === 0 && (
                    <small className="missao-aviso">
                        Adicione exercícios para completar esta missão
                    </small>
                )}
            </div>

            <div className="missao-card">
                <h2>📆 Missão da Semana</h2>
                <p>{missaoSemana?.texto}</p>
                <span>+{xpSemana} XP</span>

                <button
                    className={`missao-btn ${resgatadaSemana ? "resgatado" : ""}`}
                    disabled={!concluida(missaoSemana) || resgatadaSemana}
                    onClick={() => resgatar("semana")}
                >
                    {resgatadaSemana
                        ? "Resgatado"
                        : concluida(missaoSemana)
                            ? "Resgatar XP"
                            : "Em progresso"}
                </button>

                {tasks.length === 0 && (
                    <small className="missao-aviso">
                        Adicione exercícios na planilha para completar esta missão
                    </small>
                )}
            </div>

        </div>
    );
}

/* =========================
   XP UTIL
========================= */

function gerarXp(seed, min, max) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return min + (Math.abs(hash) % (max - min + 1));
}
