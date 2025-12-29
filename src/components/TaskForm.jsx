import { useState } from "react";

export default function TaskForm({ addTask, diasSemana }) {
    const [exercise, setExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [day, setDay] = useState("");

    const exercises = [
        // Pull / Barra
        "Barra Fixa",
        "Barra Fixa Supinada",
        "Australian Pull-ups",
        "Australian Chin-ups",
        "Pull-ups Arqueiro",
        "Pull-ups com um braço",

        // Push / Flexão
        "Flexão Tradicional",
        "Flexão Diamante",
        "Flexão Larga",
        "Flexão com Palmas",
        "Flexão com um braço",
        "Flexão de Handstand",
        "Paralelas",
        "Paralelas no banco",

        // Core / Abdominais
        "Prancha (Plank)",
        "Prancha Lateral (Side Plank)",
        "Canoa (Hollow Body)",
        "L-sit",
        "V-sit",
        "Elevação de Pernas (Leg Raises)",
        "Elevação de Joelhos (Barra)",
        "Dragon Flags",
        "Front Lever",
        "Back Lever",
        "Skin the Cat",

        // Pernas
        "Agachamento (Squats)",
        "Agachamento com Salto",
        "Avanço (Lunges)",
        "Agachamento Pistola",
        "Elevação de Panturrilha",

        // Full body / Combos
        "Burpees",
        "Muscle-ups",
        "Bandeira Humana",
        "Prancha",
        "Prancha Tuck",
        "Handstand"
    ];

    const seriesOptions = [
        "1x10", "1x12", "1x15", "1x20",
        "2x10", "2x12", "2x15", "2x20",
        "3x10", "3x12", "3x15", "3x20",
        "4x10", "4x12", "4x15", "4x20",
        "5x10", "5x12", "5x15", "5x20"
    ];

    const repsOptions = [
        "30 seg", "45 seg", "60 seg",
        "90 seg", "1 min", "2 min",
        "3 min", "5 min", "10 min"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!exercise || !series || !reps || !day) return;

        // Aqui não adicionamos id, apenas os dados
        addTask(day, {
            name: exercise,
            series,
            reps,
            done: false,
            createdAt: Date.now()
        });

        // Resetar o formulário
        setExercise("");
        setSeries("");
        setReps("");
        setDay("");
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <select value={day} onChange={e => setDay(e.target.value)} required>
                <option value="">Dia da semana</option>
                {diasSemana.map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>

            <select value={exercise} onChange={e => setExercise(e.target.value)} required>
                <option value="">Selecione um exercício</option>
                {exercises.map((ex, i) => (
                    <option key={i} value={ex}>{ex}</option>
                ))}
            </select>

            <select value={series} onChange={e => setSeries(e.target.value)} required>
                <option value="">Selecione as séries</option>
                {seriesOptions.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                ))}
            </select>

            <select value={reps} onChange={e => setReps(e.target.value)} required>
                <option value="">Selecione Tempo de descanso</option>
                {repsOptions.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                ))}
            </select>

            <button type="submit">Adicionar Exercício</button>
        </form>
    );
}