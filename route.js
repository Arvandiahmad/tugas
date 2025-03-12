const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/tambah', (req, res) => {
    res.sendFile(path.join(__dirname,'view', 'entrysiswa.html'));
});
router.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname,'view', 'ubah.html'));
});
router.get('/detail', (req, res) => {
    res.sendFile(path.join(__dirname,'view', 'detail.html'));
});

module.exports = router;