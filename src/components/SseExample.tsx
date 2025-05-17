"use client";

import { useEffect, useState } from "react";

interface SseData {
  timestamp: string;
  value: number;
  message: string;
  error?: string;
}

export default function SseExample() {
  const [data, setData] = useState<SseData | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      // Clean up any existing connection
      if (eventSource) {
        eventSource.close();
      }

      // Reset states
      setError(null);
      setIsConnected(false);

      try {
        // Connect to our SSE endpoint
        eventSource = new EventSource("/api/sse");

        // Handle connection open
        eventSource.onopen = () => {
          console.log("SSE connection opened");
          setIsConnected(true);
          setError(null);
        };

        // Handle messages
        eventSource.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data) as SseData;
            setData(parsedData);
            setEventCount((prev) => prev + 1);
          } catch (e) {
            console.error("Error parsing SSE data:", e);
            setError("Failed to parse data");
          }
        };

        // Handle errors
        eventSource.onerror = (err) => {
          console.error("SSE connection error:", err);
          setError("Connection error");
          setIsConnected(false);
          eventSource?.close();
          // Try to reconnect after a delay
          setTimeout(connectToSSE, 5000);
        };
      } catch (err) {
        console.error("Failed to connect to SSE:", err);
        setError("Failed to establish connection");
      }
    };

    // Initial connection
    connectToSSE();

    // Clean up on unmount
    return () => {
      console.log("Closing SSE connection");
      eventSource?.close();
    };
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <h2 className="text-xl font-bold mb-4">Server-Sent Events Example</h2>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <p className="text-sm text-gray-500">Events received: {eventCount}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {data && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Latest Data:</h3>
          <p>
            <span className="font-medium">Timestamp:</span>{" "}
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
          <p>
            <span className="font-medium">Value:</span> {data.value}
          </p>
          <p>
            <span className="font-medium">Message:</span> {data.message}
          </p>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Reconnect
      </button>
    </div>
  );
}
