import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mainRoutes from './routes/index.js'; // Note the .js extension

const app = express();
const PORT = 3000;

// Manually recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the routes
app.use('/', mainRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});