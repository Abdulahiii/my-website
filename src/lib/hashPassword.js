const bcrypt = require('bcryptjs');

const password = 'password123'; 
const hashedPassword = bcrypt.hashSync(password, 10);

console.log(`Hashed password: ${hashedPassword}`);
