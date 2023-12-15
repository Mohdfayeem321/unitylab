const db = require('../db');

const JWT = require('jsonwebtoken');

const validate = require('../validator/validator');

//===================== Checking that there is something as Input =====================//

const createUserData = async (req, res) => {

    try {

        // Here we are creating seller table if not exists;

        const createTableSeller = `CREATE TABLE IF NOT EXISTS seller(
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstname VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            confirmPassword VARCHAR(255) NOT NULL,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        // Here we are creating Buyer table if not exists;

        const createTableBuyer = `CREATE TABLE IF NOT EXISTS buyer(
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstname VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            confirmPassword VARCHAR(255) NOT NULL,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        const [Seller] = await db.promise().query(createTableSeller);

        const [Buyer] = await db.promise().query(createTableBuyer);

        console.log('Seller table created successfully');

        // Checking req body if empty;

        if (!validate.checkInputsPresent(req.body)) return res.status(400).send({ status: false, message: "No data found from body! You need to put the Mandatory Fields" });

        // data destructuring;

        console.log(req.body);

        let { firstname, lastname, username, email, password, confirmPassword, usertype } = req.body;

        // checking password with confirm password;

        if (password !== confirmPassword) return res.status(400).send({ status: false, msg: 'Passwords do not matched try again' });

        // checking email validation;

        if (!validate.isValidEmail(email)) return res.status(400).send({ status: false, msg: 'Please Correct the Email Format' });

        // checking valid password;

        if (!validate.isValidpassword(password)) return res.status(400).send({ status: false, msg: 'Please Enter Strong Password' });

        // checking email and username if duplicate;

        let tableName;

        if (usertype == 'seller') {
            tableName = 'seller'
        } else {
            tableName = 'buyer'
        };

        const emailCheckQuery = `SELECT email, username FROM ${tableName} WHERE email = ? OR username = ?`;

        const [isEmail] = await db.promise().query(emailCheckQuery, [email, username]);

        if (isEmail.length > 0 && isEmail[0].username == username) return res.status(400).send({ status: false, msg: 'Username already exist' });

        if (isEmail.length > 0) return res.status(400).send({ status: false, msg: 'Email already exist' });

        //===================== Encrept the password by thye help of Bcrypt =====================//

        const insertQuery = `INSERT INTO  ${tableName} (firstname, lastname, username, email, password, confirmPassword) VALUES (?, ?, ?, ?, ?, ?)`;

        const values = [firstname, lastname, username, email, password, confirmPassword];

        const [results] = await db.promise().query(insertQuery, values);

        if (results.affectedRows === 1) {
            return res.status(200).send({ status: true, msg: 'User Profile Created Successfully' });
        };

    } catch (error) {

        console.error('Error creating users table:', error);

        return res.status(500).send({ status: false, msg: error.message })
    };
};


const loginUser = async (req, res) => {

    try {

        if (!validate.checkInputsPresent(req.body)) return res.status(400).send({ status: false, msg: "No data found from body! You need to put the Mandatory Fields" });

        let { email, username, password, usertype } = req.body;

        if (email && !validate.isValidEmail(email)) { return res.status(400).send({ status: false, msg: "Invalid Email format." }) };

        if (!validate.isValidpassword(password)) { return res.status(400).send({ status: false, msg: "Invalid password format." }) };

        // Checking user exist or not;

        let tableName;
        if (usertype == 'seller') {
            tableName = 'seller';
        } else {
            tableName = 'buyer';
        };

        const [isUser] = await db.promise().query(`SELECT * FROM ${tableName} WHERE email = ? OR username = ?`, [email, username]);

        console.log(isUser);

        if (isUser.length == 0) return res.status(400).send({ status: false, msg: 'User not exist please log in first' });



        //=====================Create a Object for Response=====================//

        let payload = {
            userId: isUser[0]['id'],
            usertype: tableName,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60
        };

        const token = JWT.sign({ payload }, "unitylabs-task-backend", { expiresIn: "2d" });

        let obj = { userId: isUser[0]['id'], token: token }

        req.headers['authorization'] = token;

        return res.status(200).send({ status: true, msg: 'logged in successfully', data: obj });

    } catch (error) {
        console.error('Error getting users:', error);
        return res.status(500).send({ status: false, msg: error.message })
    }
};

// Export the functions;

module.exports = {
    loginUser,
    createUserData,
};

