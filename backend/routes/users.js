const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Profil bilgilerini getir
router.get('/profile', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Kullanici bulunamadi.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profil hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Profil guncelle
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone, address, req.user.id]
    );

    res.json({ message: 'Profil guncellendi.' });
  } catch (error) {
    console.error('Profil guncelleme hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

module.exports = router;
