from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    user_id: int
    username: str
    email: str

class LoginSchema(BaseModel):
    identifier: str
    password: str

class PostCreate(BaseModel):
    content: Optional[str] = None

class Post(BaseModel):
    post_id: int
    user_id: int
    content: Optional[str] = None

class AnnotationCreate(BaseModel):
    filename: str
    category: str  # User categorizes the image (e.g., 'cat', 'dog', 'neither')
    extra_text: Optional[str] = None

class Annotation(BaseModel):
    id: int
    filename: str  # Updated to 'filename'
    category: str
    extra_text: Optional[str] = None
    user_id: int
