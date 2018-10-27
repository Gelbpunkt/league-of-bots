import asyncio
import aiohttp
import random

class Bot():

    def __init__(self, name):
        self.name = name
        self.session = aiohttp.ClientSession()

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

    async def run(self):
        while True:
            await self.wait_until_my_move()
            action = random.choice(["Recover", "Move", "Attack"])
            direction = random.choice(["North", "South", "West", "East"])
            await self.post_move(action, direction)
            await asyncio.sleep(3)


async def main():
    bot = Bot("IdleRPG")
    await bot.run()

loop = asyncio.get_event_loop()
loop.run_until_complete(main)
