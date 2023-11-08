const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const nodeEnv = process.env.NODE_ENV || 'development';
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, `.env.${nodeEnv}`)));

module.exports = {
  apps : [{
    name: "tts-bot",
    script: "./app.js",
    watch: true,
    env: envConfig
  }]
}
