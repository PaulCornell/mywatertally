# mywatertally

A small web app for tracking how many 8-ounce glasses of water you drink each day. Click **+** when you finish a glass and **−** if you need to take one back. The app shows today's count, the total in ounces, and your last seven days.

It's an [Express](https://expressjs.com/) server that stores your tallies in a SQLite database file inside this repo (`data/watertally.db`). It runs in any modern browser on macOS, Windows, or Linux.

## Requirements

- [Node.js](https://nodejs.org/) **22.13 or later** (the current LTS release is recommended).

The app uses Node's built-in `node:sqlite` module, so there's nothing to compile and no separate database to install.

To check your Node.js version:

```sh
node --version
```

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/PaulCornell/mywatertally.git
   cd mywatertally
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

These commands work the same in Terminal (macOS), PowerShell or Command Prompt (Windows), and any Linux shell.

## Run the app

```sh
npm start
```

Then open <http://localhost:3000> in your web browser.

To stop the server, press `Ctrl+C` in the terminal where it's running.

### Use a different port

If port 3000 is already in use, set the `PORT` environment variable:

| Shell | Command |
| --- | --- |
| macOS / Linux | `PORT=8080 npm start` |
| Windows PowerShell | `$env:PORT=8080; npm start` |
| Windows Command Prompt | `set PORT=8080 && npm start` |

Then open `http://localhost:8080`.

## Your data

- Tallies are saved to `data/watertally.db`, which the app creates the first time it runs.
- The database file is listed in `.gitignore`, so your personal data stays on your machine and isn't committed to Git.
- Each day is recorded by your browser's local date, so "today" follows your own time zone.
- To start over, stop the server and delete `data/watertally.db`.
- To store the database somewhere else, set the `DB_PATH` environment variable to a file path (the same way as `PORT` above).

## Project structure

```
mywatertally/
├── server.js          # Express server and SQLite database access
├── public/
│   └── index.html     # The tracker page (HTML, CSS, and JavaScript)
├── data/              # SQLite database is created here
└── package.json
```

## API

The page talks to the server through a small JSON API. Days use the `YYYY-MM-DD` format.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/tally/:day` | Get the glass count for a day. |
| `POST` | `/api/tally/:day/increment` | Add one glass. |
| `POST` | `/api/tally/:day/decrement` | Remove one glass (never goes below 0). |
| `GET` | `/api/history/:day` | Get up to 7 recorded days on or before `:day`, newest first. |
