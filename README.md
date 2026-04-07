# 🎭 Guess Who Multiplayer

A beautifully designed multiplayer web and desktop game where players ask yes/no questions to guess each other's chosen famous person. Available as both a responsive web application and a native desktop app!

## ✨ Features

- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🖥️ **Cross-Platform**: Works on web browsers and as a desktop app (Windows, macOS, Linux)
- 👥 **Room System**: Create private rooms or join existing ones
- ⚡ **Real-time**: Instant communication between players
- 📱 **Responsive**: Optimized for desktop, tablet, and mobile
- 🎯 **Turn-based**: Clear turn indicators and game flow
- 📝 **Question History**: Track all questions and answers
- 🏆 **Win Detection**: Automatic winner announcement

## 🎮 How to Play

1. **Create a Room** or **Join an Existing Room** using a room code
2. Each player thinks of a famous person (actor, musician, athlete, etc.)
3. Take turns asking yes/no questions about the opponent's person
4. Answer questions honestly
5. Make a guess when you think you know who it is
6. First to guess correctly wins!

## 🚀 Getting Started

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

## 🌐 Web Version

### Local Development

```bash
npm run dev  # Development server with auto-restart
# or
npm start    # Production server
```

Then open `http://localhost:3000` in your browser.

### Free Hosting on Render.com

1. **Create a GitHub Repository:**
   - Push your code to GitHub (see Git setup below)
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Get your free URL (e.g., `https://guess-who-multiplayer.onrender.com`)

## 🖥️ Desktop Version (Electron)

### Run Desktop App

```bash
npm run electron-dev  # Development mode with dev tools
# or
npm run electron      # Production mode
```

### Build Desktop App

```bash
npm run dist  # Build for your current platform
```

This creates distributable packages in the `dist/` folder for:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` or `.pkg`
- **Linux**: AppImage

## 📁 Project Structure

```
guess-who-multiplayer/
├── main.js              # Electron main process
├── server.js            # Game server logic
├── package.json         # Dependencies and scripts
├── public/
│   └── index.html       # Game interface
├── README.md            # This file
├── .gitignore           # Git ignore rules
└── dist/                # Built desktop apps (after build)
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start web server
- `npm run dev` - Start web server with auto-restart
- `npm run electron` - Run desktop app
- `npm run electron-dev` - Run desktop app with dev tools
- `npm run dist` - Build desktop app for distribution

### Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express, Socket.io
- **Desktop:** Electron
- **Fonts:** Google Fonts (Inter)
- **Icons:** Font Awesome

## 🎨 Customization

### Themes
The app uses CSS custom properties for easy theming. Modify the `:root` variables in `public/index.html` to change colors:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  --secondary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
  /* ... more variables */
}
```

### Adding New Features
- Game logic is in `server.js`
- UI interactions are in `public/index.html`
- Electron configuration is in `main.js`

## 📦 Distribution

### Web Deployment
- **Free Options:** Render.com, Railway.app, Fly.io
- **Paid Options:** Heroku, DigitalOcean, AWS

### Desktop Distribution
- Built apps are in `dist/` folder
- Can be distributed as:
  - Windows: `.exe` installer
  - macOS: `.dmg` file
  - Linux: AppImage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both web and desktop versions
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the classic "Guess Who?" board game
- Built with modern web technologies
- Icons by Font Awesome
- Fonts by Google Fonts

---

**Enjoy playing Guess Who with your friends! 🎭✨**