import { ServerResponse, IncomingMessage } from "http";

const models = [
  {
    name: "claude-3-haiku-20240307",
    parameter_size: "13B",
    quantization_level: "Q4_0",
  },
];

export default (req: IncomingMessage, res: ServerResponse): void => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(models));
};