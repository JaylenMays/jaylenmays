import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { AuthError401 } from "@/lib/auth";

/** Wraps a route handler with uniform auth/validation/error handling. */
export function apiHandler<T>(
  fn: (req: Request, params: T) => Promise<Response>,
): (req: Request, ctx: { params: Promise<T> }) => Promise<Response> {
  return async (req, ctx) => {
    try {
      const params = ctx?.params ? await ctx.params : (undefined as T);
      return await fn(req, params);
    } catch (err) {
      if (err instanceof AuthError401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: err.issues[0]?.message ?? "Invalid input" },
          { status: 400 },
        );
      }
      console.error("API error:", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export async function parseBody<S extends ZodSchema>(req: Request, schema: S) {
  const body = await req.json().catch(() => null);
  return schema.parse(body) as S["_output"];
}
