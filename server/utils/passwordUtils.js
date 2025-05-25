const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const passwordUtils = {
    // Hash password with salt
    hashPassword: async (password) => {
        try {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            throw new Error('Error hashing password');
        }
    },

    // Verify password
    verifyPassword: async (password, hashedPassword) => {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error('Error verifying password');
        }
    }
};

module.exports = passwordUtils;