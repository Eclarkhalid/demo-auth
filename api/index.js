// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const cors = require('cors');

app.use(cors())

// Set up MongoDB connection
mongoose.connect('mongodb+srv://eclarkhalid:machipo12@cluster0.fpdzobj.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Middleware for JSON parsing
app.use(bodyParser.json());

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Compare the entered password with the hashed password
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate a JWT token for authentication
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'machiposdatabasejwttoken',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
