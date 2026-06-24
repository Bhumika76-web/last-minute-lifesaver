import { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [backendStatus, setBackendStatus] = useState('Loading...');

  useState(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus('Backend not running'));
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (taskInput.trim()) {
      setTasks([...tasks, { id: Date.now(), title: taskInput, deadline, priority: null }]);
      setTaskInput('');
      setDeadline('');
    }
  };

  return (
    <div className="App">
      <h1>Last-Minute Life Saver</h1>
      <p style={{ color: 'green' }}>{backendStatus}</p>

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="tasks">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;