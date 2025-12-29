import './global.css';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import UserSidebar from './components/UserSidebar';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import ProgressBar from "./components/ProgressBar";
import StartButton from './components/StartButton';
import Notification from "./components/Notification";

import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  // 🔐 Verifica login
  useEffect(() => {
    onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (usuario) {
        carregarTasks(usuario.uid);
      }
    });
  }, []);

  // 📥 Carregar tasks do Firestore e ordenar
  async function carregarTasks(uid) {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios", uid, "tasks"));
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

  // ➕ Adicionar task com dia
  async function addTask(day, task) {
    if (!user) return;

    const taskToSave = {
      ...task,
      day,
      createdAt: task.createdAt || Date.now()
    };

    try {
      const docRef = await addDoc(
        collection(db, "usuarios", user.uid, "tasks"),
        taskToSave
      );

      // Atualiza state com o id gerado pelo Firestore
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

  // ✅ Alternar status de concluído
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
    } catch (error) {
      console.error("Erro ao atualizar task no Firestore:", error);
    }
  }

  const handleStart = () => setStarted(true);

  function logout() {
    signOut(auth);
    setTasks([]);
    setStarted(false);
  }

  // 🔐 Tela de login ou registro
  if (!user) {
    return (
      <div className="container-login-register">
        {showRegister ? (
          <>
            <Register />
            <p className="login-switch-text">
              Já tem conta?{' '}
              <button className="login-switch-button" onClick={() => setShowRegister(false)}>
                Faça login
              </button>
            </p>
          </>
        ) : (
          <>
            <Login />
            <p className="login-switch-text">
              Não tem conta?{' '}
              <button className="login-switch-button" onClick={() => setShowRegister(true)}>
                Crie uma aqui
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  // 🌟 Tela principal do app
  return (
    <div className="App">
      {!started && (
        <div className="start-container">
          <StartButton onClick={handleStart} />
        </div>
      )}

      {started && (
        <div className="container">
          <UserSidebar user={user} onLogout={logout} />

          <div className="container-conteudo">
            <header>
              <h1>Calisthenic Braz</h1>
            </header>

            <TaskForm addTask={addTask} diasSemana={diasSemana} />
            <ProgressBar tasks={tasks} />

            <div className="week">
              {diasSemana.map(day => {
                const dayTasks = tasks.filter(t => t.day === day);
                const allDone = dayTasks.length > 0 && dayTasks.every(t => t.done);

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

            <Notification />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;