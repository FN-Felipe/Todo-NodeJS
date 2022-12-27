const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  console.log(user)
  if (!user) return response.status(404).json({ error: "Md: User not found (Usuário não encontrado)" })
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find((user) => user.username === username)
  if (userAlreadyExists) { return response.status(400).json({ error: "User already Exists!" }) }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })
  return response.status(201).json(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const addTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(addTodos)
  return response.status(201).json(addTodos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request

  const idTodos = user.todos.find((idList) => idList.id === id)
  if (!idTodos) return response.status(404).json({ error: "Todo not found" })

  idTodos.title = title
  idTodos.deadline = new Date(deadline)
  return response.json(idTodos)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const idTodos = user.todos.find(idList => idList.id === id)
  if (!idTodos) return response.status(404).json({ error: "Todo not found" })
  idTodos.done = true
  return response.json(idTodos)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const idTodos = user.todos.findIndex((idList) => idList.id === id)
  if (idTodos === -1) return response.status(404).json({ error: "Todo not found" })
  user.todos.splice(idTodos, 1)
  return response.status(204).json()
});

module.exports = app;