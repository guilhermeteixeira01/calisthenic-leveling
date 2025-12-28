import TaskItem from "./TaskItem";

export default function TaskList({ tasks, setTasks }) {
    return (
        <div className="task-list">
            {tasks.length === 0 ? (
                <p>Nenhuma quest adicionada ainda...</p>
            ) : (
                tasks.map(task => (
                    <TaskItem key={task.id} task={task} setTasks={setTasks} />
                ))
            )}
        </div>
    );
}
