const express = require("express");
// const ExpressError = require("./expressError");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// id serial PRIMARY KEY,
// comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
// amt float NOT NULL,
// paid boolean DEFAULT false NOT NULL,
// add_date date DEFAULT CURRENT_DATE NOT NULL,
// paid_date date,
// CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError("invoice not found", 404);
    } else {
      const { id, comp_code, amt, paid, add_date, paid_date } = result.rows[0];
      const result2 = await db.query(`SELECT * FROM companies WHERE code =$1`, [
        comp_code,
      ]);
      return res.send({
        invoice: {
          id,
          amt,
          paid,
          add_date,
          paid_date,
          company: result2.rows[0],
        },
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const company = await db.query(`SELECT * FROM companies WHERE CODE=$1`, [
      comp_code,
    ]);
    if (company.rows.length === 0) {
      throw new ExpressError("company not found", 404);
    }
    const result = await db.query(
      `INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING id,comp_code, amt,paid,add_date,paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);

    if (invoice.rows.length === 0) {
      throw new ExpressError("Invoice not found ", 404);
    }
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt = $1 WHERE id=$2 RETURNING id,comp_code, amt,paid,add_date,paid_date`,
      [amt, id]
    );

    return res.send({
      invoice: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);

    if (invoice.rows.length === 0) {
      throw new ExpressError("Invoice not found ", 404);
    }
    const result = await db.query(`DELETE FROM invoices WHERE id = $1 `, [id]);

    return res.send({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
