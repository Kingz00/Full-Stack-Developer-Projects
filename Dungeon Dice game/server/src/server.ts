import db from './db/database.js';
import { createApp } from './app.js';

const app = createApp(db);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});