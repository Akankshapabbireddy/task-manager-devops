const express = require("express");
const { Pool } = require("pg");
require("dotenv").config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API is running",
  });
});

// Application health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
  });
});

// Database health check
app.get("/db-health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "database connected",
      time: new Date(),
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "database connection failed",
    });
  }
});

// Create a task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [title, description || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error.message);

    res.status(500).json({
      error: "Failed to create task",
    });
  }
});

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);

    res.status(500).json({
      error: "Failed to fetch tasks",
    });
  }
});

// Get a single task
app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error.message);

    res.status(500).json({
      error: "Failed to fetch task",
    });
  }
});
// Update a task
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, status || "pending", id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);

    res.status(500).json({
      error: "Failed to update task",
    });
  }
});
// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      error: "Failed to delete task",
    });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});
