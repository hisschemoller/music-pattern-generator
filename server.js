const express = require('express');

const app = express();
const port = process.env.PORT || 3008;

// Set public folder as root
app.use(express.static('src'));

// Listen for HTTP requests on port 3007
app.listen(port, () => {
  console.log('listening on %d', port);
});