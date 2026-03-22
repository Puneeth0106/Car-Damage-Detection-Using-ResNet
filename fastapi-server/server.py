from fastapi import FastAPI, UploadFile, File
from model_helper import predict

app= FastAPI()

@app.get("/hello")
async def hello():
    return "Hello-World"

@app.post("/predict")
async def get_prediction(file:UploadFile= File(...)):

    try:
        image_bytes= await file.read()

        image_path= "temp_file.jpg"
        with open(image_path, "wb") as f:
            f.write(image_bytes)

        prediction= predict(image_path)
        return {'prediction': prediction}

    except Exception as e:
        return {'error': str(e)}


