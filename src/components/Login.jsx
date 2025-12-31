import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Login() {
    const [loginInput, setLoginInput] = useState(""); // pode ser email ou nome
    const [senha, setSenha] = useState("");

    async function logar(e) {
        e.preventDefault();

        try {
            let email = loginInput;

            // Se o input não contém "@" assumimos que é um nome de usuário
            if (!loginInput.includes("@")) {
                // Busca no Firestore pelo displayName
                const q = query(
                    collection(db, "usuarios"),
                    where("displayName", "==", loginInput)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    alert("Usuário não encontrado");
                    return;
                }

                // Pega o email do primeiro usuário encontrado
                email = snapshot.docs[0].data().email;
            }

            // Faz login com email e senha
            await signInWithEmailAndPassword(auth, email, senha);
            alert("Login feito com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Email ou senha inválidos");
        }
    }

    return (
        <form className="Logindiv" onSubmit={logar}>
            <h2>Login</h2>

            <input
                type="text"
                placeholder="Email ou Nome"
                onChange={(e) => setLoginInput(e.target.value)}
            />

            <input
                type="password"
                placeholder="Senha"
                onChange={(e) => setSenha(e.target.value)}
            />

            <button>Entrar</button>
        </form>
    );
}

export default Login;
