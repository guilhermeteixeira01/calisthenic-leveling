import { useState } from "react";
import { auth, db } from "../firebase"; // importando db
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // importar funções do Firestore

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Atualiza o displayName no Auth
            await updateProfile(userCredential.user, { displayName: name });

            // Salva os dados do usuário no Firestore
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                displayName: name,
                email: email,
                xp: 0, // inicia com 0 XP
                photoURL: userCredential.user.photoURL || null,
            });

            console.log("Usuário registrado:", userCredential.user);
            alert("Registrado com sucesso!");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div className="Registerdiv">
            <h2>Registrar</h2>
            <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Registrar</button>
        </div>
    );
}