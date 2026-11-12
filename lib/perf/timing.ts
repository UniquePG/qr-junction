/** Lightweight request timing helper for Server-Timing headers / logs. */

export type TimingMark = { name: string; ms: number };

export function createTimer() {
  const started = Date.now();
  const marks: TimingMark[] = [];
  let last = started;

  return {
    mark(name: string) {
      const now = Date.now();
      marks.push({ name, ms: now - last });
      last = now;
    },
    header() {
      const total = Date.now() - started;
      const parts = marks.map((mark) => `${mark.name};dur=${mark.ms}`);
      parts.push(`total;dur=${total}`);
      return parts.join(", ");
    },
    log(label: string) {
      if (process.env.NODE_ENV === "production" && !process.env.PERF_LOG) return;
      const total = Date.now() - started;
      console.info(
        `[perf] ${label} total=${total}ms ${marks.map((m) => `${m.name}=${m.ms}`).join(" ")}`,
      );
    },
    apply(response: Response) {
      try {
        response.headers.set("Server-Timing", this.header());
      } catch {
        // immutable headers
      }
      return response;
    },
  };
}
