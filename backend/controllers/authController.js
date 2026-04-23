const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        if (result.insertId) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    id: result.insertId,
                    name,
                    email,
                    token: generateToken(result.insertId)
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    name: user.full_name,
                    email: user.email,
                    token: generateToken(user.id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            'SELECT id, full_name AS name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        let userProfile = users[0];
        const [addresses] = await pool.query(
            'SELECT address_line1 AS address FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [req.user.id]
        );
        userProfile.address = addresses.length > 0 ? addresses[0].address : '';

        res.status(200).json({ success: true, message: 'Profile fetched', data: userProfile });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    const { name, email, phone, address } = req.body;
    try {
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
        }

        await pool.query(
            'UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?',
            [name, email, phone || null, req.user.id]
        );

        if (address !== undefined) {
             const [addr] = await pool.query('SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
             if (addr.length > 0) {
                 await pool.query('UPDATE addresses SET address_line1 = ?, recipient_name = ?, phone = ? WHERE id = ?', [address, name, phone || '', addr[0].id]);
             } else if (address.trim() !== '') {
                 await pool.query('INSERT INTO addresses (user_id, recipient_name, phone, address_line1, city, state, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, name, phone || '', address, 'City', 'State', '000000']);
             }
        }

        const [updated] = await pool.query(
            'SELECT id, full_name AS name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        let returnUser = updated[0];
        const [updatedAddr] = await pool.query('SELECT address_line1 AS address FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
        returnUser.address = updatedAddr.length > 0 ? updatedAddr[0].address : '';

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: returnUser }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
