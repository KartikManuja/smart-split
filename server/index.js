const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));