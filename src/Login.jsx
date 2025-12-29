import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    async function logar(e) {
        e.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            alert("Login feito com sucesso!");
        } catch (error) {
            alert("Email ou senha inválidos");
        }
    }

    return (
        <form className="Logindiv" onSubmit={logar}>
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
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
