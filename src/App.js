import './global.css';
import { useState, useEffect } from "react";
import Header from "./components/Header";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ProgressBar from "./components/ProgressBar";
import StartButton from './components/StartButton';
import Notification from "./components/Notification";

function App() {
  const [tasks, setTasks] = useState([]);
  const [started, setStarted] = useState(false); // novo estado

  // Carregar tarefas do localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Salvar tarefas no localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleStart = () => {
    setStarted(true); // agora mostra os componentes
  };

  return (
    <div className="App">
      {!started && (
        <div className="start-container">
          <StartButton onClick={handleStart} />
        </div>
      )}

      {started && (
        <div className="container">
          <Header tasks={tasks} />
          <ProgressBar tasks={tasks} />
          <TaskForm setTasks={setTasks} />
          <TaskList tasks={tasks} setTasks={setTasks} />
          <Notification />
        </div>
      )}
    </div>

  );
}

export default App;
