const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username);

  if(!findUser) {
    return response.status(404).json({error: 'User not found'})
  }

  request.user = findUser;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const findUser = users.find(user => user.username === username);

  if(findUser) {
    return response.status(400).json({error: 'User with this username already exists'})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { todos } = user;

  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);
  
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const {id: todoId} = request.params;

  const findTodo = user.todos.find(todo => todo.id === todoId);

  if(!findTodo) {
    return response.status(404).json({error: 'This todo was not found'})
  }

  findTodo.title = title;
  findTodo.deadline = deadline;

  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id: todoId} = request.params;

  const findTodo = user.todos.find(todo => todo.id === todoId);

  if(!findTodo) {
    return response.status(404).json({error: 'This todo was not found'})
  }

  findTodo.done = true;

  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id: todoId} = request.params;

  const findTodo = user.todos.find(todo => todo.id === todoId);

  if(!findTodo) {
    return response.status(404).json({error: 'This todo was not found'})
  }

  user.todos = user.todos.filter(todo => todo.id !== todoId);

  return response.status(204).send();
});

module.exports = app;