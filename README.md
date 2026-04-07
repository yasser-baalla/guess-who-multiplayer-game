# Guess Who Game - Player Edition

A multiplayer web-based version of the classic Guess Who game where players ask yes/no questions to guess each other's chosen famous person.

## How to Play

1. Two players join the same room using a shared Room ID
2. Each player thinks of a famous person (actor, musician, athlete, etc.)
3. Players take turns asking yes/no questions about the opponent's person
4. The game continues until one player correctly guesses the other's person

## Features

- Real-time multiplayer gameplay
- Room-based game sessions
- Turn-based question asking and answering
- Question history tracking
- Automatic turn management

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and go to `http://localhost:3000`

## Deployment

### Free Hosting on Render.com

1. **Create a GitHub Repository:**
   - Go to GitHub and create a new repository
   - Push your code to the repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/yourusername/guess-who-game.git
     git push -u origin main
     ```

2. **Deploy on Render.com:**
   - Go to [render.com](https://render.com) and sign up for a free account
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name:** guess-who-game (or any name you prefer)
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Click "Create Web Service"
   - Wait for deployment to complete (usually takes 2-3 minutes)
   - Your app will be available at `https://your-app-name.onrender.com`

3. **Share the Game:**
   - Share the Render URL with your friends
   - Players can join the same room using any room ID you agree on

### Alternative Free Hosting Options

- **Railway.app**: Similar to Render, free tier available
- **Fly.io**: Another good option with a free tier
- **Heroku**: Free tier discontinued, but you can use their eco plan ($5/month)

### Local Testing

To test locally before deploying:

```bash
npm install
npm run dev  # For development with auto-restart
# or
npm start    # For production
```

Then open `http://localhost:3000` in your browser.

## Technologies Used

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** HTML, CSS, JavaScript
- **Real-time Communication:** WebSockets via Socket.io

## Game Rules

- Players must ask questions that can be answered with "yes" or "no"
- Questions should be about characteristics of the person (appearance, profession, nationality, etc.)
- Players can make a guess at any time during their turn
- The game ends when one player correctly guesses the other's person
- Be honest when answering questions!

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.