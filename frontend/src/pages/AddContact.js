
import React, { useState } from 'react';
import axios from 'axios';
import './AddContact.css';
import { BACKEND_URL } from '../config';


function AddContact() {
  const [showMore, setShowMore] = useState(false);
  const [contact, setContact] = useState({ 
    name: '', 
    phoneNumber: '', 
    country: '+91', 
    email: '', 
    dob: '', 
    photo: null, 
    relationship: '', 
    address: '' 
  });
  const [phoneError, setPhoneError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
    if (name === 'phoneNumber' || name === 'country') {
      validatePhoneNumber(name === 'country' ? value : contact.country, name === 'phoneNumber' ? value : contact.phoneNumber);
    }
  };

  const validatePhoneNumber = (country, phoneNumber) => {
    if (country === '+91' && phoneNumber) {
      if (!/^\d{10}$/.test(phoneNumber)) {
        setPhoneError('Phone number must be 10 digits for India');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (contact.country === '+91' && contact.phoneNumber) {
      if (!/^\d{10}$/.test(contact.phoneNumber)) {
        setPhoneError('Phone number must be 10 digits for India');
        return;
      }
    }

    const formData = new FormData();
    Object.keys(contact).forEach(key => {
      if (key === 'photo') {
        if (contact.photo instanceof File) {
          formData.append('photo', contact.photo);
        }
      } else {
        formData.append(key, contact[key]);
      }
    });

    try {
      const response = await axios.post(`${BACKEND_URL}/addcontact`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        alert('Contact added successfully!');
        // Reset form or redirect to contacts list
        setContact({ 
          name: '', 
          phoneNumber: '', 
          country: '+91', 
          email: '', 
          dob: '', 
          photo: null, 
          relationship: '', 
          address: '' 
        });
        // redirect to contacts list or display success message
          window.location.href = '/contacts';
        setPhotoPreview(null);
      } else {
        alert('Failed to add contact. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContact({ ...contact, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-body p-5">
              <h1 className="card-title text-center mb-4">Add New Contact</h1>
              <form onSubmit={handleSubmit} className="add-contact-form">
                <div className="mb-3">
                  <div className="photo_container">
                    <div className="photo-upload me-3" onClick={() => document.getElementById('photoUpload').click()}>
                      {photoPreview ? <img src={photoPreview} alt="Contact" className="uploaded-photo" /> : <i className="bi bi-camera"></i>}
                    </div>
                    <input type="file" id="photoUpload" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name*</label>
                  <input type="text" className="form-control" id="name" name="name" value={contact.name} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                   <label htmlFor="phoneNumber" className="form-label">Phone Number*</label>
                   <div className='row align-items-center'>
                    <div className='col-md-2 m-0 p-0'>
                      <select className="form-select" id="country" name="country" value={contact.country} onChange={handleInputChange} required>
                        <option value="+91">India</option>
                        <option value="+44">UK</option>
                        <option value="+1">USA</option>
                      </select>
                    </div>
                    <div className='col-md-10 m-0 p-0 ps-1'>
                      <input type="tel" className="form-control" id="phoneNumber" name="phoneNumber" value={contact.phoneNumber} onChange={handleInputChange} required />
                      {phoneError && <div className="text-danger">{phoneError}</div>}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email" value={contact.email} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" id="dob" name="dob" value={contact.dob} onChange={handleInputChange} />
                </div>
                {!showMore && (
                  <button type="button" className="btn btn-link w-100 text-center text-dark p-0" onClick={() => setShowMore(true)}>
                    Show more <i className='bi bi-chevron-compact-down'></i>
                  </button>
                )}
                {showMore && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="relationship" className="form-label">Relationship</label>
                      <input type="text" className="form-control" id="relationship" name="relationship" value={contact.relationship} onChange={handleInputChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Address</label>
                      <textarea className="form-control" id="address" name="address" rows="3" value={contact.address} onChange={handleInputChange}></textarea>
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={!!phoneError}>Add Contact</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddContact;