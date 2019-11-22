var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secureConnection: false,
    secure: true,
    ignoreTLS: false,
    requireTLS: true,
    auth: {
        user: 'cadd.enterprises@outlook.com',
        pass: 'Sciencerocks00!'
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

var authenticationNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;

var verified = false;

var name;

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'Sciencerocks00!',
    database: 'nodelogin'
});

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if(username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if(results.length != 0) {
                request.session.loggedin = true;
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/newUser', function(request, response) {
    response.sendFile(path.join(__dirname + '/newUser.html'));
});

app.post('/newUserInput', function(request, response) {
    var firstName = request.body.firstName;
    var age = request.body.age;
    var email = request.body.email;
    var username = request.body.username;
    var password = request.body.password;
    verified = false;
    name = username;
    var sql = 'INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?)';
    var inputs = [firstName, age, email, username, password, verified];
    connection.query(sql, inputs);
    var mailOptions = {
        from: 'cadd.enterprises@outlook.com',
        to: email,
        subject: 'Please Verify Your Account!',
        text: authenticationNumber
    };
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
    response.redirect('/send');
});

app.get('/backButton', function(request, response) {
    response.redirect('/');
});

app.post('/verify', function(request, response) {
    var verify = request.body.verify;
    if(verify == authenticationNumber) {
        verified = true;
        var sql = 'UPDATE accounts SET verify = ? where username = ?';
        var inputs = [verified, name];
        connection.query(sql, inputs);
        response.redirect('/');
    } else {
        response.redirect('/send');
    }
});

app.get('/send', function(request, response) {
    response.sendFile(path.join(__dirname + '/verify.html'));
});

app.get('/home', function(request, response) {
    if(request.session.loggedin) {
        response.send('You are in!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(8080);
