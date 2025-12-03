from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import io
from core import process_mockup

app = FastAPI(title="TeeJutsu Backend API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TeeJutsu Backend API", "status": "running"}

@app.post("/overlay")
async def create_overlay(
    main_image: UploadFile = File(...),
    logo_image: UploadFile = File(...),
    config: str = Form(...)
):
    """
    Process mockup with logo overlay

    Parameters:
    - main_image: Background apparel image
    - logo_image: Logo/graphic to overlay
    - config: JSON string with parameters (x, y, scale, rotation, opacity, displacementStrength)
    """
    try:
        # Parse config
        config_data = json.loads(config)

        # Read uploaded files
        main_content = await main_image.read()
        logo_content = await logo_image.read()

        # Process the mockup
        result_image = process_mockup(main_content, logo_content, config_data)

        # Return as image
        return StreamingResponse(io.BytesIO(result_image), media_type="image/jpeg")

    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/health")
async def health_check():
    return {"status": "healthy"}