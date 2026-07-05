"use client";

import { useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ConsultPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError("");

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "답변을 가져오지 못했습니다.");
      return;
    }
    setMessages([...next, { role: "assistant", content: data.reply }]);
    setTimeout(
      () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-leaf-700">💬 AI 식물 상담</h1>
      <p className="mb-4 text-sm text-gray-600">
        식물 상태가 궁금할 때 물어보세요. 예: "상추 잎이 노래졌어요"
      </p>

      <div className="flex h-[26rem] flex-col rounded-lg border border-leaf-100 bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400">
              메시지를 입력해 대화를 시작하세요.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-leaf-600 text-white"
                    : "bg-leaf-50 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-leaf-50 px-4 py-2 text-sm text-gray-500">
                답변 작성 중...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <p className="px-4 pb-1 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={send} className="flex gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요"
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
