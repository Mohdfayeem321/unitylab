const express = require('express');

const db = require('./db');

const app = express();

const cors = require('cors');

// Enable CORS for a specific origin;

const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const router = require('./routes/routes');

app.use(express.json());

app.use('/api', router);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`app is running on port : ${PORT}`);
});
