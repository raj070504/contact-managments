
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '900520',
  database: process.env.DB_NAME || 'contacts',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.get('/contacts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/addcontact', upload.single('photo'), async (req, res) => {
  try {
    let { name, country, phoneNumber, email, dob, relationship, address } = req.body;
    let photoUrl = null;

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    if(!dob) {
      dob = null;
    }
    // check if number already exists
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM contacts WHERE phone_number =?', [phoneNumber]);
    if (rows[0].count > 0) {
      return res.json({ success: false, message: 'Phone number already exists' });
    }


    const [result] = await pool.execute(
      'INSERT INTO contacts (name, country, phone_number, email, dob, photo, relationship, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, country, phoneNumber, email, dob, photoUrl, relationship, address]
    );

    if (result.affectedRows === 1) {
      res.json({ success: true, message: 'Contact added successfully' });
    } else {
      res.json({ success: false, message: 'Failed to add contact' });
    }
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

async function removeimage(id) {
  const [rows] = await pool.execute('SELECT photo FROM contacts WHERE id =?', [id]);
  if (rows.length > 0 && rows[0].photo) {
    const photoPath = path.join(__dirname, 'uploads', rows[0].photo.split('/').pop());
    fs.unlinkSync(photoPath);
  }
}


app.delete('/contacts/:id', async (req, res) => {
  removeimage(req.params.id);
  try {
    const [result] = await pool.execute('DELETE FROM contacts WHERE id =?', [req.params.id]);
    if (result.affectedRows === 1) {
      res.json({ success: true, message: 'Contact deleted successfully' });
    } else {
      res.json({ success: false, message: 'Failed to delete contact' });
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/contacts/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a contact
app.put('/contacts/:id', upload.single('photo'), async (req, res) => {
  try {
    let { name, country, phoneNumber, email, dob, relationship, address } = req.body;
    let photoUrl = null;

    if (req.file) {
      removeimage(req.params.id);
      photoUrl = `/uploads/${req.file.filename}`;
    }

    if(!dob) {
      dob = null;
    }
    // check if number already exists
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM contacts WHERE phone_number =? AND id!=?', [phoneNumber, req.params.id]);
    if (rows[0].count > 0) {
      return res.json({ success: false, message: 'Phone number already exists' });
    }

    
    
    const [result] = await pool.execute(
      'UPDATE contacts SET name = ?, country = ?, phone_number = ?, email = ?, dob = ?, photo = COALESCE(?, photo), relationship = ?, address = ? WHERE id = ?',
      [name, country, phoneNumber, email, dob, photoUrl, relationship, address, req.params.id]
    );

    if (result.affectedRows === 1) {
      res.json({ success: true, message: 'Contact updated successfully' });
    } else {
      res.json({ success: false, message: 'Failed to update contact' });
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/home', async (req, res) => {
  try {
    const [totalContacts] = await pool.query('SELECT COUNT(*) as count FROM contacts');
    const [birthdaysToday] = await pool.query('SELECT id, name, phone_number FROM contacts WHERE DATE_FORMAT(dob, "%m-%d") = DATE_FORMAT(CURDATE(), "%m-%d")');
    const [birthdaysThisMonth] = await pool.query('SELECT id, name, phone_number FROM contacts WHERE MONTH(dob) = MONTH(CURDATE())');
    const [birthdaysNext7Days] = await pool.query('SELECT COUNT(*) as count FROM contacts WHERE DATE_FORMAT(dob, "%m-%d") BETWEEN DATE_FORMAT(CURDATE(), "%m-%d") AND DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), "%m-%d")');
    const [favoriteContacts] = await pool.query('SELECT id, name, phone_number FROM contacts WHERE isFavorite = true LIMIT 5');

    res.json({
      totalContacts: totalContacts[0].count,
      birthdaysToday,
      birthdaysThisMonth,
      birthdaysNext7Days: birthdaysNext7Days[0].count,
      favoriteContacts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/contacts/:id/favorite', async (req, res) => {
  const { id } = req.params;
  const { isFavorite } = req.body;

  try {
    await pool.query('UPDATE contacts SET isFavorite = ? WHERE id = ?', [isFavorite, id]);
    res.json({ success: true, message: 'Favorite status updated successfully' });
  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});