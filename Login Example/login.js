var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

class Employee {
    constructor(name) {
        this._name = name;
    }
    static generatePassword() {
        const password = Math.floor(Math.random()*10);
        return password;
    }
    get name() {
        return this._name;
    }
}

var customer = [];
var customerPassword = [];

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
    for(var i=0;i<customer.length;i++) {
        if(username && password) {
            if(username == customer[i]) {
                if(password == customerPassword[i]) {
                    request.session.loggedin = true;
                    response.redirect('/home');
                } else {
                    response.redirect('/');
                }
            } else {
                response.redirect('/');
            }
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    }
});

app.get('/newUser', function(request, response) {
    response.sendFile(path.join(__dirname + '/newUser.html'));
});

app.post('/newUserInput', function(request, response) {
    customer.push(request.body.username);
    customerPassword.push(request.body.password);
    response.redirect('/');
})

app.get('/home', function(request, response) {
    if(request.session.loggedin) {
        response.send('You are in!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.listen(8080);