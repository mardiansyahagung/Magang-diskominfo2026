// =============================================================
// MODUL: Persuratan (Surat Keluar & Surat Masuk)
// Cara pakai: require dan panggil di server.js (lihat INTEGRASI.md)
// =============================================================
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder upload tersedia
const UPLOAD_DIR = path.join(__dirname, "uploads", "persuratan");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Konfigurasi multer: simpan file dengan nama unik (timestamp + nama asli)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const namaBersih = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${namaBersih}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // maksimal 10MB
  fileFilter: (req, file, cb) => {
    const ekstensiDiizinkan = /\.(pdf|jpg|jpeg|png)$/i;
    if (!ekstensiDiizinkan.test(file.originalname)) {
      return cb(new Error("Format file harus PDF, JPG, atau PNG"));
    }
    cb(null, true);
  },
});

module.exports = function registerPersuratanRoutes(app, db, requireLogin, requireAdmin, catatLog) {
  // Sajikan file yang sudah diupload agar bisa dibuka/preview dari frontend
  app.use("/uploads/persuratan", require("express").static(UPLOAD_DIR));

  // -----------------------------------------------------------
  // SURAT KELUAR
  // -----------------------------------------------------------

  // GET semua surat keluar (join nama domain aset terkait)
  app.get("/api/surat-keluar", requireLogin, (req, res) => {
    const query = `
      SELECT sk.id, sk.aset_id, sk.nomor_surat,
             DATE_FORMAT(sk.tanggal_surat, '%Y-%m-%d') AS tanggal_surat,
             sk.instansi_tujuan, sk.perihal, sk.isi_ringkas, sk.file_surat,
             sk.status, sk.dibuat_oleh, sk.dibuat_pada,
             aw.nama_domain
      FROM surat_keluar sk
      LEFT JOIN aset_web aw ON aw.id = sk.aset_id
      ORDER BY sk.tanggal_surat DESC, sk.id DESC
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil data surat keluar", error: err });
      res.json(results);
    });
  });

  // POST tambah surat keluar (multipart/form-data, field file bernama "file_surat")
  app.post("/api/surat-keluar", requireAdmin, upload.single("file_surat"), (req, res) => {
    const { aset_id, nomor_surat, tanggal_surat, instansi_tujuan, perihal, isi_ringkas } = req.body;
    const dibuatOleh = req.session?.username || null;
    const filePath = req.file ? `/uploads/persuratan/${req.file.filename}` : null;

    if (!aset_id || !nomor_surat || !tanggal_surat || !instansi_tujuan || !perihal) {
      return res.status(400).json({ message: "Field wajib belum lengkap." });
    }

    const query = `
      INSERT INTO surat_keluar (aset_id, nomor_surat, tanggal_surat, instansi_tujuan, perihal, isi_ringkas, file_surat, status, dibuat_oleh)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu Balasan', ?)
    `;
    db.query(
      query,
      [aset_id, nomor_surat, tanggal_surat, instansi_tujuan, perihal, isi_ringkas || "", filePath, dibuatOleh],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal menambah surat keluar", error: err });
        catatLog(req, "tambah", "surat_keluar", results.insertId, `Membuat surat keluar "${nomor_surat}" ke ${instansi_tujuan}`);
        res.json({ message: "Surat keluar berhasil ditambahkan!" });
      },
    );
  });

  // PUT edit surat keluar
  app.put("/api/surat-keluar/:id", requireAdmin, upload.single("file_surat"), (req, res) => {
    const { id } = req.params;
    const { aset_id, nomor_surat, tanggal_surat, instansi_tujuan, perihal, isi_ringkas, status } = req.body;

    db.query("SELECT file_surat FROM surat_keluar WHERE id = ?", [id], (findErr, findResults) => {
      if (findErr) return res.status(500).json({ message: "Gagal memeriksa surat", error: findErr });
      if (findResults.length === 0) return res.status(404).json({ message: "Surat tidak ditemukan" });

      // Kalau ada file baru diupload, pakai yang baru. Kalau tidak, pertahankan file lama.
      const filePath = req.file ? `/uploads/persuratan/${req.file.filename}` : findResults[0].file_surat;

      const query = `
        UPDATE surat_keluar
        SET aset_id = ?, nomor_surat = ?, tanggal_surat = ?, instansi_tujuan = ?, perihal = ?, isi_ringkas = ?, file_surat = ?, status = ?
        WHERE id = ?
      `;
      db.query(
        query,
        [aset_id, nomor_surat, tanggal_surat, instansi_tujuan, perihal, isi_ringkas || "", filePath, status || "Menunggu Balasan", id],
        (err) => {
          if (err) return res.status(500).json({ message: "Gagal mengupdate surat keluar", error: err });
          catatLog(req, "edit", "surat_keluar", id, `Mengedit surat keluar "${nomor_surat}"`);
          res.json({ message: "Surat keluar berhasil diperbarui!" });
        },
      );
    });
  });

  // DELETE surat keluar (surat masuk terkait ikut terhapus via ON DELETE CASCADE)
  app.delete("/api/surat-keluar/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    db.query("SELECT nomor_surat FROM surat_keluar WHERE id = ?", [id], (findErr, findResults) => {
      if (findErr) return res.status(500).json({ message: "Gagal memeriksa surat", error: findErr });
      const nomor = findResults[0]?.nomor_surat || `ID ${id}`;

      db.query("DELETE FROM surat_keluar WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Gagal menghapus surat keluar", error: err });
        catatLog(req, "hapus", "surat_keluar", id, `Menghapus surat keluar "${nomor}"`);
        res.json({ message: "Surat keluar berhasil dihapus." });
      });
    });
  });

  // -----------------------------------------------------------
  // SURAT MASUK
  // -----------------------------------------------------------

  // GET semua surat masuk (join info surat keluar & nama domain aset)
  app.get("/api/surat-masuk", requireLogin, (req, res) => {
    const query = `
      SELECT sm.id, sm.surat_keluar_id, sm.aset_id, sm.nomor_surat,
             DATE_FORMAT(sm.tanggal_surat, '%Y-%m-%d') AS tanggal_surat,
             sm.instansi_asal, sm.perihal, sm.status_penanganan, sm.catatan,
             sm.file_surat, sm.dibuat_oleh, sm.dibuat_pada,
             aw.nama_domain, sk.nomor_surat AS nomor_surat_keluar
      FROM surat_masuk sm
      LEFT JOIN aset_web aw ON aw.id = sm.aset_id
      LEFT JOIN surat_keluar sk ON sk.id = sm.surat_keluar_id
      ORDER BY sm.tanggal_surat DESC, sm.id DESC
    `;
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil data surat masuk", error: err });
      res.json(results);
    });
  });

  // POST tambah surat masuk -> otomatis set surat_keluar terkait jadi "Sudah Dibalas"
  app.post("/api/surat-masuk", requireAdmin, upload.single("file_surat"), (req, res) => {
    const { surat_keluar_id, nomor_surat, tanggal_surat, instansi_asal, perihal, status_penanganan, catatan } = req.body;
    const dibuatOleh = req.session?.username || null;
    const filePath = req.file ? `/uploads/persuratan/${req.file.filename}` : null;

    if (!surat_keluar_id || !nomor_surat || !tanggal_surat || !instansi_asal || !perihal) {
      return res.status(400).json({ message: "Field wajib belum lengkap." });
    }

    // Ambil aset_id dari surat_keluar yang dirujuk, supaya konsisten
    db.query("SELECT aset_id FROM surat_keluar WHERE id = ?", [surat_keluar_id], (findErr, findResults) => {
      if (findErr) return res.status(500).json({ message: "Gagal memeriksa surat keluar rujukan", error: findErr });
      if (findResults.length === 0) return res.status(400).json({ message: "Surat keluar rujukan tidak ditemukan" });

      const asetId = findResults[0].aset_id;

      const query = `
        INSERT INTO surat_masuk (surat_keluar_id, aset_id, nomor_surat, tanggal_surat, instansi_asal, perihal, status_penanganan, catatan, file_surat, dibuat_oleh)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        query,
        [
          surat_keluar_id,
          asetId,
          nomor_surat,
          tanggal_surat,
          instansi_asal,
          perihal,
          status_penanganan || "Sedang Ditangani",
          catatan || "",
          filePath,
          dibuatOleh,
        ],
        (err, results) => {
          if (err) return res.status(500).json({ message: "Gagal menambah surat masuk", error: err });

          // Update status surat keluar rujukan menjadi "Sudah Dibalas"
          db.query("UPDATE surat_keluar SET status = 'Sudah Dibalas' WHERE id = ?", [surat_keluar_id], () => {});

          catatLog(req, "tambah", "surat_masuk", results.insertId, `Mencatat surat masuk "${nomor_surat}" dari ${instansi_asal}`);
          res.json({ message: "Surat masuk berhasil ditambahkan!" });
        },
      );
    });
  });

  // PUT edit surat masuk
  app.put("/api/surat-masuk/:id", requireAdmin, upload.single("file_surat"), (req, res) => {
    const { id } = req.params;
    const { nomor_surat, tanggal_surat, instansi_asal, perihal, status_penanganan, catatan } = req.body;

    db.query("SELECT file_surat FROM surat_masuk WHERE id = ?", [id], (findErr, findResults) => {
      if (findErr) return res.status(500).json({ message: "Gagal memeriksa surat", error: findErr });
      if (findResults.length === 0) return res.status(404).json({ message: "Surat tidak ditemukan" });

      const filePath = req.file ? `/uploads/persuratan/${req.file.filename}` : findResults[0].file_surat;

      const query = `
        UPDATE surat_masuk
        SET nomor_surat = ?, tanggal_surat = ?, instansi_asal = ?, perihal = ?, status_penanganan = ?, catatan = ?, file_surat = ?
        WHERE id = ?
      `;
      db.query(
        query,
        [nomor_surat, tanggal_surat, instansi_asal, perihal, status_penanganan || "Sedang Ditangani", catatan || "", filePath, id],
        (err) => {
          if (err) return res.status(500).json({ message: "Gagal mengupdate surat masuk", error: err });
          catatLog(req, "edit", "surat_masuk", id, `Mengedit surat masuk "${nomor_surat}"`);
          res.json({ message: "Surat masuk berhasil diperbarui!" });
        },
      );
    });
  });

  // DELETE surat masuk
  app.delete("/api/surat-masuk/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    db.query("SELECT nomor_surat FROM surat_masuk WHERE id = ?", [id], (findErr, findResults) => {
      if (findErr) return res.status(500).json({ message: "Gagal memeriksa surat", error: findErr });
      const nomor = findResults[0]?.nomor_surat || `ID ${id}`;

      db.query("DELETE FROM surat_masuk WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Gagal menghapus surat masuk", error: err });
        catatLog(req, "hapus", "surat_masuk", id, `Menghapus surat masuk "${nomor}"`);
        res.json({ message: "Surat masuk berhasil dihapus." });
      });
    });
  });
};
