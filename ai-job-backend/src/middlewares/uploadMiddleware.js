const multer = require("multer");

const storage = multer.memoryStorage(); // arquivo em memória
const upload = multer({ storage });

module.exports = upload ;