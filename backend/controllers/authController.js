const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user — schema uses 'full_name', not 'name'
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        if (result.insertId) {
            res.status(201).json({
                id: result.insertId,
                name,          // return 'name' so frontend stays consistent
                email,
                token: generateToken(result.insertId)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.json({
                id: user.id,
                name: user.full_name,  // DB column is full_name, not name
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getMe = async (req, res) => {
    try {
        // Alias full_name as name so frontend receives a consistent 'name' key
        const [users] = await pool.query(
            'SELECT id, full_name AS name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        let userProfile = users[0];
        const [addresses] = await pool.query(
            'SELECT address_line1 AS address FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1',
            [req.user.id]
        );
        userProfile.address = addresses.length > 0 ? addresses[0].address : '';

        res.json(userProfile);
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

const updateProfile = async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        // Validate
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if email is being changed and if it already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email is already in use by another account' });
        }

        // Update profile
        await pool.query(
            'UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?',
            [name, email, phone || null, req.user.id]
        );

        // Update address
        if (address !== undefined) {
             const [addr] = await pool.query('SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
             if (addr.length > 0) {
                 await pool.query('UPDATE addresses SET address_line1 = ?, recipient_name = ?, phone = ? WHERE id = ?', [address, name, phone || '', addr[0].id]);
             } else if (address.trim() !== '') {
                 await pool.query('INSERT INTO addresses (user_id, recipient_name, phone, address_line1, city, state, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, name, phone || '', address, 'City', 'State', '000000']);
             }
        }

        // Fetch updated user to return
        const [updated] = await pool.query(
            'SELECT id, full_name AS name, email, phone FROM users WHERE id = ?',
            [req.user.id]
        );
        let returnUser = updated[0];
        const [updatedAddr] = await pool.query('SELECT address_line1 AS address FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
        returnUser.address = updatedAddr.length > 0 ? updatedAddr[0].address : '';

        res.json({
            message: 'Profile updated successfully',
            user: returnUser
        });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server error updating profile: ' + (error.message || error) });
    }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
