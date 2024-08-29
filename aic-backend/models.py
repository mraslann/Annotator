from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "userss"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))

    annotations = relationship("Annotation", back_populates="user")

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), index=True)  # Updated to 'filename'
    category = Column(String(10))  # "cat", "dog", or "neither"
    extra_text = Column(String(255), nullable=True)
    user_id = Column(Integer, ForeignKey("userss.user_id"))

    user = relationship("User", back_populates="annotations")
