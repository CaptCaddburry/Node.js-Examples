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

var jcadd = new Employee('Jimmy');
var jcaddPassword = 1; //Math.floor(Math.random()*10);

var http = require('http');
var formidable = require('formidable');

http.createServer(function(req,res) {
    if(req.url != '/') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, file) {
            if(fields.userid == jcadd.name) {
                if(fields.pass == jcaddPassword) {
                    res.write('You are in!');
                    res.end();
                } else {
                res.write('Password is Incorrect!');
                res.end();
                }
            } else {
            res.write('Username is Incorrect!');
            res.end();
            }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="submitID">Username: <input type ="text" id ="userid" name ="userid"><br>'); //username
        res.write('Password: <input type ="text" id ="pass" name ="pass"><br>'); //password
        res.write('<input type="submit">'); //submit button
        res.write('</form>');
    }
}).listen(8080);
