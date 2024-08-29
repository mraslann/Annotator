import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import './styles.css';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

function Statistics() {
  const [categoryData, setCategoryData] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/annotations/stats');
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched statistics:", data); // Debugging line

          setCategoryData({
            labels: ['Cats', 'Dogs', 'Neither'],
            datasets: [{
              data: [data.cats, data.dogs, data.neither],
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
          });

          setUserData({
            labels: data.users.map(user => user.username),
            datasets: [{
              label: 'Annotations per User',
              data: data.users.map(user => user.count),
              backgroundColor: '#36A2EB',
            }]
          });

        } else {
          console.error('Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Network error:', error.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="statistics-container">
      <h1>Annotation Statistics</h1>
      {categoryData && (
        <>
          <h2>Category Distribution</h2>
          <Pie data={categoryData} />
        </>
      )}
      {userData && (
        <>
          <h2>Annotations by User</h2>
          <Bar data={userData} />
        </>
      )}
      {!categoryData && !userData && <p>Loading statistics...</p>}
    </div>
  );
}

export default Statistics;
