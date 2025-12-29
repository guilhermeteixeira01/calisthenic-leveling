import TaskItem from "./TaskItem";

export default function TaskList({ tasks, toggleDone, removeTask }) {
    return (
        <div className="task-list">
            {tasks.length === 0 ? (
                <p className="empty-message">Nenhuma quest adicionada ainda...</p>
            ) : (
                tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        toggleDone={toggleDone}
                        removeTask={removeTask}
                    />
                ))
            )}
        </div>
    );
}
