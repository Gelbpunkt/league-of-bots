const { table } = require("table")

function remove (array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

function shuffle (a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function needsGame (req, res, next) {
    if (req.app.gameDone) {
        return res.status(500).json({"status": "error", "text": `game ended, winner is ${req.app.bots[0].name}. Send a get request to /new to restart!`});
    }
    next();
}

var appRouter = function (app) {
    function rearrange_bots(app) {
        if (app.bots.length == 4) {
            app.bots = [app.bots[1], app.bots[2], app.bots[3], app.bots[0]];
        }
        if (app.bots.length == 3) {
            app.bots = [app.bots[1], app.bots[2], app.bots[0]];
        }
        if (app.bots.length == 2) {
            app.bots = [app.bots[1], app.bots[0]];
        }
        if (app.bots.length == 1) {
            app.gameDone = true;
        }
    }

    app.get("/", function(req, res) {
        res.status(404).json({"status": "error", "text": "call an endpoint please"});
    });

    app.get("/map", needsGame, function (req, res) {
        res.status(200).json(app.map);
    });

    app.get("/turn", needsGame, function (req, res) {
        res.status(200).json(app.bots[0]);
    });

    app.get("/bots", needsGame, function (req, res) {
        res.status(200).json(app.bots);
    });

    app.get("/new", function (req, res) {
        if (!app.gameDone) {
            return res.status(500).json({"status": "error", "text": "game running"});
        }
        app.bots = [{name: "Dyno", hp: 100}, {name: "Naoko", hp: 100}, {name: "IdleRPG", hp: 100}, {name: "Rythm", hp: 100}]
        shuffle(app.bots);

        app.map = Array(40).fill(null).map(e => Array(40).fill(null));
        app.map[0][0] = app.bots[0];
        app.map[0][39] = app.bots[1];
        app.map[39][0] = app.bots[2];
        app.map[39][39] = app.bots[3];
        app.gameDone = false;
        res.status(200).json({"status": "done", "text": "game created"});
    });

    app.get("/prettymap", needsGame, function(req, res) {
        res.setHeader('Content-Type', 'text/plain');
        var text = "";
        app.bots.forEach(function (bot) {
            text = text + `${bot.name}: ${bot.hp} HP\n`;
        });
        var out = [];
        app.map.forEach(function (row) {
            var new_row = [];
            row.forEach(function (column) {
                if (column == null) {
                    new_row.push(" ");
                }
                else {
                    new_row.push(column.name);
                }
            });
            out.push(new_row);
        });
        text = text + table(out);
        res.status(200).send(text);
    });

    app.post("/move", needsGame, function (req, res) {
        var direction = req.body.direction;
        var action = req.body.action;
        var bot = req.body.bot;
        if (bot != app.bots[0].name) {
            return res.status(403).json({"status": "error", "text": "not your move yet"});
        }
        if (!["North", "South", "West", "East"].includes(direction)) {
            return res.status(500).json({"status": "error", "text": "not a valid direction"});
        }
        if (!["Attack", "Move"].includes(action)) {
            return res.status(500).json({"status": "error", "text": "not a valid action"});
        }
        if (req.action == "Recover") {
            var heal = Math.floor(Math.random() * 10) + 5;
            app.bots[0].hp = app.bots[0].hp + heal;
            if (app.bots[0].hp > 100) {
                app.bots[0].hp = 100;
            }
            res.status(200).json({"status": "done", "text": `recovered ${heal} hp`, "info": "hp cap at 100 points"});
            rearrange_bots(app);
            return;
        }
        loop:
            for(var i=0; i<40; i++) {
        loop2:
                for(var j=0; j<40; j++) {
                    if (app.map[i][j]) {
                        if (app.map[i][j].name == bot) {
                            var y = i;
                            var x = j;
                            break loop;
                        }
                    }
                }
            }
        old_x = x;
        old_y = y;
        if (direction == "North" && y != 0) {
            y = y - 1;
        }
        if (direction == "South" && y != 39) {
            y = y + 1;
        }
        if (direction == "West" && x != 0) {
            x = x - 1;
        }
        if (direction == "East" && x != 39) {
            x = x + 1;
        }
        if (action == "Move") {
            if (app.map[y][x]) {
                res.status(500).json({"status": "error", "text": "can't move on enemy"});
            }
            else {
                app.map[old_y][old_x] = null;
                app.map[y][x] = app.bots[0];
                res.status(200).json({"status": "done", "text": `moved to ${x}, ${y}`});
            }
        }
        else {
            if (app.map[y][x]) {
                var dmg = Math.floor(Math.random() * 20) + 1;
                app.map[y][x].hp = app.map[y][x].hp - dmg;
                if (app.map[y][x].hp > 0) {
                    res.status(200).json({"status": "done", "text": `hit ${app.map[y][x].name} for ${dmg} damage`});
                }
                else {
                    remove(app.bots, app.map[y][x]);
                    app.map[y][x] = null;
                }
            }
            else {
                res.status(500).json({"status": "error", "text": "nothing to attack"});
            }
        }
        rearrange_bots(app);
    });
}

module.exports = appRouter;
