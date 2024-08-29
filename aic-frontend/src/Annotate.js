import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Annotate() {
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const [extraText, setExtraText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageGenerated, setImageGenerated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkImage = async () => {
      try {
        const response = await fetch('http://localhost:8000/current-image/');
        if (response.ok) {
          const data = await response.json();
          setImage(`http://localhost:8000/images/${data.filename}`);
          setImageGenerated(true);
        } else {
          setImageGenerated(false);
        }
      } catch (error) {
        console.error("Error fetching current image:", error);
        setImageGenerated(false);
      }
    };

    checkImage();
  }, []);

  const generateImage = async () => {
    try {
      const response = await fetch('http://localhost:8000/generate-image/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImage(`http://localhost:8000/images/${data.filename}`);
        setImageGenerated(true);
        setSuccess("Image fetched for annotation!");
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to fetch image.");
        setSuccess('');
        setImageGenerated(false);
      }
    } catch (error) {
      setError("Network error: " + error.message);
      setSuccess('');
      setImageGenerated(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageGenerated) {
      setError("Please generate an image first.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/annotations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: image.split('/').pop(),
          category,
          extra_text: extraText,
        }),
      });

      if (response.ok) {
        setSuccess("Annotation submitted successfully!");
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Annotation failed.");
        setSuccess('');
      }
    } catch (error) {
      setError("Network error: " + error.message);
      setSuccess('');
    }
  };

  const handleStatisticsClick = () => {
    navigate('/statistics');
  };

  return (
    <div className="annotate-container">
      <h1>Annotate Image</h1>
      {image && <img src={image} alt="To be annotated" className="annotate-image" />}
      <button onClick={generateImage} className="generate-button">Generate Image</button>
      <form className="annotate-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="extraText">Extra Text:</label>
          <input
            id="extraText"
            type="text"
            value={extraText}
            onChange={(e) => setExtraText(e.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Submit Annotation</button>
      </form>
      <button onClick={handleStatisticsClick} className="statistics-button">View Statistics</button>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
}

export default Annotate;