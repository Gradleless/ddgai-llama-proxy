import { IncomingMessage, ServerResponse } from "http";
import { sendChat } from "../../ddg_api/api";
import type { ChatMessage, PerformanceMetrics } from "../../types/chat";
import {
  addEvaluation,
  getLoadDuration,
  getTotalDuration,
  createMetrics,
} from "../../utils/metrics";
let vqd: string | undefined;

export default async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  let body = "";
  req.on("data", (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const parsed: ChatMessage = JSON.parse(body);

      if (!parsed.stream) {
        res.writeHead(200, {
          "Content-Type": "application/json",
        });
      } else {
        res.writeHead(200, {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
      }
      const metrics = createMetrics();

      parsed.messages.forEach((msg) => {
        if (msg.role !== "user") msg.role = "user";
      });

      const chat = sendChat(parsed.messages, "claude-3-haiku-20240307", vqd);
      const r = await chat;
      const responses = r.body?.getReader();

      if (!responses) return;

      if (parsed.stream === false) {
        await processNonStream(responses, metrics, res);
      } else {
        await processStream(responses, metrics, res);
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

function createResponseObject(
  metrics: PerformanceMetrics,
  content: string,
  isDone: boolean
) {
  const baseObj = {
    model: "claude-3-haiku-20240307",
    created_at: new Date().toISOString(),
  };

  if (isDone) {
    return {
      model: baseObj.model,
      created_at: baseObj.created_at,
      done: true,
      total_duration: Math.round(getTotalDuration(metrics) * 1000000),
      load_duration: Math.round(getLoadDuration(metrics) * 1000000),
      eval_count: metrics.evalCount,
      eval_duration: Math.round(metrics.evalDuration * 1000000),
    };
  }

  return {
    model: baseObj.model,
    created_at: baseObj.created_at,
    message: {
      role: "assistant",
      content: content.trim(),
    },
    done: true,
    total_duration: Math.round(getTotalDuration(metrics) * 1000000),
    load_duration: Math.round(getLoadDuration(metrics) * 1000000),
    eval_count: metrics.evalCount,
    eval_duration: Math.round(metrics.evalDuration * 1000000),
  };
}

async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  metrics: PerformanceMetrics,
  res: ServerResponse
): Promise<void> {
  const decoder = new TextDecoder();

  try {
    while (true) {
      const evalStartTime = performance.now();
      const { value, done } = await reader.read();

      if (done) {
        res.write(JSON.stringify(createResponseObject(metrics, "", true)));
        res.end();
        break;
      }

      if (value) {
        const text = decoder.decode(value);
        addEvaluation(metrics, performance.now() - evalStartTime);
        const jsonStrings = text.match(/\{[^}]+\}/g) || [];

        jsonStrings.forEach((jsonString) => {
          try {
            const json = JSON.parse(jsonString);
            if (json.message) {
              res.write(
                JSON.stringify(
                  createResponseObject(metrics, json.message, false)
                ) + "\n"
              );
              console.log(json);
            }
          } catch (e) {
            console.error("Failed to parse JSON:", jsonString);
          }
        });
      }
    }
  } catch (error) {
    console.error("Stream processing error:", error);
    res.write(JSON.stringify({ error: "Stream processing failed" }));
    res.end();
  }
}

async function processNonStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  metrics: PerformanceMetrics,
  res: ServerResponse
) {
  let fullResponse = "";
  while (true) {
    const evalStartTime = performance.now();
    const { value, done } = await reader.read();

    if (value) {
      const text = new TextDecoder().decode(value);
      const jsonStrings = text.match(/\{[^}]+\}/g) || [];

      addEvaluation(metrics, performance.now() - evalStartTime);

      jsonStrings.forEach((jsonString) => {
        try {
          const json = JSON.parse(jsonString);

          if (json.message) {
            fullResponse += json.message;
          }
        } catch (e) {
          console.error("Failed to parse JSON:", jsonString);
        }
      });
    }

    if (done) {
      const responseObj = createResponseObject(metrics, fullResponse, false);

      res.write(JSON.stringify(responseObj));
      res.end();
      break;
    }
  }
}
