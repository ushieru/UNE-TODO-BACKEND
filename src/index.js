const express = require('express')
const cors = require('cors')
const port = 3300
const cluster = require('cluster')
const totalCPUS = require('os').cpus().length

const todoList = [{
    id: Date.now(),
    task: 'Tarea Prueba'
}]

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUS}`)
    console.log(`Master ${process.pid} is running`)

    // Fork workers
    for (let index = 0; index < totalCPUS; index++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`)
        console.log(`Let's fork another worker`)
        cluster.fork()
    })
} else {
    const app = express()

    app.use(cors({
        origin: '*'
    }))

    app.use(express.json())

    app.get('/', (request, response) => {
        asdasdasd
        response.send({ ok: 'ok', worker: process.pid })
    })

    app.get('/todos', (request, response) => {
        response.json({ worker: process.pid, todos: todoList })
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
        console.log(`[Server ${process.pid}] App listening at localhost: ${port}`)
    })
}
