import { NextResponse } from "next/server";
import { getSessionDbUser } from "@/lib/authHelper";
import { publicUser } from "@/lib/otp";
import { publicRestaurantAccess, resolveRestaurantContext } from "@/lib/restaurant/access";

export async function GET(request: Request) {
  try {
    const user = await getSessionDbUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ctx = await resolveRestaurantContext(user.id);
    return NextResponse.json({
      user: publicUser(user),
      restaurantAccess: ctx ? publicRestaurantAccess(ctx) : null,
    });
  } catch (error) {
    console.error("auth/me failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
