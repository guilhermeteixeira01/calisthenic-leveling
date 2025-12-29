import { useState } from "react";

export default function TaskForm({ addTask, diasSemana }) {
    const [exercise, setExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [day, setDay] = useState("");

    const exercises = [
        "Pull-ups (Barra Fixa)", "Chin-ups (Barra Fixa Supinada)", "Push-ups (Flexão)",
        "Diamond Push-ups", "Wide Push-ups", "Dips (Paralela)", "Bench Dips",
        "Squats", "Jump Squats", "Lunges", "Pistol Squats", "Calf Raises",
        "Leg Raises", "Hanging Knee Raises", "Plank", "Side Plank", "Mountain Climbers",
        "Burpees", "Handstand", "Handstand Push-ups", "Muscle-ups", "Front Lever",
        "Back Lever", "Skin the Cat", "Dragon Flags", "Human Flag", "Planche",
        "Tuck Planche", "L-sit", "V-sit", "Archer Pull-ups", "One Arm Push-ups", "Clap Push-ups"
    ];

    const seriesOptions = [
        "1x10", "2x12", "3x15", "4x12", "5x10", "3x8", "4x8", "5x5",
        "6x12", "7x10", "8x8", "10x5", "12x3", "15x2"
    ];

    const repsOptions = [
        "8 reps", "10 reps", "12 reps", "15 reps", "20 reps", "25 reps", "30 reps",
        "45 reps", "60 reps", "30 seg", "45 seg", "60 seg", "90 seg", "2 min", "3 min"
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
                <option value="">Selecione reps/tempo</option>
                {repsOptions.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                ))}
            </select>

            <button type="submit">Adicionar Exercício</button>
        </form>
    );
}