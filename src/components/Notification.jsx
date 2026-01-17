import { useEffect, useState } from "react";

const players = [
    "Gabriel", "Lucas", "Matheus", "Pedro", "Guilherme", "Rafael",
    "Henrique", "Felipe", "Bruno", "Ricardo", "Carlos", "Daniel",
    "Marcos", "André", "Eduardo", "Vitor", "Diego", "Thiago",
    "Leonardo", "Rodrigo", "Samuel", "Leandro", "Alexandre", "Caio",
    "Fernando", "Victor", "Paulo", "João", "Luiz", "Marcelo",
    "Augusto", "Fernando", "Maurício", "César", "Renato", "Roberto",
    "Antonio", "José", "Francisco", "Sérgio", "Marco", "Mário",
    "Alex", "Daniela", "Amanda", "Juliana", "Larissa", "Patrícia",
    "Beatriz", "Mariana", "Camila", "Bruna", "Fernanda", "Aline",
    "Bianca", "Carolina", "Tatiana", "Renata", "Natália", "Juliette",
    "Paula", "Sandra", "Vanessa", "Monique", "Priscila", "Karina",
    "Érica", "Simone", "Adriana", "Letícia", "Isabela", "Jéssica",
    "Marta", "Rosana", "Talita", "Viviane", "Yasmin", "Nicole",
    "Sofia", "Giovanna", "Luna", "Valentina", "Alice", "Helena",
    "Laura", "Júlia", "Ana", "Clara", "Maria", "Beatriz",
    "Gabriela", "Sarah", "Lívia", "Esther", "Cecília", "Emanuel",
    "Ramon", "Igor", "Murilo", "Thiago", "Nathan", "Enzo",
    "Arthur", "Miguel", "Davi", "Heitor", "Theo", "Gael",
    "Lorenzo", "Benjamin", "Samuel", "Matias", "Jonas"
];

const RankUp = ["S", "A", "B", "C", "D", "E"];
const rankColors = {
    "S": "#a855f7",
    "A": "#fb923c",
    "B": "#facc15",
    "C": "#34d399",
    "D": "#60a5fa",
    "E": "#9ca3af"
};

const CountXps = ["50", "150", "200", "500"];

// Templates de mensagens
const messages = [
    (player, rank) => `${player} Subiu para o Rank ${rank} 🚀`,
    (player, xp) => `${player} ganhou ${xp} XP 🔥`,
    (player) => `${player} completou uma quest 💎`,
    (player) => `${player} desbloqueou uma conquista 🚀`,
    (player) => `${player} ganhou 50 moedas 🧠`
];

export default function Notification() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const player = players[Math.floor(Math.random() * players.length)];
            const xp = CountXps[Math.floor(Math.random() * CountXps.length)];
            const rank = RankUp[Math.floor(Math.random() * RankUp.length)];

            const messageTemplate =
                messages[Math.floor(Math.random() * messages.length)];

            const message = messageTemplate(player, xp, rank);

            const id = Date.now();

            setNotifications(prev => [...prev, { id, message, rank }]);

            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 8000);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="notification-container">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className="notification"
                    style={{ borderLeft: `4px solid ${rankColors[n.rank] || "#fff"}` }}
                >
                    {n.message}
                </div>
            ))}
        </div>
    );
}
