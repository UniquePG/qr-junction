import { subscribeOrder, type OrderBusEvent } from "@/lib/orders/bus";

const encoder = new TextEncoder();

export function orderEventStream(channel: string, signal: AbortSignal) {
  let unsubscribe = () => {};
  let ping: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          unsubscribe();
        }
      };

      send(`retry: 3000\n\n`);
      unsubscribe = subscribeOrder(channel, (event: OrderBusEvent) => {
        send(`id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      });
      ping = setInterval(() => send(`: ping\n\n`), 15000);

      const close = () => {
        if (ping) clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      if (signal.aborted) close();
      else signal.addEventListener("abort", close, { once: true });
    },
    cancel() {
      if (ping) clearInterval(ping);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
