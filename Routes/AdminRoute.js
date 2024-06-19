import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

// GET USER BY TOKEN
router.get("/getuser", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.json({ success: false, error: "user is not authourized" });
  const user = jwt.verify(token, "jwt_secret_key");
  return res.json({ success: true, user });
});

// Admin Login
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * FROM admin where emaill = ?";
  const { emaill, password } = req.body;
  const values = [emaill];
  con.query(sql, [values], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: err });
    console.log(result);
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, result) => {
        if (err)
          return res.json({ loginStatus: false, Error: "Wrong Password" });
        console.log(result);
      });
    }
    if (result) {
      const email = result[0].emaill;
      const token = jwt.sign(
        { role: "admin", email: emaill },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ Status: true, data: result[0], token: token });
    } else {
      return res.json({ Status: false, error: err });
    }
  });
});

//Devloper Login
router.post("/devloper_login", (req, res) => {
  const sql = "SELECT * FROM devloper where email = ?";
  const { email, password } = req.body;
  con.query(sql, [email], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    console.log(result);
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Wrong Password" });
      });
    }
    if (result) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "devloper", email: email },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ Status: true, data: result[0], token: token });
    } else {
      return res.json({ Status: false, error: err });
    }
  });
});

// Admin SignUP
router.post("/adminsignup", (req, res) => {
  const sql = "INSERT INTO admin (`username`, `emaill`, `password`) VALUES (?)";

  bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
    if (err) return res.json({ status: false, Error: err });
    const values = [req.body.username, req.body.emaill, hash];
    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Status: false, Error: err });
      const token = jwt.sign(
        { role: "admin", email: req.body.emaill },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ Status: true, token });
    });
  });
});

//Category
router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

//Add Category
router.post("/add_category", (req, res) => {
  console.log(req.body.category);
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

//DEVELOPER PAGE START

// Image Upload in the developer PAge
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

//  Add the Devloper  Page...
router.post("/add_devlopers", upload.single("image"), (req, res) => {
  const { name, address, password, email, salary, category_id } = req.body;
  const image = req.file?.path;
  if (!name ) {
    return res
      .status(400)
      .json({ Status: false, Error: "NAME required fields" });
  }
  if (!email ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Email required fields" });
  }

  if (!password ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Password required fields" });
  }


  if (!salary ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Salary required fields" });
  }
  if (!address ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Address required fields" });
  }

  if (!image ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Image required fields" });
  }
  if (!category_id ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Category required fields" });
  }
  
  const sql =
    "INSERT INTO devloper (`name`, `email`, `password`, `salary`, `address`, `image`, `category_id`) VALUES (?)";
  

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: err });
    const values = [name, email, hash, salary, address, image, category_id];
    con.query(sql, [values], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ Status: false, Error: err });
      } else {
        return res.json({ success: true, data: result });
      }
    });
  });
});

// show the list of Devloper
router.get("/getdeveloper", (req, res) => {
  const sql = "SELECT * FROM devloper";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// select the id from devloper
router.get("/finddeveloper", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM devloper WHERE id =?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

//  Edit the devloper list
router.put("/edit_devloper/:id", (req, res) => {
  const id = req.params.id;
  const {name,email,salary,address,category_id} = req.body
  const values = [name,email,salary,address,category_id,];
  
  if (!name ) {
    return res
      .status(400)
      .json({ Status: false, Error: "NAME required fields" });
  }
  if (!email ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Email required fields" });
  }

  if (!salary ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Salary required fields" });
  }
  if (!address ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Address required fields" });
  }

  if (!category_id ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Category required fields" });
  }

  const sql = `UPDATE devloper SET name = ?, email = ?, salary = ?, address = ?, category_id = ? Where id = ? `;
  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// Delete  the  devloper list
router.delete("/delete_devloper/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const sql = "DELETE FROM devloper WHERE id =?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// TASK PAGE START

// SHOW the list of TASK
router.get("/get_task_list", (req, res) => {
  const sql = "SELECT * FROM task";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// Add The TASk Page..
router.post("/add_tasks", (req, res) => {
  const { name, description, duration, devloper_id, category_id, status } = req.body;

   // Check if all required fields are present
   if (!name ) {
    return res
      .status(400)
      .json({ Status: false, Error: "NAME required fields" });
  }
  if (!description ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Description required fields" });
  }
  if (!duration) {
    return res
      .status(400)
      .json({ Status: false, Error: "DURATION required fields" });
  }
  if (!devloper_id) {
    return res
      .status(400)
      .json({ Status: false, Error: "Devloper required fields" });
  }
  if (!category_id ) {
    return res
      .status(400)
      .json({ Status: false, Error: "category required fields" });
  }
  if (!status ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Status required fields" });
  }


  const sql =
    "INSERT INTO task (`name`,`description`, `duration`,`devloper_id`,`category_id`,`status`) VALUES (?)";
 
  const values = [name, description, duration, devloper_id, category_id, status];
  con.query(sql, [values], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ Status: false, Error: err });
    } else {
      return res.json({
        success: true,
        data: result,
      });
    }
  });
});

//TASK TABLE ADD the CATEGORY TABLE AND DEVLOPER TABLE
router.get("/get_task", (req, res) => {
  const sql =
    "SELECT t.name as task_name , t.id as id, c.name as category , t.status as status, t.duration as duration, t.description, d.name as devloper_name FROM task t JOIN devloper d ON t.devloper_id = d.id JOIN category as c ON t.category_id = c.id";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

// select the id from task
router.get("/get_task/:id", (req, res) => {
  const id = req.params.id;
  const sql =
    "SELECT t.name as task_name , t.id as id, c.name as category , t.status as status, t.duration as duration, t.description, d.name as devloper_name,t.devloper_id as d_id,t.category_id as c_id FROM task t JOIN devloper d ON t.devloper_id = d.id JOIN category as c ON t.category_id = c.id where t.id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ Status: true, Result: result });
  });
});

//EDIT the TASK List
router.put("/edit_task/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, duration, devloper_id, category_id, status } = req.body;

  // Check if all required fields are present
  if (!name ) {
    return res
      .status(400)
      .json({ Status: false, Error: "NAME required fields" });
  }
  if (!description ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Description required fields" });
  }
  if (!duration) {
    return res
      .status(400)
      .json({ Status: false, Error: "DURATION required fields" });
  }
  if (!devloper_id) {
    return res
      .status(400)
      .json({ Status: false, Error: "Devloper required fields" });
  }
  if (!category_id ) {
    return res
      .status(400)
      .json({ Status: false, Error: "category required fields" });
  }
  if (!status ) {
    return res
      .status(400)
      .json({ Status: false, Error: "Status required fields" });
  }

  const sql = `
    UPDATE task 
    SET name = ?, description = ?, duration = ?, devloper_id = ?, category_id = ?, status = ?
    WHERE id = ?
  `;

  const values = [name, description, duration, devloper_id, category_id, status, id];
  con.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, Error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ Status: false, Error: "Task not found" });
    }
    return res.json({ Status: true, Result: "Task updated successfully" });
  });
});

//Delete the TASk list
router.delete("/delete_task/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM task WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    return res.json({ success: true, Result: result });
  });
});

// Status_bar admin counting
router.get("/admin_count", (req, res) => {
  const sql = "select count(idadmin) as admin from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Status_bar devloper counting
router.get("/devloper_count", (req, res) => {
  const sql = "select count(id) as devloper from devloper";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

//  Status_Bar Salary Counting
router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp from devloper";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Status_Bar How many Admin Presents
router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Logout from the Task Manager
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

// Profile Page
router.get("/profileDetails", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, "jwt_secret_key", (err, result) => {
    let role = result.role;
    if (err) return res.json({ Status: false, Error: err });

    if (result.role === "admin") {
      const sql = "SELECT * FROM admin WHERE emaill =?";
      con.query(sql, [result.email], (err, result) => {
        if (err) return res.json({ Status: false, Error: err });
        result[0].role = role;
        return res.json({ Status: true, Result: result[0] });
      });
    } else {
      const sql = "SELECT * FROM devloper WHERE email = ?";
      con.query(sql, [result.email], (err, result) => {
        if (err) return res.json({ Status: false, Error: err });
        result[0].role = role;
        return res.json({ Status: true, Result: result[0] });
      });
    }
  });
});
export { router as adminRouter };
