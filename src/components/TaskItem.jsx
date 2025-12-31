export default function TaskItem({ task, toggleDone, removeTask }) {

    // 📅 Dias da semana (índice real do JS)
    const diasSemana = [
        "domingo",
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado"
    ];

    // 🗓️ Data real de hoje (YYYY-MM-DD)
    const hoje = new Date();
    const hojeData = hoje.toISOString().split("T")[0];
    const hojeDia = diasSemana[hoje.getDay()];

    // 🧼 Normaliza texto (acentos, feira, case)
    function normalizarDia(texto = "") {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace("-feira", "")
            .trim();
    }

    const diaTask = normalizarDia(task.day);
    const diaHoje = normalizarDia(hojeDia);

    // ✅ Dia correto?
    const diaCorreto = diaTask === diaHoje;

    // ⛔ Conclusão (NOVO + LEGADO)
    const jaConcluidaHoje =
        task.completedAt === hojeData || task.done === true;

    // 🔓 Pode completar hoje?
    const podeCompletarHoje = diaCorreto && !jaConcluidaHoje;

    function handleToggle() {
        if (!diaCorreto) {
            alert(`❌ Você só pode completar esta quest na ${task.day.toUpperCase()}`);
            return;
        }

        if (jaConcluidaHoje) {
            alert("⚠️ Você já completou esta quest hoje!");
            return;
        }

        // 🔥 Marca como concluída HOJE
        toggleDone(task.id, hojeData);
    }

    return (
        <div className={`card ${jaConcluidaHoje ? "done" : ""}`}>
            <div className="card-content">
                <h2>{task.name}</h2>
                <p>
                    {task.series} séries • {task.reps}
                </p>
            </div>

            <div className="actions">
                <button
                    className="complete"
                    onClick={handleToggle}
                    disabled={!podeCompletarHoje}
                >
                    {jaConcluidaHoje
                        ? "QUEST COMPLETE"
                        : diaCorreto
                            ? "COMPLETE QUEST"
                            : "DIA INCORRETO"}
                </button>

                <button
                    className="delete"
                    onClick={() => removeTask(task.id)}
                    aria-label="Remover tarefa"
                >
                    ✖
                </button>
            </div>
        </div>
    );
}
