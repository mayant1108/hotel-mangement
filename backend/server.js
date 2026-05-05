import dotenv from 'dotenv';
import app from './src/app.js';

// Load environment variables BEFORE anything else
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});