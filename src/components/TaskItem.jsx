import { IconCheck, IconTrash } from "./Icons";

export default function TaskItem({ task, toggleDone, removeTask }) {
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

    const hoje = new Date();
    const hojeData = hoje.toISOString().split("T")[0];

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

    const podeCompletarHoje = diaCorreto && !jaConcluidaHoje;

    function handleToggle() {
        if (!diaCorreto) {
            alert(`❌ Você só pode completar esta quest ${task.day.toUpperCase()}`);
            return;
        }

        if (jaConcluidaHoje) {
            alert("⚠️ Você já completou esta quest hoje!");
            return;
        }

        toggleDone(task.id, hojeData);
    }

    return (
        <div className={`quest ${jaConcluidaHoje ? "done" : ""}`}>
            <button
                className="quest-check"
                onClick={handleToggle}
                disabled={!jaConcluidaHoje && !podeCompletarHoje}
                title={jaConcluidaHoje
                    ? "Quest concluída"
                    : diaCorreto
                        ? "Concluir quest"
                        : `Disponível apenas na ${task.day}`}
                aria-label="Concluir quest"
            >
                <IconCheck />
            </button>

            <div className="quest-info">
                <div className="quest-name">{task.name}</div>
                <div className="quest-meta">
                    {task.series} séries<span className="sep">•</span>{task.reps}
                </div>
            </div>

            <button
                className="icon-btn danger"
                onClick={() => removeTask(task.id)}
                aria-label="Remover quest"
                title="Remover quest"
            >
                <IconTrash />
            </button>
        </div>
    );
}