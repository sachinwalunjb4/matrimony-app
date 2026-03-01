const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Sample profiles data
let profiles = [
  {
    id: 1,
    name: 'Priya Sharma',
    age: 28,
    gender: 'female',
    occupation: 'Software Engineer',
    location: 'Mumbai',
    education: 'B.Tech',
    bio: 'Looking for a compatible life partner who shares similar values.'
  },
  {
    id: 2,
    name: 'Rahul Verma',
    age: 30,
    gender: 'male',
    occupation: 'Doctor',
    location: 'Delhi',
    education: 'MBBS',
    bio: 'Family-oriented person looking for a life partner.'
  },
  {
    id: 3,
    name: 'Anjali Patel',
    age: 26,
    gender: 'female',
    occupation: 'Teacher',
    location: 'Ahmedabad',
    education: 'M.Ed',
    bio: 'Simple, caring, and family-oriented.'
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Matrimony API is running' });
});

app.get('/api/profiles', (req, res) => {
  res.json(profiles);
});

app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find(p => p.id === parseInt(req.params.id));
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

app.post('/api/profiles', (req, res) => {
  const newProfile = {
    id: profiles.length + 1,
    ...req.body
  };
  profiles.push(newProfile);
  res.status(201).json(newProfile);
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Matrimony app server is running on port ${PORT}`);
});

module.exports = app;
