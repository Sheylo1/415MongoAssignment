const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://wesleyaustin2:1ci83VF1g3thllUC@cluster0.akis8d8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('Server started at http://localhost:' + port);
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let db;

client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB', err);
    } else {
        console.log('Connected to MongoDB');
        db = client.db('WesleyDB');
    }
});

// Models
class UserModel {
    constructor(db) {
        this.collection = db.collection('users');
    }

    async register(username, password) {
        try {
            const existingUser = await this.collection.findOne({ username });
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }
            await this.collection.insertOne({ username, password });
            return { success: true, message: 'Registration successful!' };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, message: 'Error registering user' };
        }
    }

    async login(username, password) {
        try {
            const user = await this.collection.findOne({ username, password });
            if (!user) {
                return { success: false, message: 'Invalid username or password' };
            }
            return { success: true, message: 'Login successful!' };
        } catch (error) {
            console.error('Error logging in:', error);
            return { success: false, message: 'Error logging in' };
        }
    }
}

class TopicModel {
    constructor(db) {
        this.collection = db.collection('topics');
    }

    async getTopics() {
        return await this.collection.find().toArray();
    }

    async createTopic(topicName) {
        await this.collection.insertOne({ name: topicName, messages: [] });
    }
}

class MessageModel {
    constructor(db) {
        this.collection = db.collection('messages');
    }

    async addMessage(topicId, message) {
        await this.collection.updateOne({ _id: ObjectId(topicId) }, { $push: { messages: message } });
    }

    async getRecentMessages(topicId, limit = 2) {
        const topic = await this.collection.findOne({ _id: ObjectId(topicId) });
        if (topic) {
            return topic.messages.slice(-limit).reverse();
        }
        return [];
    }
}

// Controllers
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userModel = new UserModel(db);
    const result = await userModel.register(username, password);
    res.send(result);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userModel = new UserModel(db);
    const result = await userModel.login(username, password);
    res.send(result);
});

app.get('/topics', async (req, res) => {
    const topicModel = new TopicModel(db);
    const topics = await topicModel.getTopics();
    res.send(topics);
});

app.post('/topics/create', async (req, res) => {
    const { topicName } = req.body;
    const topicModel = new TopicModel(db);
    await topicModel.createTopic(topicName);
    res.send('Topic created successfully');
});

app.post('/messages/add', async (req, res) => {
    const { topicId, message } = req.body;
    const messageModel = new MessageModel(db);
    await messageModel.addMessage(topicId, message);
    res.send('Message added successfully');
});

app.get('/messages/recent/:topicId', async (req, res) => {
    const { topicId } = req.params;
    const messageModel = new MessageModel(db);
    const messages = await messageModel.getRecentMessages(topicId);
    res.send(messages);
});

// Views
app.get('/register', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Register</title>
        </head>
        <body>
            <h1>Register</h1>
            <form action="/register" method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br>
                <input type="submit" value="Register">
            </form>
        </body>
        </html>
    `);
});

app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
        </head>
        <body>
            <h1>Login</h1>
            <form action="/login" method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br>
                <input type="submit" value="Login">
            </form>
        </body>
        </html>
    `);
});

app.get('/topics/create', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Create Topic</title>
        </head>
        <body>
            <h1>Create Topic</h1>
            <form action="/topics/create" method="post">
                <label for="topicName">Topic Name:</label>
                <input type="text" id="topicName" name="topicName" required><br>
                <input type="submit" value="Create Topic">
            </form>
        </body>
        </html>
    `);
});

app.get('/messages/add', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Add Message</title>
        </head>
        <body>
            <h1>Add Message</h1>
            <form action="/messages/add" method="post">
                <label for="topicId">Topic ID:</label>
                <input type="text" id="topicId" name="topicId" required><br>
                <label for="message">Message:</label>
                <input type="text" id="message" name="message" required><br>
                <input type="submit" value="Add Message">
            </form>
        </body>
        </html>
    `);
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login or Register</title>
        </head>
        <body>
            <h1>Welcome!</h1>
            <h2>Login or Register</h2>
            
            <!-- Display authentication status -->
            <p>${authMessage}</p>
            
            <form action="/login" method="post">
                <h3>Login</h3>
                <label for="login_username">Username:</label>
                <input type="text" id="login_username" name="login_username" required><br>
                <label for="login_password">Password:</label>
                <input type="password" id="login_password" name="login_password" required><br>
                <input type="submit" value="Login">
            </form>
            
            <form action="/register" method="post">
                <h3>Register</h3>
                <label for="register_username">Username:</label>
                <input type="text" id="register_username" name="register_username" required><br>
                <label for="register_password">Password:</label>
                <input type="password" id="register_password" name="register_password" required><br>
                <input type="submit" value="Register">
            </form>

            <!-- Button to navigate to Login or Register page -->
            <button onclick="window.location.href='/login'">Go to Login</button>
            <button onclick="window.location.href='/register'">Go to Register</button>
        </body>
        </html>
    `);
});


// 404 Route
app.use((req, res) => {
    res.status(404).send("Page not found");
});
