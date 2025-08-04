import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    return `text-light nav-link ${location.pathname === path ? 'active' : ''}`;
  };

  return (
    <div className="sidebar bg-dark text-light text-start">
      <div className="sidebar-header">
        <h3 className="mb-4">Contact Book</h3>
      </div>
      <ul className="list-unstyled">
        <li className="mb-2">
          <NavLink to="/" className={getLinkClass('/')}>
            <i className="bi bi-house-door me-2"></i> Home
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/contacts" className={getLinkClass('/contacts')}>
            <i className="bi bi-person-lines-fill me-2"></i> Contacts
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/add" className={getLinkClass('/add')}>
            <i className="bi bi-person-plus me-2"></i> Add Contact
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/settings" className={getLinkClass('/settings')}>
            <i className="bi bi-gear me-2"></i> Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;