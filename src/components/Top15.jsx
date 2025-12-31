import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

// SVGs para medalhas
const medals = {
    1: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    2: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#C0C0C0">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    3: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#CD7F32">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
};

// Cores para os nomes dos 3 primeiros
const nameColors = {
    1: "#FFD700", // ouro
    2: "#C0C0C0", // prata
    3: "#CD7F32", // bronze
};

export default function Top15() {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "usuarios"),
            orderBy("xp", "desc"),
            limit(15)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((docSnap) => {
                const user = docSnap.data();
                return {
                    id: docSnap.id,
                    displayName: user.displayName || "Usuário",
                    photoURL:
                        user.photoURL ||
                        "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg",
                    xp: user.xp || 0,
                };
            });

            setUsuarios(data);
        });

        return () => unsub();
    }, []);

    return (
        <div className="top15-container">
            <h2>Top 15 Usuários</h2>
            <ol className="top15-list">
                {usuarios.map((user, index) => {
                    const { xp, displayName, photoURL } = user;
                    const rank = index + 1;

                    return (
                        <li
                            key={user.id}
                            className="top15-item"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                            }}
                        >
                            {/* Medalha ou número */}
                            <span className="rank" style={{ marginRight: "10px" }}>
                                {medals[rank] || rank}
                            </span>

                            {/* Avatar */}
                            <img
                                src={photoURL}
                                alt={displayName}
                                className="avatar"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginRight: "10px",
                                }}
                            />

                            {/* Nome e XP */}
                            <span
                                className="name"
                                style={{
                                    marginRight: "10px",
                                    fontWeight: rank <= 3 ? "bold" : "normal",
                                    color: nameColors[rank] || "#000", // aplica cor nos 3 primeiros
                                }}
                            >
                                {displayName}
                            </span>
                            <span className="xp">{xp} XP</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}