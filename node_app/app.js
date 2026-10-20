 const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Task Management API";

// In-memory database for practice
let tasks = [
  {
    id: crypto.randomUUID(),
    title: "Learn Docker",
    description: "Learn how to build and run Docker containers",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Push image to Docker Hub",
    description: "Practice tagging and pushing Docker images",
    completed: false,
    createdAt: new Date().toISOString()
  }
];

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });

  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log(`${method} ${url.pathname}`);

  // Health check
  if (method === "GET" && url.pathname === "/") {
    return sendResponse(res, 200, {
      message: `Welcome to ${APP_NAME}`,
      status: "running",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  }

  // Get all tasks
  if (method === "GET" && url.pathname === "/api/tasks") {
    return sendResponse(res, 200, {
      count: tasks.length,
      tasks: tasks
    });
  }

  // Get one task
  if (
    method === "GET" &&
    url.pathname.startsWith("/api/tasks/")
  ) {
    const id = url.pathname.split("/")[3];

    const task = tasks.find(task => task.id === id);

    if (!task) {
      return sendResponse(res, 404, {
        error: "Task not found"
      });
    }

    return sendResponse(res, 200, task);
  }

  // Create a task
  if (method === "POST" && url.pathname === "/api/tasks") {
    try {
      const body = await parseBody(req);

      if (!body.title) {
        return sendResponse(res, 400, {
          error: "Title is required"
        });
      }

      const newTask = {
        id: crypto.randomUUID(),
        title: body.title,
        description: body.description || "",
        completed: false,
        createdAt: new Date().toISOString()
      };

      tasks.push(newTask);

      return sendResponse(res, 201, {
        message: "Task created successfully",
        task: newTask
      });

    } catch (error) {
      return sendResponse(res, 400, {
        error: error.message
      });
    }
  }

  // Delete a task
  if (
    method === "DELETE" &&
    url.pathname.startsWith("/api/tasks/")
  ) {
    const id = url.pathname.split("/")[3];

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return sendResponse(res, 404, {
        error: "Task not found"
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    return sendResponse(res, 200, {
      message: "Task deleted successfully",
      task: deletedTask[0]
    });
  }

  // 404
  return sendResponse(res, 404, {
    error: "Route not found",
    path: url.pathname
  });
});

// Handle server errors
server.on("error", error => {
  console.error("Server error:", error);
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`
========================================
 ${APP_NAME}
========================================
 Server running on port: ${PORT}
 Environment: ${process.env.NODE_ENV || "development"}
========================================
`);
});
