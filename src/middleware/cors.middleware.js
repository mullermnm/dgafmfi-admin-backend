const cors = require('cors');

// Define the allowed origins
const allowedOrigins = [
  'https://digaf.et',
  'https://www.digaf.et',
  'https://digaf.et:5100',
  'https://196.188.187.243:5100',
];

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
});

module.exports = corsMiddleware;
