# ♟ Chess App

Interactive chess game built using **React** with clean UI and core chess logic implemented from scratch.

---

## 🚀 Live Demo

🔗 https://chess-three-rouge.vercel.app

---

## 🧠 Features

* ♟ Full chessboard with all pieces
* 🔄 Turn-based gameplay (White vs Black)
* ✅ Valid move highlighting
* 🚫 Illegal move filtering
* ⚠️ Check detection
* 🏁 Checkmate detection
* 📜 Move history tracking
* 🎯 Captured pieces tracking (separate for both players)
* ♻️ Restart game functionality
* 🎨 Clean and responsive UI

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** CSS (Custom)
* **State Management:** React Hooks
* **Testing:** Jest
* **Deployment:** Vercel

---

## 📂 Project Structure

```
Project_2nd_Sem/
│
├── Backend/
│   └── Server.js
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Board/
│   │   │   └── Square/
│   │   ├── features/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   │   └── useChess.js
│   │   │   ├── logic/
│   │   │   │   ├── moveGenerator.js
│   │   │   │   └── checkUtils.js
│   │   │   └── utils/
│   │   │       └── pieceMap.js
│   │   ├── test/
│   │   │   └── test.test.js
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/sachin1199/chess.git
cd chess
```

### 2. Install frontend dependencies

```bash
cd Frontend
npm install
```

### 3. Run the app locally

```bash
npm run dev
```

---

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

---

## 🧪 Run Tests

```bash
npm test
```

---

## 🚀 Deployment

Deployed using Vercel

```bash
git add .
git commit -m "update"
git push origin main
```

---

## 🎯 Future Improvements

* 🤖 AI opponent
* 🌐 Multiplayer (online gameplay)
* 🎞️ Piece movement animations
* 🔊 Sound effects
* ♜ Castling, En Passant, Promotion UI
* 📱 Mobile responsiveness improvements

---

## 👨‍💻 Author

**Sachin**
