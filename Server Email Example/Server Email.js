var nodemailer = require('nodemailer'); //grants access to send emails from server

var transporter = nodemailer.createTransport({ //stores the email account that you are emailing from
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

var mailOptions = { //the actual email being sent out
  from: 'youremail@gmail.com', //can also be '"First Last" <youremail@gmail.com>'
  to: 'myfriend@yahoo.com', //seperate emails with commas to send to multiple emails
  subject: 'Sending Email using Node.js',
  text: 'That was easy!' //text can be replaced with html:
};

transporter.sendMail(mailOptions, function(error, info){ //sends the email based on mailOptions
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
