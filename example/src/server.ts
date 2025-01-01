import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import axios from "axios";

// Types for CoinDesk API
interface CoinDeskTime {
  updated: string;
  updatedISO: string;
  updateduk: string;
}

interface CoinDeskCurrency {
  code: string;
  symbol: string;
  rate: string;
  description: string;
  rate_float: number;
}

interface CoinDeskBPI {
  USD: CoinDeskCurrency;
  GBP: CoinDeskCurrency;
  EUR: CoinDeskCurrency;
}

interface CoinDeskResponse {
  time: CoinDeskTime;
  disclaimer: string;
  chartName: string;
  bpi: CoinDeskBPI;
}

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

// GET /api/currentprice - Get current Bitcoin price
app.get("/api/currentprice", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get<CoinDeskResponse>(
      "https://api.coindesk.com/v1/bpi/currentprice.json",
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Bitcoin price data" });
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
