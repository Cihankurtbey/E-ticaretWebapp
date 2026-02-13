const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const initDatabase = async () => {
  // Oncelikle veritabanini olustur
  console.log('DB baglanti bilgileri:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***' : 'YOK',
    dbName: process.env.DB_NAME
  });

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4'
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  await connection.query(`USE ${process.env.DB_NAME}`);

  // Tablolari olustur
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      image VARCHAR(500) DEFAULT ''
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2) DEFAULT NULL,
      image VARCHAR(500) DEFAULT '',
      category_id INT,
      stock INT DEFAULT 0,
      rating DECIMAL(2,1) DEFAULT 0.0,
      review_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Hazirlaniyor',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Ornek kategoriler ekle (eger yoksa)
  const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
  if (categories[0].count === 0) {
    await connection.query(`
      INSERT INTO categories (name, image) VALUES
      ('Elektronik', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
      ('Giyim', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
      ('Ev & Yasam', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400'),
      ('Spor & Outdoor', 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400'),
      ('Kitap & Hobi', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
      ('Kozmetik', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400')
    `);
  }

  // Ornek urunler ekle (eger yoksa)
  const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
  if (products[0].count === 0) {
    // Elektronik (category_id: 1)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Kablosuz Bluetooth Kulaklik', 'Yuksek kaliteli ses, aktif gurultu engelleme, 30 saat pil omru. Ergonomik tasarim ile uzun sure rahat kullanim.', 1299.99, 1799.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 150, 4.5, 234),
      ('Akilli Saat Pro', 'GPS, kalp atis olcumu, uyku takibi, 50+ spor modu. Su gecirmez tasarim, 7 gun pil omru.', 2499.00, 3299.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1, 80, 4.7, 189),
      ('Mekanik Klavye RGB', 'Cherry MX Blue switch, RGB aydinlatma, aluminyum govde. Oyuncular ve yazarlar icin ideal.', 899.00, NULL, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 1, 200, 4.3, 156),
      ('4K Webcam', 'Ultra HD goruntu kalitesi, otomatik odaklama, dahili mikrofon. Uzaktan calisma icin mukemmel.', 649.00, 899.00, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', 1, 120, 4.1, 98),
      ('Tasinabilir SSD 1TB', 'USB 3.2 Gen2, 1050MB/s okuma hizi, kompakt tasarim. Tum cihazlarla uyumlu.', 1199.00, NULL, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400', 1, 95, 4.6, 312),
      ('Kablosuz Mouse Ergonomik', 'Dikey tasarim, bilek destegi, 6 buton, USB-C sarj. Ofis ve oyun icin mukemmel.', 459.00, 599.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1, 180, 4.4, 276),
      ('Tablet 10.5 inc', '2K ekran, 128GB depolama, kalem destegi, 8000mAh batarya. Cizim ve not alma icin ideal.', 5999.00, 7499.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 1, 55, 4.6, 321),
      ('Bluetooth Hoparlor', 'Su gecirmez IPX7, 360 derece ses, 24 saat pil omru. Parti ve outdoor icin mukemmel.', 799.00, NULL, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 1, 140, 4.3, 198),
      ('Gaming Kulaklik 7.1', 'Sanal surround ses, RGB aydinlatma, ayarlanabilir mikrofon. E-spor kalitesinde ses deneyimi.', 1099.00, 1499.00, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 1, 90, 4.5, 412),
      ('Akilli Telefon Kilifli Powerbank', '10000mAh, hizli sarj, LED gosterge, ince tasarim. Cebinizde tasiyabileceginiz enerji.', 349.00, NULL, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 1, 250, 4.2, 189)
    `);

    // Giyim (category_id: 2)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Erkek Deri Ceket', 'Gercek deri, slim fit kesim, ic astari ile kis icin ideal. Zamansiz bir stil.', 3499.00, 4999.00, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 2, 45, 4.4, 87),
      ('Kadin Triko Kazak', 'Yumusak yun karisim, rahat kesim, 6 farkli renk secenegi. Sonbahar/kis sezonu icin.', 599.00, 899.00, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', 2, 200, 4.2, 145),
      ('Unisex Sneaker', 'Hafif ve esnek taban, nefes alan kumas, gunluk kullanima uygun. Tum kombinlerle uyumlu.', 1299.00, 1699.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 2, 300, 4.8, 567),
      ('Kot Pantolon Slim Fit', 'Premium denim, rahat esneklik, klasik mavi yikama. Her mevsim giyilebilir.', 449.00, NULL, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 2, 180, 4.0, 203),
      ('Kadin Elbise Midi', 'Cicek desenli, A kesim, kemer detayli. Ozel gunler ve gunluk kullanim icin sik bir tercih.', 749.00, 1099.00, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 2, 120, 4.5, 178),
      ('Erkek Gomlek Slim Fit', 'Pamuk saten, non-iron teknoloji, 8 farkli renk. Is ve ozel gunler icin zarif gorunum.', 399.00, NULL, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 2, 250, 4.1, 132),
      ('Kadin Deri Bot', 'Dogal deri, fermuarli, 5cm topuk, su gecirmez taban. Kis mevsimi icin sik ve sicak.', 1899.00, 2499.00, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 2, 65, 4.6, 94),
      ('Erkek Mont Su Gecirmez', 'Goretex kumas, kapusonlu, cok cepli, hafif. Yagmurlu ve soguk havalarda koruma.', 2199.00, 2999.00, 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400', 2, 80, 4.7, 156),
      ('Unisex Sapka Bere', 'Merino yunu, sicak ve yumusak, tek beden. Kis aylarinda sik bir aksesuar.', 149.00, NULL, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', 2, 400, 4.3, 289),
      ('Kadin Spor Tayt', 'Yuksek bel, squat proof, cepli, nefes alan kumas. Spor ve gunluk kullanima uygun.', 329.00, 499.00, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 2, 190, 4.4, 345)
    `);

    // Ev & Yasam (category_id: 3)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Dekoratif Masa Lambasi', 'Modern tasarim, ayarlanabilir isik siddeti, ahsap taban. Calisma masasi ve komodin icin ideal.', 349.00, 499.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400', 3, 75, 4.3, 64),
      ('Pamuklu Nevresim Takimi', 'Cift kisilik, 200 iplik sayisi, 4 parca set. Yumusak ve nefes alan dogal pamuk.', 799.00, 1199.00, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 3, 60, 4.5, 178),
      ('Seramik Kahve Fincan Seti', 'El yapimi, 6li set, pastel renkler. Espresso ve turk kahvesi icin uygun boyut.', 249.00, NULL, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', 3, 140, 4.6, 92),
      ('Robot Supurge Akilli', 'Lazer navigasyon, 3000Pa emis gucu, uygulama kontrolu, otomatik sarj. Eviniz tertemiz.', 4999.00, 6999.00, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', 3, 35, 4.7, 267),
      ('Bambu Mutfak Organizator', '5 bolmeli, dogal bambu, tezgah ustu duzenleyici. Baharatlar ve malzemeler icin.', 189.00, NULL, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 3, 200, 4.2, 87),
      ('Aromaterapi Difuzor', 'Ultrasonik sis, 7 renk LED, 300ml kapasite, zamanlayici. Rahatlatici atmosfer yaratir.', 299.00, 449.00, 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400', 3, 110, 4.4, 156),
      ('Dekoratif Yastik Seti', '4lu set, kadife kumas, fermuar detay, 45x45cm. Oturma odaniza renk katin.', 399.00, NULL, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400', 3, 90, 4.1, 134),
      ('French Press Kahve Demleme', 'Paslanmaz celik filtre, borosilikat cam, 1 litrelik. Taze demlenmi kahvenin tadini cikarin.', 279.00, 399.00, 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=400', 3, 165, 4.5, 211)
    `);

    // Spor & Outdoor (category_id: 4)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Yoga Mati Premium', 'Anti-kayma yuzey, 6mm kalinlik, tasima kayisi dahil. Yoga, pilates ve fitness icin.', 299.00, 449.00, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 4, 110, 4.7, 234),
      ('Dambil Seti 20kg', 'Ayarlanabilir agirlik, kaucuk kapli, ergonomik tutamak. Ev egzersizleri icin ideal set.', 1599.00, 2199.00, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', 4, 40, 4.4, 156),
      ('Kosu Ayakkabisi', 'Jel tabanli, nefes alan mesh yuzey, reflektif detaylar. Uzun mesafe kosulari icin tasarlandi.', 1899.00, NULL, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', 4, 85, 4.5, 289),
      ('Kamp Cadiri 4 Kisilik', 'Su gecirmez, kolay kurulum, havalandirmali. Aile kampiniz icin genis ve konforlu.', 2799.00, 3499.00, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400', 4, 30, 4.6, 123),
      ('Bisiklet Kask Premium', 'Hafif tasarim, hava kanallari, ayarlanabilir kayis. Guvenli surme deneyimi.', 599.00, NULL, 'https://images.unsplash.com/photo-1557803175-2dfab4e tried?w=400', 4, 95, 4.3, 178),
      ('Protein Shaker 700ml', 'BPA free, sizintisiz kapak, karistirma teli dahil. Antreman sonrasi beslenme icin.', 89.00, 129.00, 'https://images.unsplash.com/photo-1594381898411-846e7d168f39?w=400', 4, 350, 4.1, 445),
      ('Direnc Bandi Seti', '5 farkli agirlik, dogal lateks, tasima cantasi. Her seviyeye uygun egzersiz imkani.', 199.00, 299.00, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 4, 220, 4.5, 312),
      ('Spor Cantasi 40L', 'Su gecirmez, ayakkabi bolmesi, omuz askili, dayanikli. Spor salonu ve seyahat icin.', 449.00, NULL, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 4, 130, 4.4, 198),
      ('Akilli Atlama Ipi', 'Dijital sayac, kalori takibi, ayarlanabilir uzunluk. Kardiyo antremanlari icin etkili.', 159.00, 229.00, 'https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=400', 4, 175, 4.2, 267)
    `);

    // Kitap & Hobi (category_id: 5)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Bestseller Roman Seti', '10 kitaplik odul kazanmis roman koleksiyonu. Turkce ceviriler, ozel baski.', 399.00, 599.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 5, 200, 4.8, 445),
      ('Profesyonel Cizim Seti', '72 parca, renkli kalemler, suluboya, eskiz defteri dahil. Baslangic ve ileri seviye icin.', 549.00, NULL, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', 5, 65, 4.3, 87),
      ('1000 Parca Puzzle Istanbul', 'Istanbul manzarasi, premium kalite baski, kayip parca garantisi. Aile aktivitesi icin ideal.', 179.00, 249.00, 'https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=400', 5, 120, 4.5, 156),
      ('Kisisel Gelisim Kitap Seti', '5 kitaplik motivasyon ve basari seti. Turkiyenin en cok satan yazarlarindan.', 299.00, NULL, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', 5, 175, 4.6, 312),
      ('LEGO Mimari Seti', '1500+ parca, koleksiyon yapisi, yetiskinler icin. Detayli montaj kilavuzu dahil.', 1299.00, 1699.00, 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400', 5, 40, 4.7, 198),
      ('Dijital Cizim Tableti', '8192 basinca duyarli kalem, 10 inc calisma alani. Grafik tasarim ve illustrasyon icin.', 1899.00, NULL, 'https://images.unsplash.com/photo-1561883088-039e53143d73?w=400', 5, 50, 4.4, 134),
      ('Satranc Takimi Ahsap', 'El oyma figurler, katlanir tahta, turnuva boyutu. Baslangic ve ileri seviye oyuncular icin.', 349.00, 499.00, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400', 5, 80, 4.5, 178),
      ('Teleskop Baslangic Seti', '70mm apertur, 300x buyutme, tripod dahil. Gok cisimlerini kesfetmeye baslayin.', 2499.00, 3199.00, 'https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=400', 5, 25, 4.6, 89)
    `);

    // Kozmetik (category_id: 6)
    await connection.query(`
      INSERT INTO products (name, description, price, old_price, image, category_id, stock, rating, review_count) VALUES
      ('Cilt Bakim Seti', '5 urunlu komple bakim seti, dogal icerik, tum cilt tipleri icin uygun.', 699.00, 999.00, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', 6, 90, 4.6, 312),
      ('Parfum EDP 100ml', 'Uzun sure kalici, unisex koku, sik cam sise. Hediye kutusu dahil.', 1199.00, 1599.00, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 6, 70, 4.4, 198),
      ('Makyaj Firca Seti', '15 parca profesyonel firca seti, vegan, deri cantali. Baslangictan uzmana herkes icin.', 349.00, NULL, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 6, 130, 4.2, 145),
      ('Sac Bakim Seti Organik', 'Sampuan, krem, serum 3lu set. Sunsilikon, paraben icermez. Parlak ve saglikli saclar.', 449.00, 649.00, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400', 6, 160, 4.5, 234),
      ('Gunes Kremi SPF 50+', 'Yuz ve vucut icin, su gecirmez formul, 200ml. Yaz boyunca cilt korumaniz icin.', 199.00, NULL, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 6, 210, 4.3, 289),
      ('Goz Kremi Anti-Age', 'Kolajen destekli, goz alti morluklari icin, 30ml. Genc ve dinlenmis gorunum.', 549.00, 799.00, 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=400', 6, 85, 4.7, 178),
      ('Dudak Bakim Seti', '5 farkli renk lip balm, dogal iceriklI, nemlendirici. Her mevsim bakim.', 159.00, NULL, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', 6, 300, 4.1, 367),
      ('Erkek Bakim Seti', 'Yuz yikama, nemlendirici, goz kremi. Erkeklere ozel formul, dogal icerik.', 599.00, 849.00, 'https://images.unsplash.com/photo-1581750261407-7e06a4b1e926?w=400', 6, 75, 4.4, 145),
      ('Tirnak Bakim Seti Profesyonel', '12 parca paslanmaz celik set, deri cantali. Manikur ve pedikur icin eksiksiz.', 249.00, NULL, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', 6, 190, 4.0, 112)
    `);
  }

  console.log('Veritabani ve tablolar basariyla olusturuldu!');
  console.log('Ornek veriler eklendi!');
  await connection.end();
};

module.exports = initDatabase;

// Direkt calistirilirsa
if (require.main === module) {
  initDatabase().catch(console.error);
}
