export default function ProgressBar({ tasks }) {
    const completed = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="progress">
            <span className="progress-text">Hunter's Day progress: {percent}%</span>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
