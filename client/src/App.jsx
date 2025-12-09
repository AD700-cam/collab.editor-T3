import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import TextEditor from './components/TextEditor'

import Home from './components/Home'
import Login from './components/Login'

const PrivateRoute = ({ children }) => {
  const email = localStorage.getItem('userEmail');
  return email ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/documents/:id" element={<PrivateRoute><TextEditor /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
