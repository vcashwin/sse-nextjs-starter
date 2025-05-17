import SseExample from "@/components/SseExample";

export default function Home() {
  return (
    <div className="w-full max-w-lg my-8">
      <h1 className="text-2xl font-bold mb-4 text-center">SSE Demo</h1>
      <SseExample />
      <p className="mt-4 text-sm text-gray-600 text-center">
        This component connects to{" "}
        <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
          /api/sse
        </code>{" "}
        and receives updates every 5 seconds.
      </p>
    </div>
  );
}
