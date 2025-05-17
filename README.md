# Next.js Server-Sent Events (SSE) Example

This is a demo of using Server-Sent Events (SSE) with Next.js to create a real-time connection between the server and client. The implementation polls a mock API endpoint every 5 seconds and sends updates to connected clients.

## Features

- Server-Sent Events (SSE) implementation using Next.js Route Handlers
- Real-time data streaming with automatic reconnection
- Custom React component to display real-time updates
- Mock API polling every 5 seconds

## How It Works

### Server-Side

The SSE endpoint is implemented in `src/app/api/sse/route.ts` using Next.js Route Handlers. Key aspects:

- Uses ReadableStream API for creating a streaming response
- Sets proper headers for SSE communication
- Polls a mock API function every 5 seconds
- Formats data for SSE protocol (prefixing each message with `data:` and ending with `\n\n`)

```typescript
export async function GET() {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };

  const stream = new ReadableStream({
    async start(controller) {
      // Poll the API every 5 seconds and send data to the client
      // ...
    },
  });

  return new NextResponse(stream, { headers });
}
```

### Client-Side

The client-side component in `src/components/SseExample.tsx`:

- Uses the native EventSource API to connect to the SSE endpoint
- Handles connection state and errors
- Automatically attempts to reconnect on connection loss
- Displays real-time updates as they arrive

## Usage

To use the SSE functionality in your own project:

1. Copy the `src/app/api/sse/route.ts` file to set up your SSE endpoint
2. Replace the mock `fetchDataFromApi()` function with your actual data source
3. Use the `SseExample` component as a reference for connecting to your SSE endpoint

## Important Notes

- SSE components must be client-side only, as the EventSource API is browser-specific
- For production use, consider adding authentication to your SSE endpoint
- In serverless environments, long-lived connections might be terminated based on the platform's timeout settings
- For true real-time needs beyond polling, consider technologies like WebSockets or Socket.io

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Server-Sent Events MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [ReadableStream API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
