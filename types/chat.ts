export interface ChatMessage {
    model: string;
    messages: {
      role: "user" | "assistant";
      content: string;
    }[];
    stream?: boolean;
}

export interface ChatResponse {
    model: string;
    created_at: string;
    message: {
        role: "user" | "assistant";
        content: string;
        images: string | null;
    };
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

export interface PerformanceMetrics {
  startTime: number;
  loadStartTime: number;
  evalCount: number;
  evalDuration: number;
}





