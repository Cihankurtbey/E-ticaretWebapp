const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Siparis olustur
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Teslimat adresi zorunludur.' });
    }

    // Sepetteki urunleri al
    const [cartItems] = await connection.query(
      `SELECT ci.*, p.price, p.stock, p.name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Sepetiniz bos.' });
    }

    // Stok kontrolu
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          message: `"${item.name}" icin yeterli stok yok. Mevcut: ${item.stock}` 
        });
      }
    }

    // Toplam tutari hesapla
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Siparisi olustur
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, address) VALUES (?, ?, ?)',
      [req.user.id, total, address]
    );

    const orderId = orderResult.insertId;

    // Siparis kalemlerini ekle ve stoklari guncelle
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Sepeti temizle
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({
      message: 'Siparisiniz basariyla olusturuldu!',
      orderId,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Siparis hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  } finally {
    connection.release();
  }
});

// Siparisleri listele
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Her siparis icin kalemleri getir
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Siparis listesi hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

module.exports = router;
