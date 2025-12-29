import { useEffect, useRef } from "react";

export default function ProgressBar({ tasks }) {
    const completed = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const playedRef = useRef(false);

    useEffect(() => {
        if (percent === 100 && !playedRef.current) {
            playedRef.current = true;
            const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/missioncomplete.mp3`);
            audio.play().catch(err => console.error("Erro ao tocar som:", err));
        } else if (percent < 100) {
            playedRef.current = false;
        }
    }, [percent]);

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
