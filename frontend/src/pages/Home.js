import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import './Home.css'; 

function Home() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    birthdaysToday: [],
    birthdaysThisMonth: [],
    birthdaysNext7Days: 0,
    favoriteContacts: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/home`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="col-sm-6 col-md-3 mb-4">
      <div className="card h-100 shadow-sm stat-card">
        <div className="card-body d-flex flex-column justify-content-center align-items-center">
          <i className={`bi ${icon} mb-3 stat-icon`}></i>
          <h5 className="card-title text-center">{title}</h5>
          <p className="card-text display-4">{value}</p>
        </div>
      </div>
    </div>
  );

  const ContactList = ({ contacts, title, icon }) => (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className={`bi ${icon} me-2`}></i>
          {title}
        </h5>
      </div>
      <div className="card-body">
        {contacts.length > 0 ? (
          <ul className="list-group list-group-flush">
            {contacts.map(contact => (
              <li key={contact.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{contact.name}</span>
                <a href={`tel:${contact.phone_number}`} className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-telephone-fill me-1"></i>
                  Call
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">No contacts to display</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4">Contact Book Dashboard</h1>
      <div className="row g-4 mb-4">
        <StatCard title="Total Contacts" value={stats.totalContacts} icon="bi-person-lines-fill" />
        <StatCard title="Birthdays Today" value={stats.birthdaysToday.length} icon="bi-gift" />
        <StatCard title="Birthdays This Month" value={stats.birthdaysThisMonth.length} icon="bi-calendar-event" />
        <StatCard title="Birthdays Next 7 Days" value={stats.birthdaysNext7Days} icon="bi-calendar-week" />
      </div>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <ContactList contacts={stats.favoriteContacts} title="Favorite Contacts" icon="bi-star-fill" />
        </div>
        <div className="col-md-4 mb-4">
          <ContactList contacts={stats.birthdaysToday} title="Today's Birthdays" icon="bi-gift" />
        </div>
        <div className="col-md-4 mb-4">
          <ContactList contacts={stats.birthdaysThisMonth} title="This Month's Birthdays" icon="bi-calendar-event" />
        </div>
      </div>
    </div>
  );
}

export default Home;