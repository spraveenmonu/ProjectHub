# 🎬 MovioBot — Ultimate 3D Movie Discovery Experience

## 📁 FOLDER STRUCTURE — WHERE TO SAVE YOUR DATASETS

```
movie-chatbot/
│
├── index.html              ← Main app (open this in browser)
│
├── datasets/               ← ✅ SAVE YOUR CSV FILES HERE
│   ├── netflix_titles.csv          ← Netflix dataset from Kaggle
│   └── amazon_prime_titles.csv     ← Amazon Prime dataset from Kaggle
│
├── js/
│   ├── dataLoader.js       ← Reads & parses your CSV files
│   └── chatbot.js          ← Chatbot logic & filtering
│
└── css/                    ← (CSS is embedded in index.html)
```

---

## 📂 DATASET FILE NAMES (EXACT NAMES REQUIRED)

| Platform      | Kaggle Dataset               | Save As                      |
|---------------|------------------------------|------------------------------|
| Netflix       | netflix_titles.csv           | `datasets/netflix_titles.csv` |
| Amazon Prime  | amazon_prime_titles.csv      | `datasets/amazon_prime_titles.csv` |

> **Important**: The filenames must match exactly as shown above!

---

## 🚀 HOW TO RUN

### Option A — Simple (Python server):
```bash
cd movie-chatbot
python3 -m http.server 8080
# Open: http://localhost:8080
```

### Option B — Node.js:
```bash
cd movie-chatbot
npx serve .
# Open the URL shown in terminal
```

### Option C — VS Code:
Install the **Live Server** extension → Right-click `index.html` → Open with Live Server

> ⚠️ Must use a local server (not file://) so the CSV files can be loaded!

---

## 🎯 FEATURES

- 🤖 Conversational chatbot with step-by-step filters
- 🎬 Filters: Platform → Type → Genre → Language
- 🃏 Beautiful animated movie cards with click-to-detail modal
- 📊 Sidebar with dataset stats and quick genre filters
- 🌈 Cinematic dark UI with glowing animations
- ✅ Works with both Netflix + Amazon Prime datasets simultaneously

---

## 🔍 KAGGLE DATASET LINKS

- Netflix: https://www.kaggle.com/datasets/shivamb/netflix-shows
- Amazon Prime: https://www.kaggle.com/datasets/shivamb/amazon-prime-movies-and-tv-shows

