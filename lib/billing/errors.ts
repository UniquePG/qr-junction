import { NextResponse } from "next/server";

export type AccessMode = "full" | "read_only";

export class PlanLimitError extends Error {
  status = 402 as const;
  feature: string;
  used: number | null;
  limit: number | null;
  access: AccessMode;

  constructor(input: {
    feature: string;
    message: string;
    used?: number | null;
    limit?: number | null;
    access?: AccessMode;
  }) {
    super(input.message);
    this.name = "PlanLimitError";
    this.feature = input.feature;
    this.used = input.used ?? null;
    this.limit = input.limit ?? null;
    this.access = input.access ?? "full";
  }
}

export function planErrorResponse(error: unknown) {
  if (!(error instanceof PlanLimitError)) return null;
  return NextResponse.json(
    {
      error: "plan_limit",
      message: error.message,
      feature: error.feature,
      used: error.used,
      limit: error.limit,
      access: error.access,
    },
    { status: 402 },
  );
}
