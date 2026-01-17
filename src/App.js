import './global.css';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

import UserSidebar from './components/UserSidebar';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import ProgressBar from './components/ProgressBar';
import StartButton from './components/StartButton';
import Notification from './components/Notification';
import Upgrades from './components/Upgrade';

import Top15 from './components/Top15';

import Login from "./components/Login";
import Register from "./components/Register";
import Missoes from './components/Missoes';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // 🔥 CONTROLE DE TELAS
  const [telaAtiva, setTelaAtiva] = useState("treino");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleMissaoCompleta(xp, idMissao) {
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);

      await updateDoc(userRef, {
        xp: increment(xp)
      });

      console.log(`🎯 Missão ${idMissao} concluída: +${xp} XP`);
    } catch (error) {
      console.error("Erro ao resgatar XP da missão:", error);
    }
  }

  function abrirTela(tela) {
    setTelaAtiva(tela);
    setMenuOpen(false); // fecha o menu ao clicar
  }

  const diasSemana = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo"
  ];

  // 🔐 Verifica login
  useEffect(() => {
    onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (usuario) {
        carregarTasks(usuario.uid);
      }
    });
  }, []);


  // 📥 Carregar tasks
  async function carregarTasks(uid) {
    try {
      const querySnapshot = await getDocs(
        collection(db, "usuarios", uid, "tasks")
      );

      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      lista.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(lista);
    } catch (error) {
      console.error("Erro ao carregar tasks:", error);
    }
  }

  // ➕ Adicionar task
  async function addTask(day, task) {
    if (!user) return;

    const taskToSave = {
      ...task,
      day,
      createdAt: task.createdAt || Date.now(),
      done: false
    };

    try {
      const docRef = await addDoc(
        collection(db, "usuarios", user.uid, "tasks"),
        taskToSave
      );

      const updatedTasks = [...tasks, { ...taskToSave, id: docRef.id }];
      updatedTasks.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Erro ao adicionar task:", error);
    }
  }

  // ❌ Remover task
  async function removeTask(id) {
    if (!user || !id) return;

    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "tasks", id));
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error("Erro ao remover task:", error);
    }
  }

  // 🔥 Verifica se o dia foi concluído (ANTI-BURLA)
  async function verificarDiaConcluido(dia, updatedTasks) {
    if (!user) return;

    const dayTasks = updatedTasks.filter(t => t.day === dia);
    if (dayTasks.length === 0) return;

    const allDone = dayTasks.every(t => t.done);
    if (!allDone) return;

    const diaRef = doc(db, "usuarios", user.uid, "diasConcluidos", dia);
    const diaSnap = await getDoc(diaRef);

    if (diaSnap.exists() && diaSnap.data().xpRecebido) return;

    await setDoc(diaRef, {
      concluido: true,
      xpRecebido: true,
      data: new Date()
    });

    const userRef = doc(db, "usuarios", user.uid);
    await updateDoc(userRef, {
      xp: increment(25)
    });

    console.log(`+25 XP concedido pelo dia ${dia}`);
  }

  // ✅ Alternar status
  async function toggleDone(id) {
    if (!user || !id) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );

    setTasks(updatedTasks);

    try {
      const taskRef = doc(db, "usuarios", user.uid, "tasks", id);
      await updateDoc(taskRef, { done: !task.done });

      await verificarDiaConcluido(task.day, updatedTasks);
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  }

  const handleStart = () => setStarted(true);

  function logout() {
    signOut(auth);
    setTasks([]);
    setStarted(false);
  }

  // 🔐 Login / Registro
  if (!user) {
    return (
      <div className="container-login-register">
        {showRegister ? (
          <>
            <Register />
            <p className="login-switch-text">
              Já tem conta?{" "}
              <button className="login-switch-button" onClick={() => setShowRegister(false)}>
                Faça login
              </button>
            </p>
          </>
        ) : (
          <>
            <Login />
            <p className="login-switch-text">
              Não tem conta?{" "}
              <button className="login-switch-button" onClick={() => setShowRegister(true)}>
                Crie uma aqui
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  // 🌟 APP
  return (
    <div className="App">
      {!started && (
        <div className="start-container">
          <StartButton onClick={handleStart} />
        </div>
      )}

      {started && (
        <div className="container">
          <UserSidebar
            user={user}
            onLogout={logout}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onOpenTreino={() => abrirTela("treino")}
            onOpenMissoes={() => abrirTela("missoes")}
            onOpenUpgrades={() => abrirTela("upgrades")}
            onOpenTop15={() => abrirTela("top15")}
          />

          <div className="container-conteudo">
            <header>
              <h1>CALISTHENTIC BRAZ</h1>
            </header>

            {/* 🏋️ TREINO SEMANAL */}
            {telaAtiva === "treino" && (
              <>
                <TaskForm addTask={addTask} diasSemana={diasSemana} />
                <ProgressBar tasks={tasks} />

                <div className="week">
                  {diasSemana.map(day => {
                    const dayTasks = tasks.filter(t => t.day === day);
                    const allDone =
                      dayTasks.length > 0 &&
                      dayTasks.every(t => t.done);

                    return (
                      <div
                        key={day}
                        className={`day ${allDone ? "day-complete" : ""}`}
                      >
                        <h2>{day}</h2>
                        {dayTasks.length === 0 && <p>Nenhum exercício</p>}
                        {dayTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            toggleDone={toggleDone}
                            removeTask={removeTask}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* 📜 MISSÕES */}
            {telaAtiva === "missoes" && (
              <Missoes
                tasks={tasks}
                onComplete={handleMissaoCompleta}
              />
            )}

            {/* ⚡ UPGRADES */}
            {telaAtiva === "upgrades" && <Upgrades user={user} />}

            {/* 🏆 TOP 15 */}
            {telaAtiva === "top15" && <Top15 />}

            <Notification />
          </div>
        </div>
      )
      }
    </div >
  );
}

export default App;