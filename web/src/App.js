// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authen from './screens/Authen';
import Petdetail from './screens/Petdetail';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authen />} />
        <Route path="/petdetail" element={<Petdetail />} />
      </Routes>
    </Router>
  );
};

export default App;