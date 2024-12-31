import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

// Types for our API
interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface CreateItemRequest {
  name: string;
  description: string;
}

// In-memory storage for items
const items: Item[] = [];

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// GET /api/items - Get all items
app.get("/api/items", (_req: Request, res: Response) => {
  res.json(items);
});

// POST /api/items - Create a new item
app.post("/api/items", (req: Request, res: Response) => {
  const { name, description } = req.body as CreateItemRequest;

  // Validate request body
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  const newItem: Item = {
    id: Date.now().toString(),
    name,
    description,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
