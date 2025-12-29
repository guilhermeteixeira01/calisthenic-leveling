import { useState } from "react";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";

const diasSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
];

export default function WeeklyPlanner() {
    const [tasksPorDia, setTasksPorDia] = useState({
        Segunda: [],
        Terça: [],
        Quarta: [],
        Quinta: [],
        Sexta: [],
        Sábado: [],
        Domingo: [],
    });

    const addTask = (dia, task) => {
        setTasksPorDia(prev => ({
            ...prev,
            [dia]: [
                ...prev[dia],
                {
                    ...task,
                    id: Date.now(),
                }
            ]
        }));
    };

    const toggleDone = (dia, id) => {
        setTasksPorDia(prev => ({
            ...prev,
            [dia]: prev[dia].map(task =>
                task.id === id ? { ...task, done: !task.done } : task
            )
        }));
    };

    const removeTask = (dia, id) => {
        setTasksPorDia(prev => ({
            ...prev,
            [dia]: prev[dia].filter(task => task.id !== id)
        }));
    };

    return (
        <div>
            {/* formulário único */}
            <TaskForm addTask={addTask} diasSemana={diasSemana} />

            <div className="week-grid">
                {diasSemana.map(dia => (
                    <div key={dia} className="day-column">
                        <h2>{dia}</h2>

                        {tasksPorDia[dia].map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                toggleDone={() => toggleDone(dia, task.id)}
                                removeTask={() => removeTask(dia, task.id)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
