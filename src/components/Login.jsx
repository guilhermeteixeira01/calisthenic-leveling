import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Login() {
    const [loginInput, setLoginInput] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

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
                    where("displayNameLower", "==", loginLimpo.toLowerCase())
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
            setMensagem("Email, Usuário ou senha inválidos");
            setTipoMensagem("erro");

            setTimeout(() => {
                setMensagem("");
                setTipoMensagem("");
            }, 8000);
        }
    }

    return (
        <form className="auth-card" onSubmit={logar}>
            <h2>Login</h2>

            {mensagem && (
                <div className={`mensagem ${tipoMensagem}`}>
                    {mensagem}
                </div>
            )}

            <input
                type="text"
                placeholder="Email ou Usuário"
                onChange={(e) => setLoginInput(e.target.value)}
            />

            <div className="input-password">
                <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
                    onChange={(e) => setSenha(e.target.value)}
                />

                <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                    {mostrarSenha ? (
                        /* Olho fechado */
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17.94 17.94A10.94 10.94 0 0112 19C7 19 2.73 15.11 1 12c.73-1.32 1.7-2.5 2.84-3.44M9.9 4.24A10.94 10.94 0 0112 5c5 0 9.27 3.89 11 7a10.96 10.96 0 01-4.16 4.36M1 1l22 22" />
                        </svg>
                    ) : (
                        /* Olho aberto */
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>

            <button className="btnn">Entrar</button>
        </form>
    );
}

export default Login;
