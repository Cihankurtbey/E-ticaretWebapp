const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Tum sepet route'lari auth gerektirir
router.use(authMiddleware);

// Sepeti getir
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.old_price, p.image, p.stock
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    res.json(items);
  } catch (error) {
    console.error('Sepet hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Sepete urun ekle
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Urun var mi kontrol et
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Urun bulunamadi.' });
    }

    // Stok kontrolu
    if (products[0].stock < quantity) {
      return res.status(400).json({ message: 'Yeterli stok yok.' });
    }

    // Sepette zaten var mi?
    const [existing] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      // Miktari guncelle
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      // Yeni ekle
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    res.json({ message: 'Urun sepete eklendi!' });
  } catch (error) {
    console.error('Sepete ekleme hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Sepetteki urun miktarini guncelle
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Miktar en az 1 olmalidir.' });
    }

    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sepet ogesi bulunamadi.' });
    }

    res.json({ message: 'Miktar guncellendi.' });
  } catch (error) {
    console.error('Miktar guncelleme hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Sepetten urun sil
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sepet ogesi bulunamadi.' });
    }

    res.json({ message: 'Urun sepetten silindi.' });
  } catch (error) {
    console.error('Sepetten silme hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

module.exports = router;
