import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";

export const dynamic = "force-dynamic";

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "QRJunction/1.0",
};

type PostOffice = {
  Name?: string;
  BranchType?: string;
  Block?: string;
  District?: string;
  State?: string;
  Country?: string;
};

function clean(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function pickCity(offices: PostOffice[]) {
  const head = offices.find((office) => /head post office/i.test(office.BranchType || "") && clean(office.Name));
  if (head) return clean(head.Name);
  const block = offices.map((office) => clean(office.Block)).find((value) => value && value.toUpperCase() !== "NA");
  if (block) return block;
  return clean(offices[0]?.District);
}

async function readJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { ...HEADERS, ...(init?.headers || {}) },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Lookup failed (${response.status})`);
  return response.json();
}

async function lookupPin(pin: string) {
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Enter a 6-digit PIN code." }, { status: 400 });
  }
  const payload = await readJson(`https://api.postalpincode.in/pincode/${pin}`);
  const row = Array.isArray(payload) ? payload[0] : null;
  const offices = Array.isArray(row?.PostOffice) ? (row.PostOffice as PostOffice[]) : [];
  if (row?.Status !== "Success" || offices.length === 0) {
    return NextResponse.json({ error: "No post office found for this PIN code." }, { status: 404 });
  }

  const city = pickCity(offices);
  const district = clean(offices[0]?.District);
  const state = clean(offices[0]?.State);
  const localities = [...new Set(offices.map((office) => clean(office.Name)).filter(Boolean))]
    .filter((name) => name.toLowerCase() !== city.toLowerCase())
    .sort((a, b) => a.localeCompare(b));

  return NextResponse.json({
    success: true,
    city,
    district,
    state,
    country: clean(offices[0]?.Country) || "India",
    localities,
  });
}

async function lookupStates(country: string) {
  if (!country || country.length > 80) {
    return NextResponse.json({ error: "Choose a country." }, { status: 400 });
  }
  const payload = await readJson("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country }),
  });
  const rows = Array.isArray(payload?.data?.states) ? payload.data.states : [];
  const states = rows
    .map((row: { name?: string }) => clean(row?.name))
    .filter(Boolean)
    .sort((a: string, b: string) => a.localeCompare(b));
  return NextResponse.json({ success: true, states });
}

async function lookupCities(country: string, state: string) {
  if (!country || !state) {
    return NextResponse.json({ success: true, cities: [] });
  }
  const payload = await readJson("https://countriesnow.space/api/v0.1/countries/state/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country, state }),
  });
  const cities = (Array.isArray(payload?.data) ? payload.data : [])
    .map((city: unknown) => clean(typeof city === "string" ? city : ""))
    .filter(Boolean)
    .sort((a: string, b: string) => a.localeCompare(b));
  return NextResponse.json({ success: true, cities });
}

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  try {
    if (kind === "pincode") return await lookupPin(searchParams.get("pin") || "");
    if (kind === "states") return await lookupStates(searchParams.get("country") || "");
    if (kind === "cities") {
      return await lookupCities(searchParams.get("country") || "", searchParams.get("state") || "");
    }
    return NextResponse.json({ error: "Unknown lookup." }, { status: 400 });
  } catch (error) {
    console.error("Address lookup failed:", error);
    return NextResponse.json({ error: "Place lookup is unavailable right now. Type the address instead." }, { status: 502 });
  }
}
