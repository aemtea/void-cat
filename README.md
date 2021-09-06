# The Void
Node.js Discord Bot that acts as a medium for The Void

<img src="voidcat.png" alt="void cat" width="400"/>

## Setup
The Void is developed using using [Discord.js](https://github.com/discordjs/discord.js) which requires [Node.js 16.6.0](https://nodejs.org/en/download/current/) or newer.

The Void uses [dotenv](https://github.com/motdotla/dotenv) to manage sensitive variables. At the minimum, your `.env` file will need `TOKEN` to run.

```
TOKEN=[bot token]
CLIENT_ID=[app id]
GUILD_ID=[server id]
```

## Registering Commands
Before running the app, you should register the commands with your test server. After compiling the TypeScript files, run `deployCommands`.

```
node out/scripts/deployCommands.js
```