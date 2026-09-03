const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const registerPersuratanRoutes = require("./persuratanRoutes");
const app = express();

// 1. Konfigurasi CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Session Configuration
app.use(
  session({
    secret: "kunci_rahasia_garut_dev",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 jam
  }),
);

// 3. Koneksi Database
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "",
  database: "satria_garut",
});

db.connect((err) => {
  if (err) {
    console.error("Gagal koneksi ke database:", err.message);
  } else {
    console.log("Berhasil terkoneksi ke MySQL.");

    // Otomatis buat tabel users jika belum ada (dengan kolom role)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createTableQuery, (tableErr) => {
      if (tableErr) {
        console.error("Gagal memastikan tabel users:", tableErr.message);
        return;
      }

      // Jaga-jaga untuk tabel users lama yang belum punya kolom role
      db.query(
        `ALTER TABLE users ADD COLUMN role ENUM('admin','user') NOT NULL DEFAULT 'user'`,
        (alterErr) => {
          // Abaikan error "kolom sudah ada" (ER_DUP_FIELDNAME), tampilkan error lain saja
          if (alterErr && alterErr.code !== "ER_DUP_FIELDNAME") {
            console.error("Gagal menambahkan kolom role:", alterErr.message);
          }
        },
      );
    });

    // Otomatis buat tabel log_aktivitas jika belum ada
    const createLogTableQuery = `
      CREATE TABLE IF NOT EXISTS log_aktivitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) DEFAULT NULL,
        aksi VARCHAR(50) NOT NULL,
        target_tabel VARCHAR(50) NOT NULL,
        target_id INT DEFAULT NULL,
        detail TEXT DEFAULT NULL,
        waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createLogTableQuery, (logTableErr) => {
      if (logTableErr) {
        console.error(
          "Gagal memastikan tabel log_aktivitas:",
          logTableErr.message,
        );
        return;
      }
    });
  }
});

// --- Helper: Catat satu baris log aktivitas (dipanggil setelah aksi berhasil) ---
function catatLog(req, aksi, targetTabel, targetId, detail) {
  const username = req.session?.username || "system";
  db.query(
    "INSERT INTO log_aktivitas (username, aksi, target_tabel, target_id, detail) VALUES (?, ?, ?, ?, ?)",
    [username, aksi, targetTabel, targetId || null, detail || null],
    (err) => {
      // Kegagalan mencatat log tidak boleh menggagalkan aksi utama, cukup di-log ke console
      if (err) console.error("Gagal mencatat log aktivitas:", err.message);
    },
  );
}

// 4. Middleware Otorisasi
function requireLogin(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: "Belum login" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: "Belum login" });
  }
  if (req.session.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang boleh mengakses fitur ini." });
  }
  next();
}

registerPersuratanRoutes(app, db, requireLogin, requireAdmin, catatLog);

// 5. API Auth
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi!" });
  }

  try {
    // Cek apakah ini user pertama di sistem -> otomatis jadi admin
    db.query(
      "SELECT COUNT(*) AS total FROM users",
      async (countErr, countResults) => {
        if (countErr) {
          console.error("Error cek jumlah user:", countErr.message);
          return res
            .status(500)
            .json({ message: "Error server saat memeriksa data user" });
        }

        const isUserPertama = countResults[0].total === 0;
        const role = isUserPertama ? "admin" : "user";

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          [username, hashedPassword, role],
          (err) => {
            if (err) {
              console.error("Error Register MySQL:", err.message);
              if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                  message:
                    "Username sudah digunakan, silakan pakai username lain.",
                });
              }
              return res
                .status(400)
                .json({ message: `Gagal registrasi: ${err.message}` });
            }
            return res.json({
              success: true,
              message: isUserPertama
                ? "Registrasi berhasil! Kamu terdaftar sebagai admin pertama."
                : "Registrasi berhasil!",
            });
          },
        );
      },
    );
  } catch (error) {
    return res.status(500).json({ message: "Error server hashing password" });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi!" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error Login MySQL:", err.message);
        return res.status(500).json({ message: "Error database server" });
      }

      if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
          req.session.isLoggedIn = true;
          req.session.username = username;
          req.session.role = results[0].role || "user";
          return res.json({
            success: true,
            message: "Login berhasil!",
            user: { username: results[0].username, role: req.session.role },
          });
        }
      }
      return res.status(401).json({ message: "Username atau Password salah!" });
    },
  );
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: "Logout berhasil" });
});

app.get("/api/me", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: "Belum login" });
  }
  return res.json({
    username: req.session.username,
    role: req.session.role || "user",
  });
});

// 6. API Manajemen User (khusus Admin)
app.get("/api/users", requireAdmin, (req, res) => {
  db.query(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at ASC",
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengambil data user", error: err });
      res.json(results);
    },
  );
});

app.put("/api/users/:id/role", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role tidak valid. Gunakan 'admin' atau 'user'." });
  }

  // Cegah demote diri sendiri sehingga sistem kehilangan admin terakhir
  db.query(
    "SELECT username, role FROM users WHERE id = ?",
    [id],
    (findErr, findResults) => {
      if (findErr)
        return res
          .status(500)
          .json({ message: "Gagal memeriksa data user", error: findErr });
      if (findResults.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });

      const targetUsername = findResults[0].username;
      const targetSaatIni = findResults[0].role;

      if (targetSaatIni === "admin" && role === "user") {
        db.query(
          "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'",
          (cntErr, cntResults) => {
            if (cntErr)
              return res.status(500).json({
                message: "Gagal memeriksa jumlah admin",
                error: cntErr,
              });
            if (cntResults[0].total <= 1) {
              return res.status(400).json({
                message:
                  "Tidak bisa menurunkan admin terakhir. Tunjuk admin lain dahulu.",
              });
            }
            ubahRole();
          },
        );
      } else {
        ubahRole();
      }

      function ubahRole() {
        db.query(
          "UPDATE users SET role = ? WHERE id = ?",
          [role, id],
          (err) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Gagal mengubah role", error: err });
            catatLog(
              req,
              "ubah_role",
              "users",
              id,
              `Mengubah role user "${targetUsername}" menjadi ${role}`,
            );
            res.json({ message: `Role user berhasil diubah menjadi ${role}.` });
          },
        );
      }
    },
  );
});

app.delete("/api/users/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT username, role FROM users WHERE id = ?",
    [id],
    (findErr, findResults) => {
      if (findErr)
        return res
          .status(500)
          .json({ message: "Gagal memeriksa data user", error: findErr });
      if (findResults.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });

      if (findResults[0].role === "admin") {
        return res.status(400).json({
          message:
            "Akun admin tidak bisa dihapus. Turunkan role-nya dahulu jika perlu.",
        });
      }

      const targetUsername = findResults[0].username;

      db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal menghapus user", error: err });
        catatLog(
          req,
          "hapus_user",
          "users",
          id,
          `Menghapus user "${targetUsername}"`,
        );
        res.json({ message: "User berhasil dihapus." });
      });
    },
  );
});

// 7. API Data & Statistik
app.get("/api/statistik", requireLogin, (req, res) => {
  const query = `
    SELECT 
      COUNT(*) AS total_aset,
      SUM(is_aktif = 1) AS web_aktif,
      SUM(is_aktif = 0) AS web_mati,
      SUM(indikasi_judol = 1) AS kasus_judol,
      SUM(kebocoran_data = 1) AS kasus_bocor
    FROM aset_web
  `;

  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil statistik", error: err });
    res.json(results[0]);
  });
});

app.get("/api/aset", requireLogin, (req, res) => {
  const query = `
    SELECT id, nama_domain, jenis_aset, is_aktif, jenis_anomali, 
           DATE_FORMAT(tanggal_insiden, '%Y-%m-%d') AS tanggal_insiden, 
           status_perbaikan, catatan, dibuat_oleh 
    FROM aset_web 
    ORDER BY id ASC
  `;

  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil data aset", error: err });
    res.json(results);
  });
});

app.post("/api/aset", requireAdmin, (req, res) => {
  const {
    nama_domain,
    jenis_aset,
    is_aktif,
    jenis_anomali,
    tanggal_insiden,
    catatan,
    status_perbaikan,
  } = req.body;
  const dibuatOleh = req.session?.username || null;
  const query = `INSERT INTO aset_web (nama_domain, jenis_aset, is_aktif, jenis_anomali, tanggal_insiden, status_perbaikan, catatan, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      nama_domain,
      jenis_aset || "Web Dinas / SKPD",
      is_aktif ?? 1,
      jenis_anomali || "Aman",
      tanggal_insiden || null,
      status_perbaikan || "Belum Ditangani",
      catatan || "",
      dibuatOleh,
    ],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal menambah aset", error: err });
      catatLog(
        req,
        "tambah",
        "aset_web",
        results.insertId,
        `Menambahkan aset baru: ${nama_domain}`,
      );
      res.json({ message: "Berhasil ditambahkan!" });
    },
  );
});

app.put("/api/aset/pulihkan/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT nama_domain FROM aset_web WHERE id = ?",
    [id],
    (findErr, findResults) => {
      if (findErr)
        return res
          .status(500)
          .json({ message: "Gagal memeriksa data aset", error: findErr });
      const namaDomain = findResults[0]?.nama_domain || `ID ${id}`;

      const query = `
      UPDATE aset_web 
      SET is_aktif = 1, jenis_anomali = 'Aman', status_perbaikan = 'Aman' 
      WHERE id = ?
    `;

      db.query(query, [id], (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal memulihkan aset", error: err });
        catatLog(
          req,
          "pulihkan",
          "aset_web",
          id,
          `Memulihkan aset "${namaDomain}" menjadi Aman`,
        );
        res.json({ message: "Aset berhasil dipulihkan dan kembali aman!" });
      });
    },
  );
});

app.put("/api/aset/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const {
    nama_domain,
    jenis_aset,
    is_aktif,
    jenis_anomali,
    tanggal_insiden,
    catatan,
    status_perbaikan,
  } = req.body;

  const query = `
    UPDATE aset_web 
    SET nama_domain = ?, jenis_aset = ?, is_aktif = ?, jenis_anomali = ?, tanggal_insiden = ?, status_perbaikan = ?, catatan = ? 
    WHERE id = ?
  `;

  db.query(
    query,
    [
      nama_domain,
      jenis_aset || "Web Dinas / SKPD",
      is_aktif,
      jenis_anomali || "Aman",
      tanggal_insiden || null,
      status_perbaikan || "Belum Ditangani",
      catatan || "",
      id,
    ],
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Gagal mengupdate aset", error: err });
      catatLog(
        req,
        "edit",
        "aset_web",
        id,
        `Mengedit data aset: ${nama_domain}`,
      );
      res.json({ message: "Data berhasil diupdate!" });
    },
  );
});

app.delete("/api/aset/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT nama_domain FROM aset_web WHERE id = ?",
    [id],
    (findErr, findResults) => {
      if (findErr)
        return res
          .status(500)
          .json({ message: "Gagal memeriksa data aset", error: findErr });
      const namaDomain = findResults[0]?.nama_domain || `ID ${id}`;

      const query = "DELETE FROM aset_web WHERE id = ?";

      db.query(query, [id], (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Gagal menghapus aset", error: err });
        catatLog(
          req,
          "hapus",
          "aset_web",
          id,
          `Menghapus aset "${namaDomain}"`,
        );
        res.json({ message: "Data berhasil dihapus!" });
      });
    },
  );
});

// 7b. API Log Aktivitas (khusus Admin)
app.get("/api/log-aktivitas", requireAdmin, (req, res) => {
  const query = `
    SELECT id, username, aksi, target_tabel, target_id, detail, 
           DATE_FORMAT(waktu, '%Y-%m-%d %H:%i:%s') AS waktu
    FROM log_aktivitas
    ORDER BY waktu DESC
    LIMIT 300
  `;

  db.query(query, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal mengambil log aktivitas", error: err });
    res.json(results);
  });
});

// 8. Jalankan Server
app.listen(3000, () => {
  console.log("Server API menyala di http://localhost:3000");
});
