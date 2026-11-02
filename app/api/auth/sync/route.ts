import { POST as googlePost } from "@/app/api/auth/google/route";

/** @deprecated Use POST /api/auth/google. Kept as alias during cutover. */
export async function POST(request: Request) {
  return googlePost(request);
}
