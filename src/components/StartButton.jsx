export default function StartButton({ onClick }) {
    const handleClick = () => {
        // Cria o objeto de áudio usando PUBLIC_URL
        const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/Jinwoo vs Igris The Bloodred.mp3`);
        audio.loop = true;        // tocar continuamente
        audio.volume = 0.3;
        audio.play().catch((err) => {
            console.log("Erro ao reproduzir áudio:", err);
        });

        // Executa a função de start
        onClick();
    };

    return (
        <button className="start-button" onClick={handleClick}>
            START TRAINING
        </button>
    );
}
