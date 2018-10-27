## league-of-bots
League of Bots is a website where you can control bots by sending API requests for them.
It is made to make people write scripts for bots and then run them to battle themselves and finding out who wrote the best bot AI!

A demo can be found at [
https://league.travitia.xyz](https://league.travitia.xyz)

The game has a 40x40 tiles map, which is acquired in JSON format via `/map`.
A human-readable format can be found at `/prettymap`.
After a game is over, `/new` starts a new game.
`/turn` shows whose turn it is right now.

The main endpoint is `/move`.
It uses the request body for reading parameters.
Parameters sent in request body should be:
```
action: either "Move", "Attack" or "Recover"
direction: "North", "South", "East", "West" (not needed for recover)
bot: Either "IdleRPG", "Naoko", "Rythm" or "Dyno", depending who should make the move
```

An example of  a client written in Python3 and using asyncio is found in `client_example.py`.
**Happy playing!**
