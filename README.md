# Draw & Guess Multiplayer Game

A real-time, full-stack multiplayer drawing game built with the MERN stack (MongoDB skipped for in-memory state).

## Features
- 🎨 **Real-time Drawing**: Fluid canvas synchronization using Socket.io.
- 💬 **Smart Guessing**: Guess words in chat; points awarded for speed and accuracy.
- 🕒 **Turn-based Logic**: Automatic turn rotation and round management.
- 🏆 **Scoreboard**: Live ranking of players.
- 💡 **Hints**: Automatic hints (first letter) if no one guesses for 30 seconds.
- ✨ **Premium UI**: Modern dark theme with smooth animations and confetti.

## Project Structure
- `client/`: React frontend (Vite)
- `server/`: Node.js + Express + Socket.io backend

## Local Setup
1. **Server**: `cd server && npm install && npm run dev`
2. **Client**: `cd client && npm install && npm run dev`

## Deployment
- Frontend: Vercel
- Backend: Render

Detailed instructions can be found in the [walkthrough.md](./walkthrough.md) artifact.
