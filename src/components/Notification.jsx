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

const RankUp = ["S", "A", "B", "C", "D"];

const CountXps = ["50", "150", "200", "500"];

const skills = [
    { id: "forca", nome: "Força" },
    { id: "foco", nome: "Foco" },
    { id: "vitalidade", nome: "Vitalidade" },
    { id: "carisma", nome: "Carisma" },
    { id: "sabedoria", nome: "Sabedoria" }
];

const rareItems = [
    "Espada Ancestral",
    "Amuleto do Dragão",
    "Anel da Eternidade",
    "Cajado Arcano",
    "Armadura Celestial",
    "Orbe do Conhecimento"
];


// Templates de mensagens
const messages = [
    // Rank (JSX)
    (player, rank) => (
        <>
            {player} subiu para o Rank{" "}
            <span className={`rank-${rank}`}>{rank}</span> 🚀
        </>
    ),

    // XP
    (player, _, xp) =>
        `${player} ganhou ${xp} XP 🔥`,

    // Quest
    (player) =>
        `${player} completou uma quest 💎`,

    // Item raro
    (player, _, __, ___, item) =>
        `${player} encontrou um item raro: ${item} ✨`,

    // Nível
    (player, _, __, level) =>
        `${player} subiu para o nível ${level} 📈`,

    // Skills
    (player, _, __, ___, ____, skill) =>
        `${player} aumentou (${skill}) 🔥`,

    (player, _, __, ___, ____, skill) =>
        `${player} evoluiu sua habilidade (${skill}) ⚡`
];


export default function Notification() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const player = players[Math.floor(Math.random() * players.length)];
            const xp = CountXps[Math.floor(Math.random() * CountXps.length)];
            const rank = RankUp[Math.floor(Math.random() * RankUp.length)];

            const skill =
                skills[Math.floor(Math.random() * skills.length)].nome;

            const item =
                rareItems[Math.floor(Math.random() * rareItems.length)];

            const level = Math.floor(Math.random() * 6) + 1;

            const messageTemplate =
                messages[Math.floor(Math.random() * messages.length)];

            const message = messageTemplate(
                player,
                rank,
                xp,
                level,
                item,
                skill
            );


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
                >
                    <span className="notification-dot" />
                    <span className="notification-text">{n.message}</span>
                </div>

            ))}
        </div>
    );
}
