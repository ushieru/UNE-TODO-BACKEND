const express = require('express')
const cors = require('cors')
const app = express()
const port = 3300

const todoList = [{
    id: Date.now(),
    task: 'Tarea Prueba'
}]


app.use(cors({
    origin: '*'
}))

app.use(express.json())

app.get('/', (request, response) => {
    response.send({ ok: 'ok' })
})

app.get('/todos', (request, response) => {
    response.json({ todos: todoList })
})

app.post('/todo', (request, response) => {
    const { task } = request.body;
    if (!task) response.status(400).json({ error: 'No agregaste una tarea' });
    todoList.push({
        id: Date.now(),
        task: task
    })
    response.json({ ok: 'ok' });
})

app.listen(port, () => {
    console.log('[Server] App listening at localhost:' + port)
})
