import { useEffect } from "react";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ProgressBar({ tasks, user, xpSemana = 100 }) {

    const completed = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    function getSegundaAtual() {
        const hoje = new Date();
        const dia = hoje.getDay();
        const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
        const segunda = new Date(hoje.setDate(diff));
        segunda.setHours(0, 0, 0, 0);
        return segunda.toISOString().split("T")[0];
    }

    useEffect(() => {
        async function darXpSemanal() {
            if (!user?.uid) return;
            if (percent !== 100) return;

            const semanaAtual = getSegundaAtual();
            const userRef = doc(db, "usuarios", user.uid);
            const userSnap = await getDoc(userRef);
            const dados = userSnap.data();

            if (dados?.ultimaSemanaXP === semanaAtual) {
                // Já ganhou XP essa semana
                return;
            }

            await updateDoc(userRef, {
                xp: increment(xpSemana),
                ultimaSemanaXP: semanaAtual
            });

            console.log("🔥 XP semanal concedido!");
        }

        darXpSemanal();

    }, [percent, user, xpSemana]);

    return (
        <div className="progress">
            <span className="progress-text">
                Progresso Semanal: {percent}%
            </span>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
