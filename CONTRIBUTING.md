# Kontribusi

Terima kasih sudah mau bantu PilahYuk! Beberapa cara berkontribusi:

## Setup

```bash
git clone https://github.com/<user>/pilahyuk.git
cd pilahyuk
npm install
npm run dev
```

## Sebelum buka PR

- `npm test` lulus
- `npm run coverage` ≥ 80% (threshold enforced di `vitest.config.js`)
- `npm run build` sukses
- Tidak ada console error/warning baru di browser saat `npm run dev`

## Aturan substansi

1. **Aturan game di `src/config/gameConfig.js` adalah locked.** Mengubah skor, durasi, atau tier difficulty butuh diskusi di issue dulu.
2. **`src/data/wasteItems.js`**: penambahan/penggantian item harus disertai `funFact` edukatif dan sebaiknya referensi sumber (DLH, bank sampah, dll).
3. **Copy publik (README, UI, meta tag)**: tetap netral nasional — jangan kunci ke kota atau RT/RW spesifik.
4. **Bahasa**: UI dan funFact pakai Bahasa Indonesia. Bahasa daerah masuk roadmap v2.

## Style

- JS modern (ESM, no transpile target di luar es2020).
- Logika murni dipisah dari scene Phaser supaya bisa di-unit-test.
- Hindari menambah dependency runtime baru tanpa alasan kuat — game ini harus ringan untuk Android low-end.

## Issue

Pakai template singkat:
- **Apa yang terjadi**
- **Yang diharapkan**
- **Langkah reproduksi**
- **Device / browser**
