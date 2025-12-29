import React, { useState, useEffect } from "react";

export default function UserSidebar({ user, onLogout }) {
    const [open, setOpen] = useState(false);

    // Opcional: bloquear scroll e esconder conteúdo
    useEffect(() => {
        if (open) {
            document.body.classList.add("menu-open");
        } else {
            document.body.classList.remove("menu-open");
        }
    }, [open]);

    return (
        <>
            {/* Botão mobile */}
            <button className="menu-toggle" onClick={() => setOpen(!open)}>
                ☰
            </button>

            {/* Sidebar */}
            <div className={`user-sidebar ${open ? "active" : ""}`}>
                <div className="user-profile">
                    <img
                        src={
                            user.photoURL ||
                            "https://i.pinimg.com/1200x/9f/2b/f9/9f2bf9418bf23ddafd13c3698043c05d.jpg"
                        }
                        alt="Perfil"
                        className="avatar"
                    />
                    <span className="user-name"><p className="welcome-name">Bem-Vindo</p>{user.displayName}</span>
                </div>

                <button className="logout-btn" onClick={onLogout}>
                    Sair
                </button>
            </div >
        </>
    );
}
