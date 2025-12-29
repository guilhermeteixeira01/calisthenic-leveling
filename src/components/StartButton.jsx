export default function StartButton({ onClick }) {
    const handleClick = () => {
        const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/Jinwoo vs Igris The Bloodred.mp3`);
        audio.loop = true;
        audio.volume = 0.05;

        // Tenta tocar o áudio
        audio.play().catch(err => console.log("Não foi possível tocar o som:", err));

        // Executa a função de start apenas uma vez
        onClick();
    };

    return (
        <button className="start-button" onClick={handleClick}>
            START TRAINING
        </button>
    );
}
