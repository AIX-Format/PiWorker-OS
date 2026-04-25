import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * SSE PROXY
 * Proxies the real-time event stream from the Go Sovereign Engine (Sidecar)
 * to the browser client.
 */
export async function GET() {
  const sidecarUrl = process.env.SOVEREIGN_ENGINE_URL?.replace(':50051', ':8080') || 'http://localhost:8080';
  const eventStreamUrl = `${sidecarUrl}/events`;

  try {
    const response = await fetch(eventStreamUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'X-Sovereign-Token': process.env.SOVEREIGN_AUTH_TOKEN || 'SOVEREIGN_DEV_TOKEN',
      },
      // Keep connection alive
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Sidecar responded with ${response.status}`);
    }

    // Return the stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("❌ [API] Event Stream Proxy Error:", error.message);
    
    // Return a single error event if the sidecar is down
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const data = JSON.stringify({ 
          status: "OFFLINE", 
          error: "Sovereign Engine unreachable",
          timestamp: new Date().toISOString() 
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
