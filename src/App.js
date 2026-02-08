import './global.css';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, getDocs, addDoc, deleteDoc, doc,
  updateDoc, getDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

import UserSidebar from './components/UserSidebar';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import ProgressBar from './components/ProgressBar';
import Notification from './components/Notification';
import Upgrades from './components/Upgrade';
import UserProfileCard from "./components/UserProfileCard";
import Top15 from './components/Top15';
import Missoes from './components/Missoes';

import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const setupStatusBar = async () => {
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }
  };

  setupStatusBar();
  // Função para obter o domingo da semana atual
  function getDomingoAtual() {
    const hoje = new Date();
    const dia = hoje.getDay(); // 0 = domingo
    const diff = hoje.getDate() - dia;
    const domingo = new Date(hoje.setDate(diff));
    domingo.setHours(0, 0, 0, 0);
    return domingo.toISOString().split("T")[0];
  }

  useEffect(() => {
    const domingoAtual = getDomingoAtual();
    const domingoSalvo = localStorage.getItem("domingoAtual");

    if (domingoSalvo !== domingoAtual) {
      localStorage.setItem("domingoAtual", domingoAtual);
      window.location.reload();
    }
  }, []);

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState("treino");
  const [menuOpen, setMenuOpen] = useState(false);

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  // 🔐 Observa autenticação
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
    const userRef = doc(db, "usuarios", uid);
    const userSnap = await getDoc(userRef);

    const domingoAtual = getDomingoAtual();
    const lastReset = userSnap.data()?.lastWeeklyReset;

    // Já resetou esta semana
    if (lastReset === domingoAtual) return;

    console.log("🔄 Reset semanal iniciado");

    const tasksSnap = await getDocs(
      collection(db, "usuarios", uid, "tasks")
    );

    for (const task of tasksSnap.docs) {
      await updateDoc(task.ref, {
        done: false,
        completedAt: null,
      });
    }

    await updateDoc(userRef, {
      lastWeeklyReset: domingoAtual,
    });

    console.log("✅ Reset semanal concluído");
  }

  if (!user) {
    return (
      <div className="container-login-register">
        {showRegister ? (
          <>
            <Register />
            <p className="login-switch-text">
              Já tem conta?{" "}
              <button className="login-switch-button" onClick={() => setShowRegister(false)}>Faça login</button>
            </p>
          </>
        ) : (
          <>
            <Login />
            <p className="login-switch-text">
              Não tem conta?{" "}
              <button className="login-switch-button" onClick={() => setShowRegister(true)}>Crie uma aqui</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {profileUserId && (
        <UserProfileCard userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}

      {!profileUserId && (
        <>
          <div className="container">
            <UserSidebar
              user={user} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
              onOpenTreino={() => setTelaAtiva("treino")}
              onOpenMissoes={() => setTelaAtiva("missoes")}
              onOpenUpgrades={() => setTelaAtiva("upgrades")}
              onOpenTop15={() => setTelaAtiva("top15")}
              onLogout={logout}
            />
            <div className="container-conteudo">
              <header><h1>CALISTHENTIC LEVELING</h1></header>

              {telaAtiva === "treino" && (
                <>
                  <TaskForm addTask={addTask} diasSemana={diasSemana} />
                  <ProgressBar tasks={tasks} />
                  <div className="week">
                    {diasSemana.map(day => {
                      const dayTasks = tasks.filter(t => t.day === day);
                      const allDone = dayTasks.length > 0 && dayTasks.every(t => t.done);
                      return (
                        <div key={day} className={`day ${allDone ? "day-complete" : ""}`}>
                          <h2>{day}</h2>
                          {dayTasks.length === 0 && <p>Nenhum exercício</p>}
                          {dayTasks.map(task => (
                            <TaskItem key={task.id} task={task} toggleDone={toggleDone} removeTask={removeTask} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {telaAtiva === "missoes" && <Missoes tasks={tasks} user={user} onComplete={() => { }} />}
              {telaAtiva === "upgrades" && <Upgrades user={user} />}
              {telaAtiva === "top15" && <Top15 onOpenProfile={setProfileUserId} />}

              <Notification />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;