var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

var transporter = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
        user: user,
        pass: pass
    }
});

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function(error, html) {
        if(error) {
            throw error;
            callback(error);
        } else {
            callback(null, html);
        }
    });
};

var authenticationNumber;

var verified = false;

var connection = mysql.createConnection({
    host: host,
    port: port,
    user: user,
    password: password,
    database: database
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
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ? AND verify = 1', [username, password], function(error, results, fields) {
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
    authenticationNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    connection.query('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?)', [firstName, age, email, username, password, authenticationNumber, verified]);
    readHTMLFile(__dirname + '/email.html', function(error, html) {
        var template = handlebars.compile(html);
        var replacements = {
            username: firstName,
            verifyCode: authenticationNumber
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
            from: user,
            to: String(email),
            subject: 'Please Verify Your Account!',
            html: htmlToSend
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if(err) {
                console.log(err);
            } else {
                console.log(info.response);
            }
        });
    });
    response.redirect('/send');
});

app.get('/backButton', function(request, response) {
    response.redirect('/');
});

app.post('/verify', function(request, response) {
    var email = request.body.email;
    var verify = request.body.verify;
    connection.query('SELECT * FROM accounts WHERE email = ? and authentication = ?', [email, verify], function(error, results, fields) {
        if(results.length != 0) {
            verified = true;
            connection.query('UPDATE accounts SET verify = ? WHERE email = ?', [verified, email]);
            response.redirect('/');
        } else {
            response.redirect('/send');
        }
    });
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
