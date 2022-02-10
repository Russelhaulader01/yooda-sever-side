const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.x89oq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        console.log('connected to db');
        const yoodaHostel = client.db("yoodaHostel");
        const allFoodsCollection = yoodaHostel.collection('allFoods')
        const allStudentCollection = yoodaHostel.collection('allStudents')
        const usersCollection = yoodaHostel.collection('users')

        // add foods
        app.post('/addFoods', async (req, res) => {
            const food = req.body
            console.log(food);
            const result = await allFoodsCollection.insertOne(food);
            res.json(result)
        })
        // add students
        app.post('/addStudents', async (req, res) => {
            const food = req.body
            console.log(food);
            const result = await allStudentCollection.insertOne(food);
            res.json(result)
        })
        /// all stu
        app.get('/allStudents', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            console.log(page, size);
            const query = allStudentCollection.find({})
            // get valu of total products item
            const items = await query.count();
            // get product skip skip from first and limit take max limit num products
            const result = await query.skip(page * size).limit(size).toArray();

            res.send({ items, result });

        })
        // single stu
        app.get('/student/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await allStudentCollection.findOne(query);
            res.json(result)
        })

        // change status
        app.post('/changeStatus', async (req, res) => {
            const updatedItemsId = req.body.updatedItemsId
            const changeTo = req.body.changeTo
            console.log(updatedItemsId);
            console.log(changeTo);
            const filter = {
                _id: {
                    $in: updatedItemsId.map(id => ObjectId(id))
                }
            }
            const updateStatus = {
                $set: { status: changeTo }
            }
            const result = await allStudentCollection.updateMany(filter, updateStatus);
            console.log(result);
            res.json(result)
        })
        // delete student
        app.post('/stuDelete', async (req, res) => {
            const id = req.body
            const filter = { _id: ObjectId(id) }
            const result = await allStudentCollection.deleteOne(filter)
            res.json(result)
        })

        // edit student info
        app.post('/stuUpdate', async (req, res) => {
            const data = req.body
            console.log(data._id);
            const filter = { _id: ObjectId(data._id) }
            const updateStatus = {
                $set: {
                    Class: data.Class,
                    age: data.age,
                    hall: data.hall,
                    name: data.name,
                    roll: data.roll,
                    status: data.status,
                    id: data.id
                }
            }
            console.log(data);
            const result = await allStudentCollection.updateOne(filter, updateStatus);
            res.json(result)
        })

        /// all stu
        app.get('/allFoods', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            console.log(page, size);
            const query = allFoodsCollection.find({})
            // get valu of total products item
            const items = await query.count();
            // get product skip skip from first and limit take max limit num products
            const result = await query.skip(page * size).limit(size).toArray();

            res.send({ items, result });

        })
        app.get('/allFoodsName', async (req, res) => {
            const query = allFoodsCollection.find({})
            const result = await query.toArray();
            res.send(result);
        })

        // single food
        app.get('/food/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await allFoodsCollection.findOne(query);
            res.json(result)
        })

        // food edit  
        app.post('/foodUpdate', async (req, res) => {
            const data = req.body
            console.log(data._id);
            const filter = { _id: ObjectId(data._id) }
            const updateStatus = {
                $set: {
                    name: data.name,
                    price: data.price,
                    id: data.id
                }
            }
            console.log(data);
            const result = await allFoodsCollection.updateOne(filter, updateStatus);
            res.json(result)
        })

        // delete student
        app.post('/foodDelete', async (req, res) => {
            const id = req.body
            const filter = { _id: ObjectId(id) }
            const result = await allFoodsCollection.deleteOne(filter)
            res.json(result)
        })


        //search by roll
        app.get('/roll/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { roll: id.toString() }
            const result = await allStudentCollection.findOne(query);
            res.json(result)
        })


        // save user
        app.post('/saveUser', async (req, res) => {
            const user = req.body
            console.log(user);
            const filter = { email: user.email }
            const updateDoc = { $set: { name: user.name } }
            const option = { upsert: true }
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        })

        //add role
        app.post('/makeAdmin', async (req, res) => {
            const email = req.body;
            const filter = { email: email.email }
            const updateUser = {
                $set: { role: 'admin' }
            }
            const result = await usersCollection.updateOne(filter, updateUser)
            res.json(result);
        })

        // check Admin role
        app.get('/checkRole/:email', async (req, res) => {
            const user = req.params.email;
            const query = { email: user }
            const result = await usersCollection.findOne(query)
            res.json(result)
        })
    } finally {

    }
} run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello')
})
app.listen(port, () => {
    console.log('listening to port', port)
})
