import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Login() {
    const [loginInput, setLoginInput] = useState(""); // pode ser email ou nome
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState(""); // mensagem de feedback
    const [tipoMensagem, setTipoMensagem] = useState(""); // "erro" ou "sucesso"

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
                    setMensagem("Usuário não encontrado");
                    setTipoMensagem("erro");
                    return;
                }

                // Pega o email do primeiro usuário encontrado
                email = snapshot.docs[0].data().email;
            }

            // Faz login com email e senha
            await signInWithEmailAndPassword(auth, email, senha);
            /* setMensagem("Login feito com sucesso!");
            setTipoMensagem("sucesso"); */

            // Limpa a mensagem após 3 segundos
            setTimeout(() => {
                setMensagem("");
                setTipoMensagem("");
            }, 8000);
        } catch (error) {
            console.error(error);
            setMensagem("Email ou senha inválidos");
            setTipoMensagem("erro");

            setTimeout(() => {
                setMensagem("");
                setTipoMensagem("");
            }, 8000);
        }
    }

    return (
        <form className="Logindiv" onSubmit={logar}>
            <h2>Login</h2>

            {/* Caixa de mensagem */}
            {mensagem && (
                <div className={`mensagem ${tipoMensagem}`}>
                    {mensagem}
                </div>
            )}
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