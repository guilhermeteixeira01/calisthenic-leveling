export default function TaskItem({ task, setTasks }) {
    const toggleDone = () => {
        setTasks(prev =>
            prev.map(t =>
                t.id === task.id ? { ...t, done: !t.done } : t
            )
        )
    }

    const removeTask = () => {
        setTasks(prev => prev.filter(t => t.id !== task.id))
    }

    return (
        <div className={`card ${task.done ? "done" : ""}`}>
            <h2>{task.name}</h2>
            <p>{task.series} séries • {task.reps}</p>

            <div className="actions">
                <button className="complete" onClick={toggleDone}>
                    {task.done ? "QUEST COMPLETE" : "COMPLETE QUEST"}
                </button>
                <button className="delete" onClick={removeTask}>✖</button>
            </div>
        </div>
    )
}
