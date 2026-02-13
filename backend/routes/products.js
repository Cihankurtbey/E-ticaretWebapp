const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Kategorileri getir
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Kategori hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Urunleri getir (filtreleme, siralama, sayfalama)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
    
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    const params = [];
    const countParams = [];

    // Kategori filtresi
    if (category) {
      query += ' AND p.category_id = ?';
      countQuery += ' AND p.category_id = ?';
      params.push(category);
      countParams.push(category);
    }

    // Fiyat filtresi
    if (minPrice) {
      query += ' AND p.price >= ?';
      countQuery += ' AND p.price >= ?';
      params.push(minPrice);
      countParams.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND p.price <= ?';
      countQuery += ' AND p.price <= ?';
      params.push(maxPrice);
      countParams.push(maxPrice);
    }

    // Arama
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Siralama
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.id ASC';
    }

    // Sayfalama
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await pool.query(query, params);
    const [totalResult] = await pool.query(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Urun listesi hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

// Tek urun detayi
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Urun bulunamadi.' });
    }

    // Benzer urunleri getir (ayni kategori)
    const product = products[0];
    const [similar] = await pool.query(
      'SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 4',
      [product.category_id, product.id]
    );

    res.json({ product, similar });
  } catch (error) {
    console.error('Urun detay hatasi:', error);
    res.status(500).json({ message: 'Sunucu hatasi.' });
  }
});

module.exports = router;
