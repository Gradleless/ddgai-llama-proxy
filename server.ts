import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // Extract the route (e.g., `/api/tags`)
    const route = req.url?.split('?')[0];

    if (!route) throw new Error("No route provided");

    // Dynamically import the corresponding route handler
    const routePath = path.join(__dirname, "routes", route + ".ts");
    const handler = require(routePath);

    // Call the route handler
    await handler.default(req, res);
  } catch (err) {
    console.error(err);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found or an error occurred" }));
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});