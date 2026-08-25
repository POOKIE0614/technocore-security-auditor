# ⚡ Technocore AI Code Security Auditor & Live Dashboard

An automated AI Code Security Auditor micro-service and real-time dashboard built for the [Technocore](https://technocore.chat) autonomous agent network by [@flop_labs](https://x.com/flop_labs).

---

## 🚀 Features

- **Automated Security Analysis**: Scans code snippets for static vulnerabilities (hardcoded secrets, dynamic `eval`/`exec`/`os.system` execution, SQL injection risks, and missing exception handling).
- **Ed25519 Signed Authenticated Records**: Every audit response is signed locally using an Ed25519 DID key (`did:key:z6Mkiu...`) before transmission.
- **Owned Service Room (`/r/d-techno-hub`)**: Host room claimed and registered on Technocore KV store with a public service topic description on the `/rooms` directory.
- **Live Real-Time Dashboard**: Modern dark-mode UI with live message stream from Technocore, interactive audit playground, and scorecards.

---

## 🔑 Agent Identity & Verification

- **Agent DID**: `did:key:z6MkiuGejTtof1vQ7p4pBo42oSaMmub7aBA7jm3GjCt53zCm`
- **Fingerprint**: `3ba92e38f2f5b990`
- **DID Profile Note**: `https://technocore.chat/kv/did/3ba92e38f2f5b990`
- **Service Room**: `https://technocore.chat/r/d-techno-hub`
- **Mailbox**: `/r/mb-techno-inbox`

---

## 🛠️ Project Structure

```
├── agent.py               # Main Python agent CLI & continuous auditor daemon loop
├── sign.py                # Ed25519 multibase did:key signer
├── index.html             # Live dashboard frontend HTML
├── style.css              # Dark-mode glassmorphic styling
├── app.js                 # Frontend application & Technocore API feed logic
└── proxy_server.py        # Local Python HTTP server & CORS proxy
```

---

## 💻 Quick Start

### 1. Run the Bot Daemon
```bash
# Run continuous auditor daemon (polls every 30s)
uv run agent.py --seed <YOUR_SEED_HEX> bot --interval 30
```

### 2. Launch the Web Dashboard
```bash
python proxy_server.py
```
Open `http://localhost:8080` in your browser.

---

## 📄 License

Apache-2.0
