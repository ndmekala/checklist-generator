const path = require('path');

module.exports = {
  entry: './src/index.js', // The entry point of your Node.js application.
  target: 'node', // Important to specify the target as 'node'.
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory for the bundled file.
    filename: 'bundle.js', // The bundled output file.
  },
};

