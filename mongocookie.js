
const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require("mongodb");


const uri = "mongodb+srv://wesleyaustin2:1ci83VF1g3thllUC@cluster0.akis8d8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('Server started at http://localhost:' + port);
});

app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());


client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB', err);
    } else {
        console.log('Connected to MongoDB');
    }
});

app.get('/', function(req, res) {
    const authCookie = req.cookies.auth;

    let authMessage = '';
    if (authCookie) {
        authMessage = 'You are authenticated.';
    } else {
        authMessage = 'You are not authenticated.';
    }

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

        <!-- Button to route to Cookie Report -->
        <a href="/cookie-report"><button>View Active Cookies</button></a>
    </body>
    </html>
    `);
});

app.post('/register', async (req, res) => {
    try {
        const database = client.db('WesleyDB'); // Change to your database name
        const users = database.collection('users');
        
        const { register_username, register_password } = req.body;
        
        const existingUser = await users.findOne({ username: register_username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        
        await users.insertOne({ username: register_username, password: register_password });
        res.send(`
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Button Example</title>
        </head>
        <body>
        Registration Successful!
            <a href="/">Back</a>
        </body>
        </html>
        `);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send(`<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Button Example</title>
        </head>
        <body>
        Error registering user, please try again.
            <a href="/">Back</a>
        </body>
        </html>Error registering user. Please try again.`);
    }
});

app.post('/login', async (req, res) => {
    try {
        const database = client.db('WesleyDB'); // Change to your database name
        const users = database.collection('users');
        
        const { login_username, login_password } = req.body;
        
        const user = await users.findOne({ username: login_username, password: login_password });
        if (!user) {
            return res.status(401).send('Invalid username or password. <a href="/">Go back</a>');
        }
        
        res.cookie('auth', 'login_cookie', { maxAge: 20000 }); // Adjust expiration time as needed
        res.send('Login successful! Authentication cookie set. <a href="/">Go back</a>');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again.');
    }
});

app.get('/cookie-report', function(req, res) {
    const cookies = req.cookies;
    let cookieList = '<h2>Active Cookies:</h2><ul>';
    for (const [name, value] of Object.entries(cookies)) {
        cookieList += `<li>${name}: ${value}</li>`;
    }
    cookieList += '</ul>';
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cookie Reporting</title>
    </head>
    <body>
        ${cookieList}
        <a href="/clear-cookies">Clear Cookies</a> | <a href="/">Home</a>
    </body>
    </html>
    `);
});


app.get('/clear-cookies', function(req, res) {
    res.clearCookie('auth');


    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cookie Cleared</title>
    </head>
    <body>
        <p>All cookies cleared.</p>
        <a href="/cookie-report">View Active Cookies</a> | <a href="/">Home</a>
    </body>
    </html>
    `);
});
