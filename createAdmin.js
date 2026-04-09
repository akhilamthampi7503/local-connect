const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 10).then(console.log);


bcrypt.hash("test123", 10).then(console.log);

bcrypt.hash("1234", 10).then(console.log);