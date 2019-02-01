const express = require('express');

const app = express();
const port = process.env.PORT || 3008;
const rootDir = process.argv[2] || 'src';

// Set public folder as root
app.use(express.static(rootDir));

// Listen for HTTP requests on port 3007
app.listen(port, () => {
  console.log('listening on %d', port);
});