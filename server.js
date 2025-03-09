
const cors = require('cors');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'simplenodeapi.db');

async function initializeDatabase() {
    try {
        db = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        });
        app.listen(3000,async () => {
          console.log(`Server Running at http://localhost:3000/`);
        });
      } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
      }
}

initializeDatabase();


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/tasks', async (req, res) => {
    const {name, description, status} = req.body;
    let id = uuidv4();
    let query = `INSERT INTO tasktable (id,name, descri, status) VALUES (?, ?, ?, ?);`;
    let option = [id, name, description, status];
    try {
        const result = await db.run(query, option);
        res.status(201).send(result);
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
})


app.get('/tasks', async (req, res) => {
    let query = `SELECT * FROM tasktable limit 10 offset ${(req.query.page - 1) * 10};`;
    try {
        let result = await db.all(query);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
})

app.get('/tasks/:id', async (req, res) => {
    let id = req.params.id;
    let query = `SELECT * FROM tasktable WHERE id = ?;`;
    try {
        let result = await db.get(query, id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).send(error);
    }
})  

app.delete('/tasks/:id', async (req, res) => {
    let id = await req.params.id;
    let query = `DELETE FROM tasktable WHERE id = ?;`;
    try {
        let result = await db.run(query, id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).send(error);
    }
})

app.put('/tasks/:id', async (req, res) => {
    let id = await req.params.id;
    let {status} = req.body;
    let query = `UPDATE tasktable SET status = ? WHERE id = ?;`;
    try {
        let result = await db.run(query, [status, id]);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).send(error);
    }
})
