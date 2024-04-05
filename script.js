// Load environment variables form .env file using dotenv
require('dotenv').config()

// Get the API key from the environment variable
const apiKey = process.env.WEATHER_API_KEY
