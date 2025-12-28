export default function StartButton({ onClick }) {
    const handleClick = () => {

        const audio = new Audio("/sounds/Jinwoo vs Igris The Bloodred.mp3");
        audio.loop = true;         // tocar continuamente
        audio.volume = 0.3;
        audio.play();
        onClick();

        // Executa a função de start
        onClick();
    };

    return (
        <button className="start-button" onClick={handleClick}>
            START TRAINING
        </button>
    );
}
