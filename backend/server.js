const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname, {
    etag: false, // Disable ETag for static files
    lastModified: false // Disable Last-Modified header
}));

app.use(cors({ origin: 'http://localhost:3000' })); // Replace with your client URL

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/api/users", require("./routes/userRoute"));