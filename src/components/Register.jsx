import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            if (!name.includes(" ")) {
                alert("Digite Nome e Sobrenome corretamente.");
                return;
            }

            // Cria usuário no Auth primeiro
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Atualiza displayName
            await updateProfile(userCredential.user, { displayName: name });

            // Verifica se displayName já existe no Firestore
            const q = query(collection(db, "usuarios"), where("displayName", "==", name));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                alert("Nome já utilizado. Escolha outro.");
                return;
            }

            // Salva usuário no Firestore
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                displayName: name.trim(), // nome normal
                displayNameLower: name.trim().toLowerCase(), // 🔥 nome normalizado pro login
                email: email.trim().toLowerCase(), // já salva email padronizado também
                xp: 0,
                cargo: "free",
                photoURL: userCredential.user.photoURL || null
            });

            alert("Registrado com sucesso!");
            console.log("Usuário registrado:", userCredential.user);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <form className="sys-panel" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="sys-head">
                <span className="sys-mark">!</span>
                <span className="sys-title">Despertar</span>
            </div>

            <div className="sys-body auth-form">
                <p className="auth-lead">Você foi escolhido como <strong>Jogador</strong>.</p>

                <label className="field">
                    <span className="field-label">Nome e sobrenome</span>
                    <input
                        className="input"
                        type="text"
                        autoComplete="name"
                        placeholder="Sung Jinwoo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field-label">Email</span>
                    <input
                        className="input"
                        type="email"
                        autoComplete="email"
                        placeholder="caçador@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field-label">Senha</span>
                    <input
                        className="input"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Mínimo de 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button className="btn btn-primary btn-block">Despertar · Registrar</button>
            </div>
        </form>
    );
}