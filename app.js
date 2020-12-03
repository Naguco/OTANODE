var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var multer = require('multer');

const upload = multer({
    dest: 'public/' // this saves your file into a directory called "uploads"
});

var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json({}));

app.use(serveStatic(path.join(__dirname, 'public')));

app.get("/latestVersion", (req, res) => {
    latestVersion = require('./public/latestVersion.json');
    res.status(200).send(String(latestVersion.latestVersion));
});

app.post("/newVersion", upload.single('file-to-upload'), (req, res) => {
    let body = req.body;

    let numeroVersion = body.newVersion;

    latestVersion = require('./public/latestVersion.json');
    if (latestVersion.latestVersion >= body.newVersion) {
        return res.status(403);
    }

    fs.unlinkSync('./public/' + latestVersion.latestVersion + '.bin');

    let newData = new Object({ "latestVersion": body.newVersion });

    let data = JSON.stringify(newData);
    console.log(data);
    fs.writeFileSync('./public/latestVersion.json', data);

    fs.renameSync('./public/' + req.file.filename, './public/' + req.file.originalname);

    return res.status(200).send(body.newVersion);
});

app.get('/latestFileVersion', (req, res) => {
    latestVersion = require('./public/latestVersion.json');
    res.sendFile(__dirname + '/public/' + latestVersion.latestVersion + '.bin');
});

app.get('/', (req, res) => {
    res.status(200).send("OTA NODE");
});

app.listen(process.env.PORT || 3000);