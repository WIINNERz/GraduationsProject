// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authen from './screens/Authen';
import UserForm from './screens/form';
import Home from './screens/Home';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authen />} />
        <Route path="/user-form" element={<UserForm />} />
        <Route path="/home" element={<Home />} /> 
      </Routes>
    </Router>
  );
};

export default App;