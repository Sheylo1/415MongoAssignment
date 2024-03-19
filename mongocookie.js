// Require necessary packages
const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require("mongodb");

// Connect to MongoDB Atlas
const uri = "mongodb+srv://wesleyaustin2:1ci83VF1g3thllUC@cluster0.akis8d8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize Express app
const app = express();
const port = 3000;

// Start server
app.listen(port, () => {
    console.log('Server started at http://localhost:' + port);
});

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// Connect to MongoDB
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB', err);
    } else {
        console.log('Connected to MongoDB');
    }
});

// Homepage route
app.get('/', function(req, res) {
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
    </body>
    </html>
    `);
});

// Register route
app.post('/register', async (req, res) => {
    try {
        const database = client.db('WesleyDB'); // Change to your database name
        const users = database.collection('users');
        
        // Extract username and password from request body
        const { register_username, register_password } = req.body;
        
        // Check if the username already exists in the database
        const existingUser = await users.findOne({ username: register_username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        
        // If username doesn't exist, insert the new user into the database
        await users.insertOne({ username: register_username, password: register_password });
        res.send('Registration successful!');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user. Please try again.');
    }
});

// Route to set cookies
app.get('/setcookie', function (req, res) {
    console.log('setcookie');
    res.cookie('name', 'Abcd'); // Sets name = Abcd, no expiration
    res.cookie('cook2', 'xyz', { maxAge: 20000 }); // Sets cook2 = xyz expiring in 20 seconds
    res.send('Cookies set '); // Complete sending
});
