const db = require('../db');

// Sellers can build a catalog of items, with each item having a name and price;

// APIs for seller
// POST / api / seller / create - catalog

const createCatalog = async (req, res) => {

    try {

        const dataArray = req.body;

        console.log(16, dataArray);

        // Here we are creating user table if not exists;

        const createCatalogQuery = `CREATE TABLE IF NOT EXISTS items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                seller_id INT,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (seller_id) REFERENCES seller(id)
            )`;

        const [result] = await db.promise().query(createCatalogQuery);

        console.log('Catalog table created successfully');

        const tableName = 'items';

        // Create a placeholder for the values


        const sellerId = req.token.payload.userId;

        dataArray.map((obj) => obj.seller_id = sellerId);

        const placeholders = dataArray.map(() => '(?, ?, ?)').join(', ');

        // Extract column names from the first object
        let columns = Object.keys(dataArray[0]).join(', ');

        console.log(req.token);

        // columns+= ", " + 'seller_id';

        // console.log(47,columns);

        const isSellerQuery = `SELECT * FROM seller WHERE id = ?`;

        const [isSeller] = await db.promise().query(isSellerQuery, sellerId);

        if (isSeller.length == 0) {
            return res.status(401).send({ status: false, msg: "You are not a seller" })
        };

        // Extract values from the array of objects
        const values = dataArray.map(obj => Object.values(obj)).flat();

        // Construct the SQL query
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES ${placeholders}`;

        // Execute the query
        const [response] = await db.promise().query(sql, values);

        return res.status(200).send({ status: true, msg: "Data inserted successfully", data: response })

    } catch (error) {
        console.error('Error getting users:', error);
        return res.status(500).send({ status: false, msg: error.message })
    }
}

// APIs for buyers

// GET /api/buyer/seller-catalog/:seller_id

const sellerCatalogList = async (req, res) => {

    try {

        const { seller_id } = req.params;

        const listCatalogQuery = `SELECT * FROM items WHERE seller_id = ?`;

        const [listCatalog] = await db.promise().query(listCatalogQuery, seller_id);

        return res.status(500).send({ status: false, msg: 'fetched catalog successfully', data: listCatalog });

    } catch (error) {
        console.error('Error getting users:', error);
        return res.status(500).send({ status: false, msg: error.message })
    }

};

// GET / api / buyer / list - of - seller
// Get a list of all seller

const sellerList = async (req, res) => {

    try {

        const sellerListQuery = 'SELECT * FROM seller';

        const [result] = await db.promise().query(sellerListQuery);

        return res.status(200).send({ status: true, msg: 'fetched seller list successfully', data: result });

    } catch (error) {
        console.error('Error getting users:', error);
        return res.status(500).send({ status: false, msg: error.message })
    }

};

// POST / api / buyer / create - order /: seller_id

// Send a list of items to create an order for seller with id = seller_id

const createOrder = async (req, res) => {

    // const sellerId = req.params.sellerId;

    try {

        // Here we are creating user table if not exists;

        const createOrderQuery = `CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            buyer_id INT,
            seller_id INT,
            FOREIGN KEY(buyer_id) REFERENCES buyer(id),
            FOREIGN KEY(seller_id) REFERENCES seller(id)
            )`;

        const createOrderItemsQuery = `CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT,
            item_id INT,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(item_id) REFERENCES items(id)
            )`;


        const [result1] = await db.promise().query(createOrderQuery);

        const [result2] = await db.promise().query(createOrderItemsQuery);

        const { seller_id } = req.params;

        const { buyerId, items } = req.body;


        // Start a transaction
        await db.promise().query('START TRANSACTION');

        // Insert into orders table
        const [orderResult] = await db.promise().query('INSERT INTO orders (buyer_id, seller_id) VALUES (?, ?)', [buyerId, seller_id]);
        const orderId = [orderResult][0].insertId;

        // Insert into order_items table
        const values = items.map(item => [orderId, item.itemId]);
        await db.promise().query('INSERT INTO order_items (order_id, item_id) VALUES ?', [values]);

        // Commit the transaction
        await db.promise().query('COMMIT');

        res.json({ message: 'Order created successfully', orderId });
    } catch (error) {
        // Rollback the transaction in case of an error
        await db.promise().query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET / api / seller / orders
// Retrieve the list of orders received by a seller

const orderList = async (req, res) => {

    try {

        const sellerId = req.token.payload.userId;

        const orderListQuery = 'SELECT * FROM orders WHERE seller_id = ?';

        const [result] = await db.promise().query(orderListQuery, [sellerId]);

        return res.status(200).send({ status: true, msg: 'fetched orders list successfully', data: result });

    } catch (error) {
        console.error('Error getting orders:', error);
        return res.status(500).send({ status: false, msg: error.message })
    }

};

// Export the functions;

module.exports = {
    createCatalog,
    sellerCatalogList,
    sellerList,
    createOrder,
    orderList
};
