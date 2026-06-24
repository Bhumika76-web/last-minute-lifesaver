import { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [backendStatus, setBackendStatus] = useState('Loading...');

  // Check backend on load
  useState(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus('Backend not running'));
  }, []);

  // Add task
  const addTask = (e) => {
    e.preventDefault();
    if (taskInput.trim() && deadline) {
      const newTask = {
        id: Date.now(),
        title: taskInput,
        deadline: deadline,
        priority: null,
      };
      setTasks([...tasks, newTask]);
      setTaskInput('');
      setDeadline('');
    }
  };

  // Send to AI for prioritization
  const prioritizeTasks = async () => {
    if (tasks.length === 0) {
      alert('Add some tasks first!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });

      const data = await response.json();

      if (data.prioritizedTasks) {
        setPrioritizedTasks(data.prioritizedTasks);
        setSummary(data.summary);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to connect to backend: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="App">
      <header className="header">
        <h1> Last-Minute Life Saver</h1>
        <p className="status">{backendStatus}</p>
      </header>

      <div className="container">
        {/* Input Section */}
        <section className="input-section">
          <h2>Add Your Tasks</h2>
          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
            <button type="submit" className="btn-add">
              Add Task
            </button>
          </form>
        </section>

        {/* Pending Tasks */}
        {tasks.length > 0 && (
          <section className="tasks-section">
            <h2>Tasks ({tasks.length})</h2>
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className="task-card pending">
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p className="deadline">
                      Calender: {new Date(task.deadline).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => deleteTask(task.id)}
                  >
                  ❌
                  </button>
                </div>
              ))}
            </div>

            {/* AI Priority Button */}
            <button
              onClick={prioritizeTasks}
              disabled={loading}
              className="btn-prioritize"
            >
              {loading ? 'Analyzing...' : 'Let AI Prioritize'}
            </button>
          </section>
        )}

        {/* AI Results */}
        {prioritizedTasks.length > 0 && (
          <section className="results-section">
            <h2>AI-Powered Prioritization</h2>

            <div className="summary-box">
              <h3>Top Priority:</h3>
              <p>{summary}</p>
            </div>

            <div className="prioritized-list">
              {prioritizedTasks
                .sort((a, b) => b.priority - a.priority)
                .map((task, idx) => (
                  <div
                    key={idx}
                    className={`task-card prioritized ${task.riskLevel.toLowerCase()}`}
                  >
                    <div className="task-header">
                      <h3>
                        {idx + 1}. {task.title}
                      </h3>
                      <div className="badges">
                        <span className="priority">
                          Priority: {task.priority}/10
                        </span>
                        <span className={`risk ${task.riskLevel.toLowerCase()}`}>
                          {task.riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="task-details">
                      <p>
                        <strong> Why:</strong> {task.reason}
                      </p>
                      <p>
                        <strong>Action:</strong> {task.recommendedAction}
                      </p>
                      <p>
                        <strong> Estimated:</strong> {task.estimatedMinutes} mins
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;