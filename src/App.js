import './global.css';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

import UserSidebar from './components/UserSidebar';
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ProgressBar from "./components/ProgressBar";
import StartButton from './components/StartButton';
import Notification from "./components/Notification";

import Login from "./Login";
import Register from "./Register";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
    const querySnapshot = await getDocs(
      collection(db, "usuarios", uid, "tasks")
    );

    const lista = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Ordena pelo createdAt (mais recente primeiro)
    lista.sort((a, b) => a.createdAt - b.createdAt);

    setTasks(lista);
  }

  // ➕ Adicionar task
  async function addTask(task) {
    if (!user) return;

    const docRef = await addDoc(
      collection(db, "usuarios", user.uid, "tasks"),
      task
    );

    // Adiciona a task na lista e mantém a ordem
    const updatedTasks = [...tasks, { ...task, id: docRef.id }];
    updatedTasks.sort((a, b) => a.createdAt - b.createdAt);
    setTasks(updatedTasks);
  }

  // ❌ Remover task
  async function removeTask(id) {
    if (!user) return;

    await deleteDoc(doc(db, "usuarios", user.uid, "tasks", id));
    setTasks(tasks.filter(task => task.id !== id));
  }

  // ✅ Alternar status de concluído
  async function toggleDone(id) {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updatedTasks);

    const taskRef = doc(db, "usuarios", user.uid, "tasks", id);
    await updateDoc(taskRef, { done: !task.done });
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
            <p style={{ color: '#aaa', marginTop: '10px' }}>
              Já tem conta?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#00ffff', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowRegister(false)}
              >
                Faça login
              </button>
            </p>
          </>
        ) : (
          <>
            <Login />
            <p style={{ color: '#aaa', marginTop: '10px' }}>
              Não tem conta?{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#00ffff', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowRegister(true)}
              >
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
            <Header tasks={tasks} />
            <ProgressBar tasks={tasks} />
            <TaskForm addTask={addTask} />
            <TaskList
              tasks={tasks}
              toggleDone={toggleDone}
              removeTask={removeTask}
            />
            <Notification />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;