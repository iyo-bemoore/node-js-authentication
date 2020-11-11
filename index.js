const express = require('express');
require('./db/mongoose');
const app = express();
const PORT = process.env.PORT || 8000
app.listen(PORT,()=>console.log(`Listening on ${PORT}`));