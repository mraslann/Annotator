from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import random
from fastapi.responses import FileResponse
from database import get_db, engine
import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATS_DIRECTORY = "../kagglecatsanddogs_5340/PetImages/Cat"
DOGS_DIRECTORY = "../kagglecatsanddogs_5340/PetImages/Dog"

# Global variable to keep track of the generated image
current_image = None

def list_images():
    cat_images = [os.path.join(CATS_DIRECTORY, img) for img in os.listdir(CATS_DIRECTORY)]
    dog_images = [os.path.join(DOGS_DIRECTORY, img) for img in os.listdir(DOGS_DIRECTORY)]
    return cat_images + dog_images

@app.get("/generate-image/")
def generate_image():
    global current_image
    available_images = list_images()
    if not available_images:
        raise HTTPException(status_code=404, detail="No images available for annotation.")
    
    current_image = random.choice(available_images)
    return {"filename": os.path.basename(current_image)}

@app.get("/current-image/")
def get_current_image():
    if current_image is None:
        raise HTTPException(status_code=404, detail="No image generated.")
    return {"filename": os.path.basename(current_image)}

@app.get("/images/{filename}")
def serve_image(filename: str):
    rand = random.choice([CATS_DIRECTORY, DOGS_DIRECTORY])
    image_path = os.path.join(rand, filename)
    if not os.path.isfile(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(image_path)

@app.post("/annotations/", response_model=schemas.Annotation)
def create_annotation(annotation: schemas.AnnotationCreate, db: Session = Depends(get_db)):
    if not current_image or annotation.filename != os.path.basename(current_image):
        raise HTTPException(status_code=400, detail="No image generated or mismatched image.")
    
    db_annotation = models.Annotation(
        filename=annotation.filename,
        category=annotation.category,
        extra_text=annotation.extra_text,
        user_id=1  # Assuming a default user_id if not using authentication
    )
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    
    return db_annotation

@app.get("/annotations/stats")
def get_annotation_stats(db: Session = Depends(get_db)):
    total = db.query(models.Annotation).count()
    cats = db.query(models.Annotation).filter(models.Annotation.category == "cat").count()
    dogs = db.query(models.Annotation).filter(models.Annotation.category == "dog").count()
    neither = db.query(models.Annotation).filter(models.Annotation.category == "neither").count()

    # Fetch user annotation counts
    users = db.query(
        models.User.username,
        db.func.count(models.Annotation.user_id).label('count')
    ).join(models.Annotation).group_by(models.User.username).all()

    return {
        "total": total,
        "cats": cats,
        "dogs": dogs,
        "neither": neither,
        "cats_percentage": (cats / total) * 100 if total > 0 else 0,
        "dogs_percentage": (dogs / total) * 100 if total > 0 else 0,
        "neither_percentage": (neither / total) * 100 if total > 0 else 0,
        "users": [{"username": user.username, "count": user.count} for user in users]
    }
