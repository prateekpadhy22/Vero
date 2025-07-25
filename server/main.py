from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import uvicorn
import openai
import faiss
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017")
db = client.vero
collection = db.interactions

dimension = 1536
index = faiss.IndexFlatL2(dimension)

openai.api_key = "<YOUR_OPENAI_API_KEY>"

def embed(text: str):
    response = openai.Embedding.create(input=text, model="text-embedding-ada-002")
    return np.array(response["data"][0]["embedding"], dtype=np.float32)

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    with open("temp.m4a", "wb") as f:
        f.write(audio_bytes)
    result = openai.Audio.transcribe("whisper-1", "temp.m4a")
    return result["text"]

@app.post("/chat")
async def chat(payload: dict):
    query = payload["query"]
    vector = embed(query)
    if index.ntotal > 0:
        D, I = index.search(np.array([vector]), k=5)
        history_ids = I[0]
        context = "\n".join(doc["query"] + ": " + doc["response"]
                            for i, doc in enumerate(collection.find()) if i in history_ids)
    else:
        context = ""
    messages = [{"role": "user", "content": query}]
    if context:
        messages.insert(0, {"role": "system", "content": context})
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    reply = completion["choices"][0]["message"]["content"]
    index.add(np.array([vector]))
    collection.insert_one({"query": query, "response": reply})
    return reply

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
