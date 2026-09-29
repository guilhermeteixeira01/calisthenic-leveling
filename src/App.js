import './global.css';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, getDocs, addDoc, deleteDoc, doc,
  updateDoc, getDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

import UserSidebar from './components/UserSidebar';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import ProgressBar from './components/ProgressBar';
import Notification from './components/Notification';
import Upgrades from './components/Upgrade';
import UserProfileCard from "./components/UserProfileCard";
import Top15 from './components/Top15';
import Missoes from './components/Missoes';
import PerfilCFG from './components/perfilcfg';

import Login from "./components/Login";
import Register from "./components/Register";

import { SITENAME } from "./constants/xpPorRank";

const PAGINAS = {
  treino: { eyebrow: "Daily Quest", titulo: "Treino Semanal" },
  missoes: { eyebrow: "Quest Info", titulo: "Missões" },
  upgrades: { eyebrow: "Status", titulo: "Atributos" },
  top15: { eyebrow: "Hunter Ranking", titulo: "Top 15" },
  PerfilCFG: { eyebrow: "Player", titulo: "Configurar Perfil" }
};

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("treino");
  const [menuOpen, setMenuOpen] = useState(false);

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  function getSegundaAtual() {
    const hoje = new Date();
    const dia = hoje.getDay(); // 0 = domingo
    const diff = hoje.getDate() - dia + (dia === 0 ? -6 : 1);
    const segunda = new Date(hoje.setDate(diff));
    segunda.setHours(0, 0, 0, 0);
    return segunda.toISOString().split("T")[0];
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) return;

      setUser(usuario);

      await verificarResetSemanal(usuario.uid);
      carregarTasks(usuario.uid);
    });
  }, []);

  async function carregarTasks(uid) {
    try {
      const snapshot = await getDocs(collection(db, "usuarios", uid, "tasks"));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      lista.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(lista);
    } catch (error) {
      console.error("Erro ao carregar tasks:", error);
    }
  }

  async function addTask(day, task) {
    if (!user) return;
    const taskToSave = { ...task, day, createdAt: task.createdAt || Date.now(), done: false };
    try {
      const docRef = await addDoc(collection(db, "usuarios", user.uid, "tasks"), taskToSave);
      setTasks(prev => [...prev, { ...taskToSave, id: docRef.id }].sort((a, b) => a.createdAt - b.createdAt));
    } catch (error) {
      console.error("Erro ao adicionar task:", error);
    }
  }

  async function removeTask(id) {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "tasks", id));
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Erro ao remover task:", error);
    }
  }

  async function toggleDone(id, hojeData) {
    if (!user || !id) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const novoDone = !task.done;
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, done: novoDone, completedAt: novoDone ? hojeData : null } : t);
    setTasks(updatedTasks);

    try {
      const taskRef = doc(db, "usuarios", user.uid, "tasks", id);
      await updateDoc(taskRef, {
        done: novoDone,
        completedAt: novoDone ? hojeData : null
      });

      console.log(`Task ${id} atualizada: done=${novoDone}, completedAt=${novoDone ? hojeData : "null"}`);
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  }


  const logout = () => {
    signOut(auth);
    setTasks([]);
    setStarted(false);
    window.location.reload()
  };

  async function verificarResetSemanal(uid) {
    try {
      const userRef = doc(db, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      const semanaAtual = getSegundaAtual();
      const lastReset = userSnap.data()?.lastWeeklyReset;

      if (lastReset === semanaAtual) return;

      console.log("🔄 Reset semanal iniciado");

      const tasksSnap = await getDocs(
        collection(db, "usuarios", uid, "tasks")
      );

      const promises = tasksSnap.docs.map(task =>
        updateDoc(task.ref, {
          done: false,
          completedAt: null,
        })
      );

      await Promise.all(promises);

      await updateDoc(userRef, {
        lastWeeklyReset: semanaAtual,
      });

      console.log("✅ Reset semanal concluído");
    } catch (error) {
      console.error("Erro no reset semanal:", error);
    }
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="app-bg" aria-hidden="true" />
        <div className="auth-wrap">
          <div className="auth-hero">
            <div className="brand-mark"><span>CL</span></div>
            <p className="eyebrow">[ Sistema ]</p>
            <h1>{SITENAME}</h1>
            <p>Complete suas quests diárias. Suba de rank. Torne-se o caçador mais forte.</p>
          </div>

          {showRegister ? <Register /> : <Login />}

          <p className="auth-switch">
            {showRegister ? "Já é um jogador? " : "Ainda não despertou? "}
            <button className="link-btn" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const hojeIndex = (new Date().getDay() + 6) % 7;
  const pagina = PAGINAS[telaAtiva];

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden="true" />

      <UserSidebar
        user={user} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        telaAtiva={telaAtiva} onNavigate={setTelaAtiva}
        onLogout={logout}
      />

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{pagina.eyebrow}</p>
            <h1>{pagina.titulo}</h1>
          </div>
          <div className="topbar-date">
            <strong>{diasSemana[hojeIndex]}</strong>
            {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
          </div>
        </header>

        {telaAtiva === "treino" && (
          <div className="page">
            <div className="training-top">
              <TaskForm addTask={addTask} diasSemana={diasSemana} />
              <ProgressBar tasks={tasks} user={user} />
            </div>

            <div className="week">
              {diasSemana.map((day, i) => {
                const dayTasks = tasks.filter(t => t.day === day);
                const doneCount = dayTasks.filter(t => t.done).length;
                const allDone = dayTasks.length > 0 && doneCount === dayTasks.length;
                const isToday = i === hojeIndex;
                return (
                  <section key={day} className={`sys-panel day ${isToday ? "today" : ""} ${allDone ? "complete" : ""}`}>
                    <div className="sys-head">
                      <span className="day-name">{day}</span>
                      {allDone
                        ? <span className="day-tag clear">CLEAR</span>
                        : isToday && <span className="day-tag">HOJE</span>}
                      <span className="day-count">{doneCount}/{dayTasks.length}</span>
                    </div>
                    <div className="day-body">
                      {dayTasks.length === 0 && <p className="empty">Dia de descanso</p>}
                      {dayTasks.map(task => (
                        <TaskItem key={task.id} task={task} toggleDone={toggleDone} removeTask={removeTask} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {telaAtiva === "missoes" && <Missoes tasks={tasks} user={user} onComplete={() => { }} />}
        {telaAtiva === "upgrades" && <Upgrades user={user} />}
        {telaAtiva === "top15" && <Top15 onOpenProfile={setProfileUserId} />}
        {telaAtiva === "PerfilCFG" && <PerfilCFG user={user} />}
      </main>

      <Notification />

      {profileUserId && (
        <UserProfileCard userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  );
}

export default App;