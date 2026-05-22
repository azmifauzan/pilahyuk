// 30 item sampah konteks rumah tangga Indonesia. Source: plan.md §"30 Item Sampah".
// Kategori mengikuti Perda 3-jenis (organik / anorganik / B3). Draft, pending validasi
// DLH/RT setempat — do not silently re-balance.
//
// Schema:
//   id        unique kebab-case
//   name      display name (Bahasa Indonesia)
//   emoji     placeholder visual (replaced by SVG in Phase 3)
//   category  'organik' | 'anorganik' | 'b3'
//   subtype   'recyclable' | 'residue' | null (only used for anorganik)
//   funFact   edukasi singkat untuk popup (correct & wrong sort)

export const WASTE_CATEGORIES = Object.freeze(['organik', 'anorganik', 'b3'])

export const WASTE_ITEMS = Object.freeze([
  // 🟢 Organik — 10
  { id: 'kulit-pisang', name: 'Kulit Pisang', emoji: '🍌', category: 'organik', subtype: null,
    funFact: 'Kulit pisang cepat membusuk dan jadi bahan kompos atau pakan maggot yang sangat baik.' },
  { id: 'ampas-kopi', name: 'Ampas Kopi', emoji: '☕', category: 'organik', subtype: null,
    funFact: 'Ampas kopi kaya nitrogen — bagus dicampur ke kompos untuk menyuburkan tanaman.' },
  { id: 'sisa-nasi', name: 'Sisa Nasi', emoji: '🍚', category: 'organik', subtype: null,
    funFact: 'Sisa nasi sebaiknya ditiriskan dulu sebelum masuk komposter agar tidak bau.' },
  { id: 'daun-kering', name: 'Daun Kering', emoji: '🍂', category: 'organik', subtype: null,
    funFact: 'Daun kering adalah sumber karbon ("coklat") yang menyeimbangkan kompos basah.' },
  { id: 'kulit-telur', name: 'Kulit Telur', emoji: '🥚', category: 'organik', subtype: null,
    funFact: 'Kulit telur menambah kalsium ke kompos — remukkan dulu agar cepat terurai.' },
  { id: 'kulit-jeruk', name: 'Kulit Jeruk', emoji: '🍊', category: 'organik', subtype: null,
    funFact: 'Kulit jeruk bisa dijadikan eco-enzyme; jangan langsung dibuang ke tempat sampah residu.' },
  { id: 'sisa-sayur', name: 'Sisa Sayur', emoji: '🥬', category: 'organik', subtype: null,
    funFact: 'Sisa potongan sayur sangat ideal untuk pakan maggot Black Soldier Fly.' },
  { id: 'tulang-ayam', name: 'Tulang Ayam', emoji: '🍗', category: 'organik', subtype: null,
    funFact: 'Tulang lambat terurai — komposter khusus atau biopori cocok untuk ini.' },
  { id: 'ampas-teh', name: 'Ampas Teh', emoji: '🍵', category: 'organik', subtype: null,
    funFact: 'Ampas teh bisa langsung ditabur ke tanaman sebagai pupuk ringan.' },
  { id: 'kulit-bawang', name: 'Kulit Bawang', emoji: '🧅', category: 'organik', subtype: null,
    funFact: 'Kulit bawang bisa direbus jadi pupuk cair kaya kalium untuk tanaman.' },

  // 🟡 Anorganik — 12 (7 daur ulang + 5 residu non-B3)
  { id: 'botol-plastik', name: 'Botol Plastik', emoji: '🧴', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Botol PET bisa didaur ulang berkali-kali — kumpulkan ke bank sampah RT.' },
  { id: 'kaleng-minuman', name: 'Kaleng Minuman', emoji: '🥫', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Daur ulang kaleng aluminium hemat hingga 95% energi dibanding produksi baru.' },
  { id: 'kardus', name: 'Kardus', emoji: '📦', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Pipihkan kardus dulu agar tidak boros tempat di bank sampah.' },
  { id: 'koran-bekas', name: 'Koran Bekas', emoji: '📰', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Koran bekas laku di pengepul kertas dan bisa jadi bahan kerajinan.' },
  { id: 'botol-kaca', name: 'Botol Kaca', emoji: '🍶', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Botol kaca bisa dipakai ulang; kalau pecah, bungkus rapat sebelum dibuang.' },
  { id: 'tetrapak-susu', name: 'Kemasan Tetrapak Susu', emoji: '🥛', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Tetrapak bisa didaur ulang, tapi harus dibilas dan dipipihkan dulu.' },
  { id: 'kantong-plastik-bersih', name: 'Kantong Plastik Bersih', emoji: '🛍️', category: 'anorganik', subtype: 'recyclable',
    funFact: 'Plastik kresek bersih masih bisa dipakai ulang atau didaur jadi paving block.' },

  // residu non-B3 (masuk anorganik, popup edukasi residu)
  { id: 'popok-bayi', name: 'Popok Bayi', emoji: '🍼', category: 'anorganik', subtype: 'residue',
    funFact: 'Popok adalah residu — tidak bisa didaur ulang. Kurangi dengan popok kain bila memungkinkan.' },
  { id: 'pembalut', name: 'Pembalut', emoji: '🩸', category: 'anorganik', subtype: 'residue',
    funFact: 'Pembalut sekali pakai termasuk residu — bungkus rapat sebelum dibuang.' },
  { id: 'styrofoam-kotor', name: 'Styrofoam Kotor', emoji: '🍱', category: 'anorganik', subtype: 'residue',
    funFact: 'Styrofoam kotor tidak terdaur ulang — pilih wadah pakai ulang sebagai gantinya.' },
  { id: 'sachet', name: 'Sachet Kopi/Mie', emoji: '🥡', category: 'anorganik', subtype: 'residue',
    funFact: 'Sachet multi-layer hampir mustahil didaur ulang — kurangi konsumsi kemasan kecil.' },
  { id: 'masker-bekas', name: 'Masker Bekas', emoji: '😷', category: 'anorganik', subtype: 'residue',
    funFact: 'Gunting tali masker sebelum dibuang agar tidak menjerat satwa.' },

  // 🔴 B3 Rumah Tangga — 8
  { id: 'baterai', name: 'Baterai Bekas', emoji: '🔋', category: 'b3', subtype: null,
    funFact: 'Baterai mengandung logam berat — wajib ke dropbox B3, jangan dicampur sampah biasa.' },
  { id: 'lampu', name: 'Lampu Bekas', emoji: '💡', category: 'b3', subtype: null,
    funFact: 'Lampu LED/neon mengandung merkuri/timbal — serahkan ke titik kumpul B3.' },
  { id: 'obat-kadaluarsa', name: 'Obat Kadaluarsa', emoji: '💊', category: 'b3', subtype: null,
    funFact: 'Obat kadaluarsa dimusnahkan via program puskesmas atau apotek, jangan dibuang ke saluran.' },
  { id: 'pestisida', name: 'Kemasan Pestisida', emoji: '🧪', category: 'b3', subtype: null,
    funFact: 'Bilas tiga kali, lubangi, lalu serahkan ke titik kumpul B3.' },
  { id: 'oli-bekas', name: 'Oli Bekas', emoji: '🛢️', category: 'b3', subtype: null,
    funFact: 'Oli bekas mencemari tanah dan air — bawa ke bengkel resmi yang menerima pelumas bekas.' },
  { id: 'termometer', name: 'Termometer Raksa', emoji: '🌡️', category: 'b3', subtype: null,
    funFact: 'Pecahan raksa sangat beracun — kumpulkan dengan kertas, masukkan botol, serahkan ke B3.' },
  { id: 'elektronik-kecil', name: 'Elektronik Kecil', emoji: '🎧', category: 'b3', subtype: null,
    funFact: 'E-waste mengandung logam berharga sekaligus berbahaya — ikut program e-waste DLH.' },
  { id: 'jarum-suntik', name: 'Jarum Suntik', emoji: '💉', category: 'b3', subtype: null,
    funFact: 'Jarum suntik infeksius — masukkan wadah tahan tusuk lalu serahkan ke fasilitas kesehatan.' }
])

export const WASTE_ITEMS_BY_ID = Object.freeze(
  Object.fromEntries(WASTE_ITEMS.map((item) => [item.id, item]))
)

export const WASTE_ITEMS_BY_CATEGORY = Object.freeze({
  organik: WASTE_ITEMS.filter((i) => i.category === 'organik'),
  anorganik: WASTE_ITEMS.filter((i) => i.category === 'anorganik'),
  b3: WASTE_ITEMS.filter((i) => i.category === 'b3')
})
