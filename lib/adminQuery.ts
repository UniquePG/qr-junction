import { Prisma } from "@prisma/client";

export function parseAdminRange(searchParams: URLSearchParams): {
  isAllTime: boolean;
  startDate?: Date;
  endDate?: Date;
} {
  const isAllTime = searchParams.get("range") === "all";
  if (isAllTime) return { isAllTime: true };

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  if (startDateParam) startDate = new Date(startDateParam);
  if (endDateParam) endDate = new Date(endDateParam);

  if (!startDate && !endDate) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
  }

  return { isAllTime: false, startDate, endDate };
}

export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 20) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function dateFilter(columnSql: Prisma.Sql, startDate?: Date, endDate?: Date): Prisma.Sql {
  if (startDate && endDate) {
    return Prisma.sql`AND ${columnSql} >= ${startDate} AND ${columnSql} <= ${endDate}`;
  }
  if (startDate) return Prisma.sql`AND ${columnSql} >= ${startDate}`;
  if (endDate) return Prisma.sql`AND ${columnSql} <= ${endDate}`;
  return Prisma.empty;
}

export function redactDestination(destination: unknown): unknown {
  if (!destination || typeof destination !== "object" || Array.isArray(destination)) {
    return destination;
  }
  const copy = { ...(destination as Record<string, unknown>) };
  if (typeof copy.password === "string" && copy.password) {
    copy.password = "••••••";
  }
  return copy;
}

export function paginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
