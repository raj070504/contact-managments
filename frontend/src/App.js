import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import AddContact from './pages/AddContact';
import Settings from './pages/Settings';
import EditContact from './pages/EditContact';

function App() {
  return (
    <Router>
      <div className="App d-flex">
        <Sidebar />
        <div className="main-content p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/add" element={<AddContact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/edit/:id" element={<EditContact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;