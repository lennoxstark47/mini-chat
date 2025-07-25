const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./db');
app.use(cors());

sequelize.authenticate().then(() => {
    console.log('Db connected successfully.');
}).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.listen(7000,() => {
    console.log('Server started on port 7000');
});