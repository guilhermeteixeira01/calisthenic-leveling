import { useState } from "react";

export default function TaskForm({ addTask, diasSemana }) {
    const [exercise, setExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [day, setDay] = useState("");

    const exercises = [
        // Pull / Barra
        "Barra Fixa (Pull-ups)",
        "Barra Fixa Supinada (Chin-ups)",
        "Barra Baixa (Australian Pull-ups)",
        "Barra Baixa Supinada (Australian Chin-ups)",
        "Pull-ups Arqueiro (Archer Pull-ups)",
        "Pull-ups com um braço (One Arm Pull-ups)",

        // Push / Flexão
        "Flexão Tradicional (Push-ups)",
        "Flexão Diamante (Diamond Push-ups)",
        "Flexão Larga (Wide Push-ups)",
        "Flexão com Palmas (Clap Push-ups)",
        "Flexão com um braço (One Arm Push-ups)",
        "Flexão de Handstand (Handstand Push-ups)",
        "Mergulho em paralelas (Dips)",
        "Mergulho no banco (Bench Dips)",

        // Core / Abdominais
        "Prancha (Plank)",
        "Prancha Lateral (Side Plank)",
        "Hollow Body (Canoa )",
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
        "Agachamento com Salto (Jump Squats)",
        "Avanço (Lunges)",
        "Agachamento Pistola (Pistol Squats)",
        "Elevação de Panturrilha (Calf Raises)",

        // Full body / Combos
        "Burpees",
        "Muscle-ups",
        "Bandeira Humana (Human Flag)",
        "Planche",
        "Planche Tuck (Tuck Planche)",
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