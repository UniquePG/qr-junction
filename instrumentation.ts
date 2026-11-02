export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { attachLiveSocket } = await import("@/lib/live/socket-server");
  attachLiveSocket();
}
