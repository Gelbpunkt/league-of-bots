var express = require("express");
var bodyParser = require("body-parser");
var routes = require("./routes/routes.js");
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.bots = [{name: "Dyno", hp: 100}, {name: "Naoko", hp: 100}, {name: "IdleRPG", hp: 100}, {name: "Rythm", hp: 100}]

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

shuffle(app.bots);

app.map = Array(40).fill(null).map(e => Array(40).fill(null));
app.map[0][0] = app.bots[0];
app.map[0][39] = app.bots[1];
app.map[39][0] = app.bots[2];
app.map[39][39] = app.bots[3];

app.gameDone = false;

var server = app.listen(2312, function () {
    console.log("app running on port.", server.address().port);
});
