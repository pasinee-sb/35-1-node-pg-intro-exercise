/** Database setup for BizTime. */
const { Client } = require("pg");
let DB_URI;
let db;

//If we're running in "test" mode, create and use our test db

if (process.env.NODE_ENV === "test") {
  // DB_URI = "postgresql:///biztime_test
  db = new Client({
    host: "/var/run/postgresql/",
    database: "biztime_test",
  });
} else {
  // DB_URI = "postgresql:///biztime
  db = new Client({ host: "/var/run/postgresql/", database: "biztime" });
}

// db = new Client({

//   connectionString: DB_URI,
// });
db.connect();
module.exports = db;
