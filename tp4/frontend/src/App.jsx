import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import AddEdit from './pages/AddEdit';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="app">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <main className="main-content container">
        <Routes>
          <Route path="/" element={<Home filter="All" searchTerm={searchTerm} />} />
          <Route path="/marvel" element={<Home filter="Marvel" searchTerm={searchTerm} />} />
          <Route path="/dc" element={<Home filter="DC" searchTerm={searchTerm} />} />
          <Route path="/superhero/:id" element={<Detail />} />
          <Route path="/add" element={<AddEdit />} />
          <Route path="/edit/:id" element={<AddEdit />} />
        </Routes>
      </main>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
