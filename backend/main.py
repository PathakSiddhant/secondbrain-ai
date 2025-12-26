from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to SecondBrain AI API", "status": "Active"}

@app.get("/health")
def health_check():
    return {"status": "ok"}