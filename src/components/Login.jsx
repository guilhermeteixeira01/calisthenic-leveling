import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { IconEye, IconEyeOff } from "./Icons";

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
        <form className="sys-panel" onSubmit={logar}>
            <div className="sys-head">
                <span className="sys-mark">!</span>
                <span className="sys-title">Acesso do Jogador</span>
            </div>

            <div className="sys-body auth-form">
                <p className="auth-lead">Você recebeu uma <strong>quest</strong>. Deseja aceitar?</p>

                {mensagem && (
                    <div className={`alert ${tipoMensagem}`} role="alert">
                        {mensagem}
                    </div>
                )}

                <label className="field">
                    <span className="field-label">Email ou usuário</span>
                    <input
                        className="input"
                        type="text"
                        autoComplete="username"
                        placeholder="caçador@email.com"
                        onChange={(e) => setLoginInput(e.target.value)}
                    />
                </label>

                <label className="field">
                    <span className="field-label">Senha</span>
                    <div className="password-field">
                        <input
                            className="input"
                            type={mostrarSenha ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setSenha(e.target.value)}
                        />
                        <button
                            type="button"
                            className="icon-btn password-toggle"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {mostrarSenha ? <IconEyeOff /> : <IconEye />}
                        </button>
                    </div>
                </label>

                <button className="btn btn-primary btn-block">Aceitar · Entrar</button>
            </div>
        </form>
    );
}

export default Login;
