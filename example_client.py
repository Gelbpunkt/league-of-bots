import asyncio
import aiohttp
import random
from math import hypot

class Bot():

    def __init__(self, name):
        self.session = aiohttp.ClientSession()
        self.name = name
        self.map = {}
        self.pos = [0, 0]
        self.enemies = []

    async def post_move(self, action, direction):
        while True: # try as often as needed, lol
            async with self.session.post("https://league.travitia.xyz/move", data={"action": action, "direction": direction, "bot": self.name}) as r:
                try:
                    return await r.json()
                except:
                    await asyncio.sleep(1) # it is overrequested rn so lets wait

    async def wait_until_my_move(self):
        while True:
            async with self.session.get("https://league.travitia.xyz/turn") as r:
                try:
                    data = await r.json()
                    if data["name"] == self.name:
                        return
                except:
                    pass
            await asyncio.sleep(random.randint(2, 5))

    async def update_map(self):
        updated = False
        while not updated:
            async with self.session.get("https://league.travitia.xyz/map") as r:
                try:
                    self.map = await r.json()
                    updated = True
                except:
                    await asyncio.sleep(1)

    def update_data(self):
        self.enemies = []
        for y in range(1, 40):
            for x in range(1, 40):
                if self.map[y][x] != None:
                    if self.map[y][x]["name"] == self.name:
                        self.pos = [x, y]
                    else:
                        self.enemies.append([x, y])

    def get_nearest_enemy_position(self):
        distances = [hypot(enemy[0] - self.pos[0], enemy[1] - self.pos[1]) for enemy in self.enemies]
        return self.enemies[distances.index(min(distances))]

    def get_move(self, target_pos):
        distances = [target_pos[0] - self.pos[0], target_pos[1] - self.pos[1]] # x, y distances
        abs_vals = [abs(i) for i in distances]
        print(abs_vals, target_pos)
        if (abs_vals[1] == 0 and abs_vals[0] == 1) or (abs_vals[1] == 1 and abs_vals[0] == 0):
            for i, item in enumerate(distances):
                if i == 0 and item > 0:
                    return ("Attack", "East")
                elif i == 0 and item < 0:
                    return ("Attack", "West")
                elif i == 1 and item > 0:
                    return ("Attack", "South")
                elif i == 1 and item < 0:
                    return ("Attack", "North")
        target = distances[abs_vals.index(max(abs_vals))]
        if target == distances[0] and target > 0:
            return ("Move", "East")
        elif target == distances[0] and target < 0:
            return ("Move", "West")
        elif target == distances[1] and target > 0:
            return ("Move", "South")
        elif target == distances[1] and target < 0:
            return ("Move", "North")

    async def run(self):
        game_ended = False
        print(f"Runnning as {self.name}...")
        while not game_ended:
            print("Waiting for my turn...")
            await self.wait_until_my_move()
            print("Updating map...")
            await self.update_map()
            print("Updating data...")
            self.update_data()
            print("Getting target...")
            target = self.get_nearest_enemy_position()
            print("Getting move...")
            move = self.get_move(target)
            print(move)
            await self.post_move(move[0], move[1])
            print("---------------------")

async def main():
    bot = Bot("Rythm")
    await bot.run()

loop = asyncio.get_event_loop()
loop.run_until_complete(main())