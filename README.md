# Vero

Conversational Assistant app leveraging OpenAI Whisper.

This repository contains an initial iOS application and a Python backend.

## iOS App

The SwiftUI application records audio, sends it to the backend for transcription
using OpenAI Whisper, and plays back the response using text‑to‑speech. The app
communicates with a FastAPI server which manages vector search with FAISS and
stores interactions in MongoDB.

The iOS source is located in `ios/VeroApp`.

## Backend Server

The backend lives in the `server` directory. It exposes two endpoints:

- `/transcribe` – accepts an audio file and returns the Whisper transcript.
- `/chat` – performs a chat completion using OpenAI and stores context in FAISS
  and MongoDB.

Install dependencies and run the server:

```bash
pip install -r server/requirements.txt
python server/main.py
```

Replace `YOUR_OPENAI_API_KEY` in `server/main.py` with your API key.

## Building the iOS App

Open the project in Xcode and run it on a device or simulator. The app expects
the backend server to be running locally on port `8000` or adjust the URL in
`NetworkManager.swift`.
