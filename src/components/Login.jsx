import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

function Login() {
    const [loginInput, setLoginInput] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    async function logar(e) {
        e.preventDefault();

        try {
            let loginLimpo = loginInput.trim();   // ✅ remove espaços
            let senhaLimpa = senha.trim();

            if (!loginLimpo || !senhaLimpa) {
                setMensagem("Preencha todos os campos");
                setTipoMensagem("erro");
                return;
            }

            let email = loginLimpo;

            // Se não tem @ é nome de usuário
            if (!loginLimpo.includes("@")) {
                const q = query(
                    collection(db, "usuarios"),
                    where("displayNameLower", "==", loginLimpo.toLowerCase()) // 🔥 busca case-insensitive
                );

                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setMensagem("Usuário não encontrado");
                    setTipoMensagem("erro");
                    return;
                }

                email = snapshot.docs[0].data().email;
            }

            await signInWithEmailAndPassword(auth, email, senhaLimpa);

            setMensagem("");
            setTipoMensagem("");

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

            {mensagem && (
                <div className={`mensagem ${tipoMensagem}`}>
                    {mensagem}
                </div>
            )}

            <input
                type="text"
                placeholder="Email"
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
