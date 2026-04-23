const pool = require('../config/db');

const getProducts = async (req, res, next) => {
    try {
        const { category, q, minPrice, maxPrice, sort } = req.query;
        let selectStr = 'SELECT v.*, p.price AS original_price, p.discount_price, pi.image_url';
        let joinStr = `
            FROM vw_product_summary v
            JOIN products p ON v.id = p.id
            LEFT JOIN product_images pi ON pi.product_id = v.id AND pi.is_primary = TRUE`;
        let params = [];
        let conditions = [];

        if (req.user) {
            selectStr += ', EXISTS(SELECT 1 FROM wishlist w WHERE w.product_id = v.id AND w.user_id = ?) AS inWishlist';
            params.unshift(req.user.id);
        }

        let query = selectStr + joinStr;

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
        else                            query += ' ORDER BY v.id ASC';

        const [products] = await pool.query(query, params);

        for (let p of products) {
            p.active_price    = parseFloat(p.active_price)    || 0;
            p.price           = parseFloat(p.original_price)  || 0;
            p.discount_price  = p.discount_price != null ? parseFloat(p.discount_price) : null;
            p.tax_percentage  = parseFloat(p.tax_percentage)  || 18;
            p.avg_rating      = parseFloat(p.avg_rating)      || 0;
            p.total_reviews   = parseInt(p.total_reviews)     || 0;
            p.inWishlist      = !!p.inWishlist;
            delete p.original_price;
        }

        res.status(200).json({ success: true, message: 'Products fetched', data: products });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        let selectStr = 'SELECT v.*, p.price AS original_price, p.discount_price';
        let joinStr = `
             FROM vw_product_summary v
             JOIN products p ON v.id = p.id
             `;
        let params = [];

        if (req.user) {
            selectStr += ', EXISTS(SELECT 1 FROM wishlist w WHERE w.product_id = v.id AND w.user_id = ?) AS inWishlist';
            params.push(req.user.id);
        }

        joinStr += ' WHERE v.id = ?';
        params.push(req.params.id);

        const [products] = await pool.query(selectStr + joinStr, params);

        if (products.length > 0) {
            const product = products[0];

            const [details] = await pool.query(
                'SELECT description, stock, product_type FROM products WHERE id = ?',
                [product.id]
            );
            Object.assign(product, details[0]);

            const [images] = await pool.query(
                'SELECT image_url, is_primary FROM product_images WHERE product_id = ?',
                [product.id]
            );
            product.images   = images;
            product.image_url = images.find(img => img.is_primary)?.image_url || null;

            const [reviews] = await pool.query(`
                SELECT u.full_name AS user_name, r.rating, r.title, r.comment, r.created_at
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC
            `, [product.id]);
            product.reviews = reviews;

            product.active_price   = parseFloat(product.active_price)   || 0;
            product.price          = parseFloat(product.original_price) || 0;
            delete product.original_price;
            product.discount_price = product.discount_price != null ? parseFloat(product.discount_price) : null;
            product.tax_percentage = parseFloat(product.tax_percentage) || 18;
            product.avg_rating     = parseFloat(product.avg_rating)     || 0;
            product.stock          = parseInt(product.stock)            || 0;
            product.inWishlist     = !!product.inWishlist;

            res.status(200).json({ success: true, message: 'Product fetched', data: product });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, getProductById };
