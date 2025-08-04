
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import defaultAvatar from '../assets/avatar.png'; 
import './Contacts.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';


function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchContacts();
  }, []);

   useEffect(() => {
    fetchContacts();
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
    });
  }, []);
  useEffect(() => { 
    filterAndSortContacts();
  }, [contacts, searchTerm, sortBy]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  const deleteContact = async (id) => {
    iziToast.question({
      timeout: 20000,
      close: false,
      overlay: true,
      displayMode: 'once',
      id: 'question',
      zindex: 999,
      title: 'Hey',
      message: 'Are you sure about deleting this contact?',
      position: 'center',
      buttons: [
        ['<button><b>YES</b></button>', async function (instance, toast) {
          instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
          try {
            await axios.delete(`${BACKEND_URL}/contacts/${id}`);
            fetchContacts(); // Refresh the contacts list
            iziToast.success({
              title: 'Success',
              message: 'Contact deleted successfully!',
              position: 'topRight'
            });
          } catch (error) {
            console.error('Error deleting contact:', error);
            iziToast.error({
              title: 'Error',
              message: 'Failed to delete contact. Please try again.',
              position: 'topRight'
            });
          }
        }],
        ['<button>NO</button>', function (instance, toast) {
          instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
        }, true],
      ],
      onClosing: function(instance, toast, closedBy){
        console.info('Closing | closedBy: ' + closedBy);
      },
      onClosed: function(instance, toast, closedBy){
        console.info('Closed | closedBy: ' + closedBy);
      }
    });
  };


   const toggleFavorite = async (id, isFavorite) => {
    try {
      await axios.put(`${BACKEND_URL}/contacts/${id}/favorite`, { isFavorite: !isFavorite });
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


  const filterAndSortContacts = () => {
    let filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });

    setFilteredContacts(filtered);
  };

  return (
    <div className="contacts container mt-4">
      <h1 className="text-center mb-4">Contacts</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search contacts..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}   
          />
        </div>
        <div className="col-md-6">
          <select   className="form-select"   value={sortBy}   onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="phoneNumber">Sort by Phone Number</option>
            <option value="email">Sort by Email</option>
          </select>
        </div>
      </div>

      <ul className="cards">
        {filteredContacts.map((contact, index) => (
          <li key={contact.id} data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <img src={contact.photo ? `${BACKEND_URL}${contact.photo}` : defaultAvatar} alt={contact.name} className='contact_img rounded-circle' style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                  <div>
                    <a className='btn btn-outline-primary btn-sm me-2' href={`/edit/${contact.id}`}>
                      <i className="bi bi-pencil-fill"></i> Edit
                    </a>
                    <button 
                      className={`btn btn-outline-warning btn-sm ${contact.isFavorite ? 'active' : ''}`} 
                      onClick={() => toggleFavorite(contact.id, contact.isFavorite)}
                    >
                      <i className={`bi ${contact.isFavorite ? 'bi-star-fill' : 'bi-star'}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="contact-details">
                  <h3 className="name h5 mb-1">{contact.name}</h3>
                  {contact.relationship && <p className="title text-muted mb-2">{contact.relationship}</p>}
                  
                  <div className="contact-info mb-3">
                    {contact.phone_number && (
                      <p className="phone mb-1">
                        <i className="bi bi-telephone me-2 text-primary"></i>
                        {contact.phone_number}
                      </p>
                    )}
                    {contact.email && (
                      <p className="email mb-1">
                        <i className="bi bi-envelope me-2 text-primary"></i>
                        {contact.email}
                      </p>
                    )}
                    {contact.dob && (
                      <p className="dob mb-1">
                        <i className="bi bi-calendar-event me-2 text-primary"></i>
                        {new Date(contact.dob).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {contact.address && (
                      <p className="address mb-1">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        {contact.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="contact-actions d-flex justify-content-between">
                    <div>
                      {contact.phone_number && (
                        <a className="btn btn-outline-primary btn-sm me-2" href={`tel:${contact.phone_number}`}>
                          <i className="bi bi-telephone-fill me-1"></i> Call
                        </a>
                      )}
                      {contact.email && (
                        <a className="btn btn-outline-success btn-sm" href={`mailto:${contact.email}`}>
                          <i className="bi bi-envelope-fill me-1"></i> Email
                        </a>
                      )}
                    </div>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteContact(contact.id)}>
                      <i className="bi bi-trash-fill me-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Contacts;