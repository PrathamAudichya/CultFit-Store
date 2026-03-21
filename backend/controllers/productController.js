const pool = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const { category, q, minPrice, maxPrice, sort } = req.query;
        let query = 'SELECT * FROM vw_product_summary';
        let params = [];
        let conditions = [];

        if (category) {
            conditions.push('category_name = ?');
            params.push(category);
        }
        if (q) {
            conditions.push('(title LIKE ? OR product_brand LIKE ? OR category_name LIKE ?)');
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (minPrice) {
            conditions.push('active_price >= ?');
            params.push(minPrice);
        }
        if (maxPrice) {
            conditions.push('active_price <= ?');
            params.push(maxPrice);
        }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        if (sort === 'price_asc')       query += ' ORDER BY active_price ASC';
        else if (sort === 'price_desc') query += ' ORDER BY active_price DESC';
        else                            query += ' ORDER BY id ASC';

        const [products] = await pool.query(query, params);

        for (let p of products) {
            const [imgs] = await pool.query(
                'SELECT image_url FROM product_images WHERE product_id = ? AND is_primary = TRUE',
                [p.id]
            );
            p.image_url = imgs.length > 0 ? imgs[0].image_url : null;

            // MySQL DECIMAL columns come back as strings — cast to numbers
            p.active_price    = parseFloat(p.active_price)    || 0;
            p.price           = parseFloat(p.price)           || 0;
            p.discount_price  = p.discount_price != null ? parseFloat(p.discount_price) : null;
            p.tax_percentage  = parseFloat(p.tax_percentage)  || 18;
            p.avg_rating      = parseFloat(p.avg_rating)      || 0;
            p.total_reviews   = parseInt(p.total_reviews)     || 0;
        }

        res.json(products);
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM vw_product_summary WHERE id = ?', [req.params.id]);

        if (products.length > 0) {
            const product = products[0];

            // Description, Stock, Type etc. are in main table not the view
            const [details] = await pool.query(
                'SELECT description, stock, product_type FROM products WHERE id = ?',
                [product.id]
            );
            Object.assign(product, details[0]);

            // Images
            const [images] = await pool.query(
                'SELECT image_url, is_primary FROM product_images WHERE product_id = ?',
                [product.id]
            );
            product.images   = images;
            product.image_url = images.find(img => img.is_primary)?.image_url || null;

            // Fetch reviews
            const [reviews] = await pool.query(`
                SELECT u.full_name AS user_name, r.rating, r.title, r.comment, r.created_at
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC
            `, [product.id]);
            product.reviews = reviews;

            // MySQL DECIMAL columns come back as strings — cast to numbers
            product.active_price   = parseFloat(product.active_price)   || 0;
            product.price          = parseFloat(product.price)          || 0;
            product.discount_price = product.discount_price != null ? parseFloat(product.discount_price) : null;
            product.tax_percentage = parseFloat(product.tax_percentage) || 18;
            product.avg_rating     = parseFloat(product.avg_rating)     || 0;
            product.stock          = parseInt(product.stock)            || 0;

            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('getProductById error:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

module.exports = { getProducts, getProductById };
