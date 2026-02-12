import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // ajuste o caminho

// Rank e XP
const RankUp = ["S", "A", "B", "C", "D"];
const CountXps = ["50", "150", "200", "500"];

// Skills
const skills = [
    { id: "forca", nome: "Força" },
    { id: "foco", nome: "Foco" },
    { id: "vitalidade", nome: "Vitalidade" },
    { id: "carisma", nome: "Carisma" },
    { id: "sabedoria", nome: "Sabedoria" }
];

// Itens raros
const rareItems = [
    "Espada Ancestral",
    "Amuleto do Dragão",
    "Anel da Eternidade",
    "Cajado Arcano",
    "Armadura Celestial",
    "Orbe do Conhecimento"
];

// Templates de mensagens
// Separar templates VIP e normais
const vipTemplates = [
    (player, _, __, ___, ____, _____, isVip) =>
        <><span className="user-name-vip">{player}</span> é agora um <span className="user-name-vip">VIP</span> 👑</>
];

const normalTemplates = [
    (player, rank, _, __, ___, ____, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} subiu para o Rank <span className={`rank-${rank}`}>{rank}</span> 🚀</>
    ),
    (player, _, xp, __, ___, ____, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} ganhou {xp} XP 🔥</>
    ),
    (player, _, __, ___, ____, _____, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} completou uma quest 💎</>
    ),
    (player, _, __, ___, item, ____, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} encontrou um item raro: {item} ✨</>
    ),
    (player, _, __, level, ___, ____, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} subiu para o nível {level} 📈</>
    ),
    (player, _, __, ___, ____, skill, isVip) => (
        <>{isVip ? <span className="user-name-vip">{player}</span> : player} evoluiu sua habilidade ({skill}) ⚡</>
    )
];

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [players, setPlayers] = useState([]); // array de {id, displayName, isVip}

    // 🔹 Buscar usuários do Firebase
    useEffect(() => {
        async function fetchUsers() {
            try {
                const snapshot = await getDocs(collection(db, "usuarios"));

                const userList = snapshot.docs
                    .map(doc => {
                        const data = doc.data();
                        return data.displayName
                            ? {
                                id: doc.id,
                                displayName: data.displayName,
                                isVip: data.cargo?.toLowerCase() === "vip"
                            }
                            : null;
                    })
                    .filter(Boolean);

                setPlayers(userList);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            }
        }

        fetchUsers();
    }, []);

    // 🔹 Criar notificações aleatórias
    // 🔹 Criar notificações aleatórias
    useEffect(() => {
        if (players.length === 0) return;

        const interval = setInterval(() => {
            const randomPlayer = players[Math.floor(Math.random() * players.length)];

            const player = randomPlayer.displayName;
            const isVip = randomPlayer.isVip;
            const xp = CountXps[Math.floor(Math.random() * CountXps.length)];
            const rank = RankUp[Math.floor(Math.random() * RankUp.length)];
            const skill = skills[Math.floor(Math.random() * skills.length)].nome;
            const item = rareItems[Math.floor(Math.random() * rareItems.length)];
            const level = Math.floor(Math.random() * 6) + 2;

            // Escolher template correto
            const templates = isVip ? [...vipTemplates, ...normalTemplates] : normalTemplates;
            const messageTemplate = templates[Math.floor(Math.random() * templates.length)];

            const message = messageTemplate(player, rank, xp, level, item, skill, isVip);

            const id = Date.now();
            setNotifications(prev => [...prev, { id, message, rank }]);

            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        }, 30000);

        return () => clearInterval(interval);
    }, [players]);

    return (
        <div className="notification-container">
            {notifications.map(n => (
                <div key={n.id} className="notification">
                    <span className="notification-dot" />
                    <span className="notification-text">{n.message}</span>
                </div>
            ))}
        </div>
    );
}