# ProjectHub — Developer Dashboard

A premium, localized developer cockpit for organizing, exploring, and launching all projects under `D:\Projects\Spraveenmonu`.

## Features
- **Auto-Discovery**: Dynamically scans directory folders, calculates sizes (skipping `node_modules`/`venv` folders), reads HEAD branch, and analyzes templates (Vite, React, Python/Flask, Static HTML, etc.).
- **Launchpad**: Start web servers (Python Flask/Express) or spin up static file servers for pure-frontend sites on dynamic ports, and read log outputs in real-time.
- **IDE & Explorer Links**: Open project folders in VS Code (`code .`) or File Explorer with a single click.
- **Creator Studio**: Bootstrap new projects directly using custom boilerplate templates.
- **Premium UI**: Glassmorphic dark theme, quick filters, charts, drawer-details panel, and retro log terminal.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Dashboard**:
   ```bash
   npm start
   ```

3. **Access the Dashboard**:
   Open [http://localhost:4200](http://localhost:4200) in your web browser.
