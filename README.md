# Pet Cat Discord Bot

A Discord bot that lets users create and take care of virtual pet cats. Users can manage their pet's needs like food, water, sleep, and more.

## Features

- Create your own virtual pet cat
- Take care of your pet's various needs:
  - Water
  - Food
  - Sleep
  - Play
  - Shower
  - Toilet
- Pet health and level system
- Pet statistics management

## Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/pet-cat-discord-bot.git
cd pet-cat-discord-bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `config.json` file in the root directory with your Discord bot token:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN"
}
```

4. Set up Firebase
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Configure your Firebase credentials in the firebase.js file

5. Deploy the commands to your Discord server
```bash
node deploy-commands.js
```

6. Start the bot
```bash
node index.js
```

## License

ISC 