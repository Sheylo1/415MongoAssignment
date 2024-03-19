var cookieMonster = require('cookie-parser')
const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://wesleyaustin2:1ci83VF1g3thllUC@cluster0.akis8d8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.get('/',function(req,res){
    res.send(`
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Form</title>
            </head>
        <body>
            <center><h1>Login Form</h1></center>
            <form action="your_login_script.php" method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" required><br><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required><br><br>
                <input type="submit" value="Login">
            </form>
        </body>
</html>
`)

});

app.get('/setcookie', function (req, res) {
    console.log('setcookie');
    res.cookie('name', 'Abcd') //Sets name = Abcd, no expiration
    res.cookie('cook2', 'xyz', {maxAge : 20000});  //Sets cook2 = xyz expiring in 20 seconds 
  // Additional notes:
  // The following sets cook2 = xyz, no expiration, but prevents client-side script access to the cookie 
  // res.cookie('cook2', 'xyz', {HttpOnly: true});  //no expiration; prevents client-side script access  
  // The following sets cook2 = xyz expiring in 20 seconds and tells the browser to not allow client-side script access 
  // res.cookie('cook2', 'xyz', {HttpOnly: true, maxAge : 20000});  //expires; prevents client-side script access 
  
    res.send('cookies set ');  // complete sending
  });