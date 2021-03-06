var http = require('http'); //grants access to HTTP module
var formidable = require('formidable'); //formidable package used for uploading files to your server
var fs = require('fs'); //grants access to the file system

http.createServer(function (req, res) { //create a server(required, resolved)
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm(); //creates a new uploaded form
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path; //this path is for the temporary folder
      var newpath = 'C:/Users/Your Name/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) { //saves the file to newpath
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080); //accessed on port 8080
