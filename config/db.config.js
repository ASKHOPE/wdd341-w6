const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  url: process.env.MONGODB_URI,
  url: process.env.MONGO_API_KEY,
  url: process.env.CLIENT_ID,
  url: process.env.CLIENT_SECRET,
  url: process.env.CALL_URL,
  url: process.env.SESSION_SECRET,
};


