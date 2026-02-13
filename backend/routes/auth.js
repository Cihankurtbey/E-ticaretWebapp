const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// Kayit ol
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tum alanlar zorunludur.' });
    }

    // Email kontrolu
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayitli.' });
    }

    // Sifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kullaniciyi kaydet
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // JWT token olustur
    const token = jwt.sign(
      { id: result.insertId, name, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Kayit basarili!',
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (error) {
    console.error('Kayit hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Giris yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve sifre zorunludur.' });
    }

    // Kullaniciyi bul
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'E-posta veya sifre hatali.' });
    }

    const user = users[0];

    // Sifre kontrolu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'E-posta veya sifre hatali.' });
    }

    // JWT token olustur
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Giris basarili!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Giris hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

module.exports = router;
