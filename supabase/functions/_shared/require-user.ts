// Returns the signed-in user's id from the request's bearer token, or null.
// Used to keep paid AI calls behind sign-in.
import { createClient } from "npm:@supabase/supabase-js@2";

export async function getSignedInUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data, error } = await client.auth.getClaims(token);
    if (error || !data?.claims?.sub || data.claims.role !== "authenticated") return null;
    return data.claims.sub as string;
  } catch {
    return null;
  }
}
