import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Atualiza o displayName
            await updateProfile(userCredential.user, { displayName: name });

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
            <input type="text" placeholder="Nome" onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Registrar</button>
        </div>
    );
}
