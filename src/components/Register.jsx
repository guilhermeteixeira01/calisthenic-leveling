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
        <div className="Registerdiv">
            <h2>Registrar</h2>
            <input
                type="text"
                placeholder="Nome e Sobrenome"
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