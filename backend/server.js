const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDatabase = require('./models/db-init');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({ message: 'E-Ticaret API calisiyor!' });
});

// Veritabanini baslat ve sunucuyu ac
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda calisiyor`);
      console.log(`API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Sunucu baslatma hatasi:', error);
    process.exit(1);
  }
};

startServer();
