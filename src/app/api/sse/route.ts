import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const config = {
  runtime: "nodejs",
};

// Mock function to simulate fetching data from an API
async function fetchDataFromApi() {
  // Simulate API call with random data
  const randomValue = Math.floor(Math.random() * 100);
  return {
    timestamp: new Date().toISOString(),
    value: randomValue,
    message: `Random update: ${randomValue}`,
  };
}

// This sets up the proper headers for SSE
export async function GET(request: Request) {
  // Create an AbortController to handle connection termination
  const abortController = new AbortController();
  const { signal } = abortController;

  // Set up request cleanup when the client disconnects
  // This is crucial for handling client disconnections
  request.signal.addEventListener("abort", () => {
    console.log("Client disconnected, aborting SSE connection");
    abortController.abort();
  });

  // Set up the headers for SSE
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };

  // Connection state management
  let isConnectionClosed = false;
  let intervalId: NodeJS.Timeout | null = null;

  // Function to safely close the connection
  const closeConnection = () => {
    if (!isConnectionClosed) {
      isConnectionClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      console.log("SSE connection closed and resources cleaned up");
    }
  };

  // Listen for abort signal
  signal.addEventListener("abort", closeConnection);

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      // Function to send an event
      const sendEvent = async () => {
        // Don't attempt to send if connection is closed
        if (isConnectionClosed || signal.aborted) {
          closeConnection();
          return;
        }

        try {
          const data = await fetchDataFromApi();

          // Format the data for SSE
          // Each message needs to be formatted as "data: {json}\n\n"
          const formattedData = `data: ${JSON.stringify(data)}\n\n`;

          // Safely enqueue data only if controller is available
          try {
            controller.enqueue(new TextEncoder().encode(formattedData));
          } catch (enqueueError) {
            // Controller is likely closed
            console.error("Controller error:", enqueueError);
            closeConnection();
            controller.close();
          }
        } catch (error) {
          console.error("Error fetching data:", error);

          // Only try to send error if connection is still active
          if (!isConnectionClosed && !signal.aborted) {
            try {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    error: "Failed to fetch data",
                  })}\n\n`
                )
              );
            } catch (enqueueError) {
              // Controller is likely closed
              console.error(
                "Controller error during error handling:",
                enqueueError
              );
              closeConnection();
              controller.close();
            }
          }
        }
      };

      // Send initial data immediately
      await sendEvent();

      // Set up interval to poll every 5 seconds
      intervalId = setInterval(sendEvent, 5000);

      // Clean up function that gets called when the stream is closed
      return () => {
        console.log("Stream closing, performing cleanup");
        closeConnection();
      };
    },

    // Handle cancellation (e.g., when client disconnects)
    cancel() {
      console.log("Stream cancelled by client or internal process");
      closeConnection();
    },
  });

  // Return the response with the stream
  return new NextResponse(stream, { headers });
}
