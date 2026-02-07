export default function TaskItem({ task, toggleDone, removeTask }) {
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

    const hoje = new Date();
    const hojeData = hoje.toISOString().split("T")[0];

    // Ajusta índice para segunda = 0
    const hojeDiaIndex = (hoje.getDay() + 6) % 7;
    const hojeDia = diasSemana[hojeDiaIndex];

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

    const diaCorreto = diaTask === diaHoje;
    const jaConcluidaHoje = task.completedAt === hojeData || task.done === true;

    // Botão visualmente muda mas SEM desabilitar para garantir alertas
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

        // Passa a data para atualizar completedAt no toggleDone
        toggleDone(task.id, hojeData);
    }

    return (
        <div className={`card ${jaConcluidaHoje ? "done" : ""}`}>
            <div className="card-content">
                <h2>{task.name}</h2>
                <p>{task.series} séries • {task.reps}</p>
            </div>

            <div className="actions">
                <button
                    className={`complete ${!podeCompletarHoje ? "disabled" : ""}`}
                    onClick={handleToggle}
                // NÃO desabilitar para garantir alertas, mas pode estilizar
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