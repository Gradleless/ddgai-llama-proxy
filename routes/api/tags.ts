import { ServerResponse, IncomingMessage } from "http";

const models = {
  models: [
    {
      name: "claude-3-haiku-20240307",
      modified_at: "2023-11-04T14:56:49.277302595-07:00",
      size: 7365960935,
      digest: "9f438cb9cd581fc025612d27f7c1a6669ff83a8bb0ed86c94fcf4c5440555697",
      details: {
        format: "gguf",
        family: "llama",
        families: null,
        parameter_size: "13B",
        quantization_level: "Q4_0",
      },
    },
  ],
};

export default (req: IncomingMessage, res: ServerResponse): void => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(models));
};