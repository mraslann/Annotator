import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Annotate from './Annotate';
import Statistics from './Statistics';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Annotate />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;