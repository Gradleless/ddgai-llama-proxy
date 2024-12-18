import { IncomingMessage, ServerResponse } from "http";
import { sendChat } from "../../ddg_api/api";
import type { ChatMessage } from "../../types/chat";

let vqd: string | undefined;

export default async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let body = "";
  req.on("data", (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const parsed: { messages: ChatMessage[] } = JSON.parse(body);

      // Validate and ensure messages are formatted correctly
      parsed.messages.forEach((msg) => {
        if (msg.role !== "user") msg.role = "user";
      });

      const chat = sendChat(parsed.messages, "claude-3-haiku-20240307", vqd);
      const r = await chat;
      const responses = r.body?.getReader();

      if (!responses) return;

      while (true) {
        const { value, done } = await responses.read();
        if (value) {
          const text = new TextDecoder().decode(value);

          // if text is empty, skip
          if (!text.trim()) continue;
          res.write(`data: ${text}\n`);
        }
        if (done) {
          res.write("data: [DONE]\n");
          res.end();
          break;
        }
      }
    } catch (e) {
      console.error(e);
      res.end("Error occurred");
    }
  });

  req.on("close", () => {
    console.log("Connection closed");
  });
};
