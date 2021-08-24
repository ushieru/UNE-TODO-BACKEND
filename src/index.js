const express = require('express')
const cors = require('cors')
const port = 3300
const cluster = require('cluster')
const totalCPUS = require('os').cpus().length
const fs = require('fs')
const path = require('path')
const PATH = path.join(__dirname, "database.json")

const addTask = (task) => {
    if (fs.existsSync(PATH)) {
        const content = fs.readFileSync(PATH)
        let json = JSON.parse(content)
        json.push(task)
        fs.writeFileSync(PATH, JSON.stringify(json))
    } else {
        fs.writeFileSync(PATH, '[]')
        addTask(task)
    }
}

const readTask = () => {
    if (fs.existsSync(PATH)) {
        const content = fs.readFileSync(PATH)
        return JSON.parse(content)
    } else {
        return []
    }
}

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
        response.send({ ok: 'ok', worker: process.pid })
    })

    app.get('/todos', (request, response) => {
        response.json({ worker: process.pid, todos: readTask() })
    })

    app.post('/todo', (request, response) => {
        const { task } = request.body;
        if (!task) response.status(400).json({ error: 'No agregaste una tarea' });
        addTask({
            id: Date.now(),
            task: task
        })
        response.json({ ok: 'ok' });
    })

    app.post('/todos', (request, response) => {
        const { taskArray } = request.body;
        if (!taskArray) response.status(400).json({ error: 'No agregaste una tarea' });
        taskArray.forEach(task => {
            addTask({
                id: Date.now(),
                task: task
            })
        })
        response.json({ ok: 'ok' });
    })

    app.listen(port, () => {
        console.log(`[Server ${process.pid}] App listening at localhost: ${port}`)
    })
}
