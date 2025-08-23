# IMPLEMENTATION.md

Dieses Dokument beschreibt konkrete Schritte zur **Implementierung** des KI-Assistenten-Projekts auf **Netcup Webhosting 4000**.  
Es ergänzt das Deployment-Konzept (siehe `README.md`) mit technischen Details, Setup-Anleitungen und Code-Snippets.

---

## 1. Projektsetup

### Repository-Struktur
```bash
ai-platform/
├─ apps/
│  ├─ web/       # Next.js (Frontend)
│  ├─ api/       # FastAPI (Backend)
│  └─ watch/     # WearOS Companion (später)
├─ infra/
│  ├─ netcup/    # Deployment-Skripte für Netcup
│  └─ mysql/     # Alembic Migrationen
├─ .github/      # CI/CD
└─ README.md
```

### Initiales Setup
```bash
# Repo klonen
git clone git@github.com:username/ai-platform.git
cd ai-platform

# Node.js installieren (>=18)
npm install -g pnpm

# Next.js Web-App initialisieren
pnpm create next-app apps/web

# Python venv für FastAPI
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn mysqlclient sqlalchemy alembic
```

---

## 2. Frontend (Next.js, PWA)

### Dependencies
```bash
cd apps/web
pnpm add tailwindcss shadcn-ui @headlessui/react @heroicons/react
pnpm add axios swr
```

### Static Export (Netcup kompatibel)
```jsonc
// next.config.js
module.exports = {
  output: 'export',
};
```

### Build
```bash
pnpm build
pnpm export
# Output in /out → per FTP/SCP nach /public_html hochladen
```

---

## 3. Backend (FastAPI auf Netcup)

### Passenger Setup
Datei: `apps/api/wsgi.py`
```python
from main import app as application
```

Datei: `.htaccess`
```
PassengerEnabled on
PassengerPython /home/<user>/apps/api/venv/bin/python3
PassengerAppRoot /home/<user>/apps/api
```

### Beispiel `main.py`
```python
from fastapi import FastAPI
from routers import chats

app = FastAPI()

@app.get("/healthz")
def health():
    return {"status": "ok"}

app.include_router(chats.router, prefix="/chats")
```

### Chats Router (`routers/chats.py`)
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_chats():
    return [{"id": 1, "title": "Demo Chat"}]
```

---

## 4. MySQL & Alembic

### Engine Setup (`db.py`)
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql://user:pass@localhost/dbname"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Migration erzeugen
```bash
alembic init migrations
alembic revision --autogenerate -m "init schema"
alembic upgrade head
```

---

## 5. Provider-Anbindung

### Beispiel OpenAI Adapter
```python
import openai

async def call_openai(prompt: str):
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    for chunk in resp:
        if "content" in chunk["choices"][0]["delta"]:
            yield chunk["choices"][0]["delta"]["content"]
```

---

## 6. CI/CD (GitHub Actions)

Datei: `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Web
        run: |
          cd apps/web
          pnpm install
          pnpm build && pnpm export

      - name: Deploy Web via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          local-dir: apps/web/out/
          server-dir: /public_html/

      - name: Deploy API via SCP
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          source: "apps/api/*"
          target: "/home/${{ secrets.FTP_USER }}/apps/api"
```

---

## 7. Nächste Schritte

1. Basis-Frontend + API deployen → Healthcheck erreichbar  
2. Auth implementieren (Magic-Link/Passkeys)  
3. Chat-CRUD + Speicherung in MySQL  
4. Provider-Adapter (OpenAI) anbinden  
5. Streaming via SSE  
6. PWA optimieren (Offline-Shell, Installierbar)  
7. Voice (STT/TTS)  
8. WearOS Companion-App  
