import { createClient, type User } from "@supabase/supabase-js";

// Sadece server-side (API routes) kullanılır — service role key client-side'a sızmaz
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function verifyAdmin(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) return null;
  return user;
}


// listUsers tek çağrıda en fazla perPage kadar kullanıcı döndürür; hepsini sayfa sayfa toplar.
export async function listAllUsers() {
  const users: User[] = [];
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) return { users: null, error };
    users.push(...data.users);
    if (data.users.length < perPage) break;
  }
  return { users, error: null };
}
