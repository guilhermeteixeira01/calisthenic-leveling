import { useState } from "react";

export default function TaskForm({ addTask, diasSemana }) {
    const [exercise, setExercise] = useState("");
    const [series, setSeries] = useState("");
    const [reps, setReps] = useState("");
    const [day, setDay] = useState("");

    const [customSeries, setCustomSeries] = useState("");
    const [customReps, setCustomReps] = useState("");

    const exercises = [
        "Pull-ups",
        "Supinated Pull-ups",
        "Australian Pull-ups",
        "Australian Chin-ups",
        "Archer Pull-ups",
        "One-arm Pull-ups",
        "Standard Push-ups",
        "Diamond Push-ups",
        "Wide Push-ups",
        "Clapping Push-ups",
        "One-arm Push-ups",
        "Handstand Push-ups",
        "Dips",
        "Bench Dips",
        "Plank",
        "Side Plank",
        "Hollow Body",
        "L-sit",
        "V-sit",
        "Leg Raises",
        "Hanging Knee Raises",
        "Dragon Flags",
        "Skin the Cat",
        "Squats",
        "Jump Squats",
        "Lunges",
        "Pistol Squats",
        "Calf Raises",
        "Burpees",
        "Muscle-ups",
        "Human Flag",
        "Plank",
        "Tuck Plank",
        "Handstand",

        /* BACK LEVER */
        "Back lever",
        "Tuck back lever negativo",
        "Advanced back lever negativo",
        "Straddle back lever negativo",
        "Half back lever negativo",
        "Back lever negativo",
        "Tuck back lever",
        "Advanced back lever",
        "Straddle back lever",
        "Half back lever",
        "Tuck back lever press",
        "Advanced back lever press",
        "Straddle back lever press",
        "Back lever press",

        /* FRONT LEVER */
        "Front lever",
        "Tuck front lever negativo",
        "Advanced front lever negativo",
        "Straddle front lever negativo",
        "Half front lever negativo",
        "Front lever negativo",
        "Tuck front lever",
        "Advanced front lever",
        "Straddle front lever",
        "Half front lever",
        "Tuck front lever press",
        "Advanced front lever press",
        "Straddle front lever press",
        "Half front lever press",
        "Front lever press"
    ];

    const seriesOptions = [
        "1x10", "1x12", "1x15",
        "3x10", "3x12", "3x15",
        "5x10", "5x12", "5x15"
    ];

    const repsOptions = [
        "30 seg", "45 seg", "60 seg",
        "90 seg", "1 min", "2 min",
        "3 min", "5 min", "10 min"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        const finalSeries = series === "custom" ? customSeries : series;
        const finalReps = reps === "custom" ? customReps : reps;

        if (!exercise || !finalSeries || !finalReps || !day) return;

        addTask(day, {
            name: exercise,
            series: finalSeries,
            reps: finalReps,
            done: false,
            createdAt: Date.now()
        });

        setExercise("");
        setSeries("");
        setReps("");
        setCustomSeries("");
        setCustomReps("");
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

            {/* SÉRIES */}
            <select value={series} onChange={e => setSeries(e.target.value)} required>
                <option value="">Selecione as séries</option>
                {seriesOptions.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                ))}
                <option value="custom">Outro (personalizado)</option>
            </select>

            {series === "custom" && (
                <input
                    type="text"
                    placeholder="Ex: 4x8 + drop set"
                    value={customSeries}
                    onChange={e => setCustomSeries(e.target.value)}
                    required
                />
            )}

            {/* REPETIÇÕES / TEMPO */}
            <select value={reps} onChange={e => setReps(e.target.value)} required>
                <option value="">Selecione repetições / tempo</option>
                {repsOptions.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                ))}
                <option value="custom">Outro (personalizado)</option>
            </select>

            {reps === "custom" && (
                <input
                    type="text"
                    placeholder="Ex: até falha / 12-10-8"
                    value={customReps}
                    onChange={e => setCustomReps(e.target.value)}
                    required
                />
            )}

            <button type="submit">Adicionar Exercício</button>
        </form>
    );
}