import React, { useEffect, useState } from "react";

/* =========================
   CONFIGURAÇÃO DE MISSÕES
========================= */

const MISSOES_SEMANA = [
    { texto: "Conclua pelo menos 1 exercício hoje", tipo: "tasks_dia", valor: 1 },
    { texto: "Conclua 3 exercícios hoje", tipo: "tasks_dia", valor: 3 },
    { texto: "Conclua todos os exercícios do dia", tipo: "dia_completo", valor: 0 },
    { texto: "Conclua 5 exercícios na semana", tipo: "tasks_semana", valor: 5 },
    { texto: "Conclua 10 exercícios na semana", tipo: "tasks_semana", valor: 10 },
    { texto: "Conclua 3 dias completos na semana", tipo: "dias_completos", valor: 3 },
    { texto: "Conclua todos os dias da semana", tipo: "semana_completa", valor: 0 }
];

const XP_MIN = 50;
const XP_MAX = 250;

/* =========================
   COMPONENTE
========================= */

export default function Missoes({ tasks = [], onComplete }) {
    const [missao, setMissao] = useState(null);
    const [xpMissao, setXpMissao] = useState(0);
    const [idMissao, setIdMissao] = useState("");
    const [resgatada, setResgatada] = useState(false);

    /* ===== missão do dia ===== */
    useEffect(() => {
        const hoje = new Date();

        // Segunda = 0
        const diaSemana = (hoje.getDay() + 6) % 7;

        // DATA LOCAL (ANTI BUG DE FUSO)
        const dataHoje = hoje.toLocaleDateString("sv-SE"); // YYYY-MM-DD
        const missaoId = `missao-${dataHoje}`;

        setMissao(MISSOES_SEMANA[diaSemana]);
        setXpMissao(gerarXpPorDia(dataHoje));
        setIdMissao(missaoId);

        setResgatada(localStorage.getItem(missaoId) === "true");
    }, []);

    /* ===== RESET AUTOMÁTICO À MEIA-NOITE ===== */
    useEffect(() => {
        const agora = new Date();
        const amanha = new Date();
        amanha.setHours(24, 0, 0, 0);

        const tempo = amanha - agora;

        const timer = setTimeout(() => {
            window.location.reload();
        }, tempo);

        return () => clearTimeout(timer);
    }, []);

    /* ===== util ===== */
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

    function progressoHoje() {
        return tasksHoje().filter(t => t.done).length;
    }

    /* ===== REGRA REAL DE CONCLUSÃO ===== */
    function missaoConcluida() {
        if (!missao) return false;

        switch (missao.tipo) {
            case "tasks_dia":
                return progressoHoje() >= missao.valor;

            case "dia_completo": {
                const hojeTasks = tasksHoje();
                return (
                    hojeTasks.length > 0 &&
                    hojeTasks.every(t => t.done)
                );
            }

            case "tasks_semana":
                return tasks.filter(t => t.done).length >= missao.valor;

            case "dias_completos":
                return tasks.filter(t => t.done).length >= missao.valor;

            case "semana_completa":
                return tasks.filter(t => t.done).length >= 7;

            default:
                return false;
        }
    }

    function handleResgatar() {
        if (!missaoConcluida() || resgatada) return;
        if (typeof onComplete !== "function") return;

        onComplete(xpMissao, idMissao);

        localStorage.setItem(idMissao, "true");
        setResgatada(true);
    }

    if (!missao) return null;

    const concluida = missaoConcluida();

    return (
        <div className="missao-card">
            <h2>🎯 Missão do Dia</h2>

            <p className="missao-text">{missao.texto}</p>

            {missao.valor > 0 && (
                <p className="missao-progresso">
                    Progresso: {Math.min(progressoHoje(), missao.valor)} / {missao.valor}
                </p>
            )}

            <span className="missao-xp">+{xpMissao} XP</span>

            <button
                className="missao-btn"
                disabled={!concluida || resgatada}
                onClick={handleResgatar}
            >
                {resgatada
                    ? "XP Resgatado ✔"
                    : concluida
                        ? "Resgatar XP"
                        : "Em progresso"}
            </button>
        </div>
    );
}

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function gerarXpPorDia(seed) {
    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const random = Math.abs(hash) % (XP_MAX - XP_MIN + 1);
    return XP_MIN + random;
}
