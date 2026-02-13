# SoftShop - E-Ticaret Platformu

Modern, responsive bir e-ticaret platformu. React frontend, Node.js/Express backend ve MySQL veritabani ile gelistirilmistir.

## Teknolojiler

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express.js
- **Veritabani:** MySQL 8.0
- **Auth:** JWT + bcrypt

## Kurulum

### 1. Backend

```bash
cd backend
npm install
```

`.env` dosyasindaki `DB_PASSWORD` degerini kendi MySQL root sifreniz ile degistirin:

```
DB_PASSWORD=sizin_mysql_sifreniz
```

Backend'i baslatin:

```bash
npm run dev
```

Sunucu `http://localhost:5000` adresinde calisacaktir.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend `http://localhost:3000` adresinde calisacaktir.

## Ozellikler

- Ana Sayfa (hero banner, kategoriler, one cikan urunler)
- Urun listesi (filtreleme, siralama, sayfalama)
- Urun detay sayfasi
- Sepet yonetimi
- Odeme sayfasi
- Kullanici giris/kayit (JWT)
- Profil ve siparis gecmisi
- Tam responsive tasarim (mobil, tablet, masaustu)
- Modern koyu tema
