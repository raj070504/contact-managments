# Contact Management System

This project is a full-stack contact management system built with React (frontend) and Node.js/Express (backend).

## Prerequisites

- Node.js (v14 or later)
- MySQL

## Setup

### Backend

1. Navigate to the backend directory:

2. Install dependencies: NPM install

3. Create a `.env` file in the backend directory with the following content:
DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=contacts


### Frontend

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Start the frontend development server:
  npm start

## Running the Application

1. Ensure the backend server is running (it should be available at `http://localhost:5000` by default)
2. Ensure the frontend development server is running (it should open automatically in your default browser, typically at `http://localhost:3000`)

## Features

- View all contacts
- Add new contacts
- Edit existing contacts
- Delete contacts
- Mark contacts as favorites
- View birthday reminders

## Technologies Used

- Frontend: React, Axios, Bootstrap
- Backend: Node.js, Express, MySQL
- File Upload: Multer

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
