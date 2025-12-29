export default function TaskItem({ task, toggleDone, removeTask }) {
    return (
        <div className={`card ${task.done ? "done" : ""}`}>
            <div className="card-content">
                <h2>{task.name}</h2>
                <p>{task.series} séries • {task.reps}</p>
            </div>

            <div className="actions">
                <button
                    className={`complete ${task.done ? "done-btn" : ""}`}
                    onClick={() => toggleDone(task.id)}
                >
                    {task.done ? "QUEST COMPLETE" : "COMPLETE QUEST"}
                </button>
                <button
                    className="delete"
                    onClick={() => removeTask(task.id)}
                >
                    ✖
                </button>
            </div>
        </div>
    );
}
