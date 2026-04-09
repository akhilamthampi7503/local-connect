const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 10).then(console.log);


bcrypt.hash("guide123", 10).then(console.log);

bcrypt.hash("1234", 10).then(console.log);