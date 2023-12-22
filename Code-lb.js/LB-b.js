const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // CORS-Modul hinzugefügt

const app = express();
const port = 3000;

app.use(bodyParser.json());

// CORS-Konfiguration hinzugefügt
app.use(cors({
  origin: 'http://localhost:8080',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const tasks = [];

app.get('/tasks', (req, res) => {
  res.json({ tasks });
});

app.post('/tasks', (req, res) => {
  try {
    const { title, description } = req.body;

    // Validierung für Benutzereingaben hinzugefügt
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newTask = {
      id: tasks.length + 1,
      title,
      description
    };
    tasks.push(newTask);

    // Logging hinzugefügt
    console.log(`New task created: ${newTask.title}`);

    res.status(201).json({ task: newTask });
  } catch (error) {
    // Fehlerbehandlung hinzugefügt
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    res.json({ task });
  }
});

app.patch('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    Object.assign(task, req.body);
    res.json({ task });
  }
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
  } else {
    // Autorisierung hinzugefügt (einfaches Beispiel)
    if (/* Überprüfung der Berechtigung hier */) {
      tasks.splice(index, 1);
      res.json({ result: true });
    } else {
      res.status(403).json({ error: 'Permission denied' });
    }
  }
});

// Verbessertes Logging für den Serverstart hinzugefügt
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
