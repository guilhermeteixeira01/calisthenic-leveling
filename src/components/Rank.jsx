import { useEffect, useState } from "react";

export default function Rank({ tasks }) {
    const [rank, setRank] = useState("E");
    const completed = tasks.filter(t => t.done).length;

    const calculateRank = () => {
        if (completed >= 25) return "S";
        if (completed >= 20) return "A";
        if (completed >= 15) return "B";
        if (completed >= 10) return "C";
        if (completed >= 5) return "D";
        return "E";
    };

    useEffect(() => {
        const newRank = calculateRank();
        setRank(newRank);
    }, [completed]);

    return (
        <header className={`header rank-${rank}`}>
            <span className="rank-display">Hunter Rank: {rank}</span>
        </header>
    );
}
