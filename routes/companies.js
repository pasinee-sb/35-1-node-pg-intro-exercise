const express = require("express");
// const ExpressError = require("./expressError");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (error) {
    return next(error);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const resultCompany = await db.query(
      `SELECT * FROM companies WHERE code = $1`,
      [code]
    );
    if (resultCompany.rows.length === 0) {
      throw new ExpressError("company not found", 404);
    } else {
      const resultInvoice = await db.query(
        `SELECT * FROM invoices WHERE comp_code = $1`,
        [resultCompany.rows[0].code]
      );

      return res.send({
        companies: resultCompany.rows[0],
        invoices: resultInvoice.rows,
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING code , name, description `,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET code = $1, name = $2, description =$3 WHERE code=$1 RETURNING code, name, description`,
      [code, name, description]
    );
    return res.send({ company: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(`DELETE * FROM companies WHERE code = $1 `, [
      code,
    ]);
    if (result.rows.length === 0) {
      throw new ExpressError("company cannot be found", 404);
    }
    return res.send({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
