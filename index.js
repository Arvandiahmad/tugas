const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const client = require("./connection");
const path = require("path");
const routes = require("./route");

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, "view")));
app.use("/public", express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use("/", routes);

if (!client._connected) {
    client.connect((err) => {
        if (err) {
            console.log("Database Connection Error:", err.message);
        } else {
            client._connected = true;
            console.log("Berhasil connect ke database");
        }
    });
}

const storage = multer.diskStorage({
    destination: "public",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

app.get("/siswa", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM siswa ORDER BY id");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching siswa:", error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

app.get("/siswa/:id", (req, res) => {
    const id = parseInt(req.params.id);
    client.query("SELECT * FROM siswa WHERE id = $1", [id], (err, result) => {
        if (!err) {
            res.send(result.rows);
        } else {
            console.error("Database Error:", err.message);
            res.status(500).json({ error: "Terjadi kesalahan server" });
        }
    });
});

app.post("/siswa", upload.single("foto"), async (req, res) => {
    try {
        const { nama_lengkap, jenis_kelamin, tanggal_daftar, kelas } = req.body;
        const imagePath = req.file ? `/public/${req.file.filename}` : null;

        const result = await client.query("SELECT nextval('siswa_id_seq') AS new_id");
        let newId = `SISWA-${result.rows[0].new_id}`;

        const query = "INSERT INTO siswa (foto, id_siswa, nama_lengkap, jenis_kelamin, tanggal_daftar, kelas) VALUES ($1, $2, $3, $4, $5, $6)";
        await client.query(query, [imagePath, newId, nama_lengkap, jenis_kelamin, tanggal_daftar, kelas]);

        res.json({ message: "Data Berhasil Ditambahkan", id_siswa: newId });
    } catch (error) {
        console.error("Error saat menambahkan data:", error.message);
        res.status(500).json({ error: error.message });
    }
});


app.put("/siswa/:id", upload.single("foto"), (req, res) => {
    const id = parseInt(req.params.id);
    const { nama_lengkap, jenis_kelamin, kelas } = req.body;
    const imagePath = req.file ? `/public/${req.file.filename}` : null;

    client.query(`SELECT foto FROM siswa WHERE id = $1`, [id], (err, result) => {
        if (err) {
            return res.status(500).send("Database Error: " + err.message);
        }

        const fotoLama = result.rows[0]?.foto;
        const fotoFinal = imagePath || fotoLama;

        client.query(
            `UPDATE siswa SET nama_lengkap = $1, jenis_kelamin = $2, kelas = $3, foto = $4 WHERE id = $5`,
            [nama_lengkap, jenis_kelamin, kelas, fotoFinal, id],
            (err, result) => {
                if (!err) {
                    res.send("Update Success");
                } else {
                    console.error("Database Error:", err.message);
                    res.status(500).send("Database Error: " + err.message);
                }
            }
        );
    });
});


app.delete("/siswa/:id", (req, res) => {
    const id = parseInt(req.params.id);
    client.query("DELETE FROM siswa WHERE id = $1", [id], (err, result) => {
        if (!err) {
            res.send("Delete Success");
        } else {
            console.error("Database Error:", err.message);
            res.status(500).send("Database Error: " + err.message);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${3001}`);
});
