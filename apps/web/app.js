// KKI - Node.js Application Starter
// This file is required by Netcup's Node.js hosting environment

const path = require('path');
const express = require('express');
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Handle all routes by serving index.html (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KKI Frontend Server running on port ${PORT}`);
});

module.exports = app;
