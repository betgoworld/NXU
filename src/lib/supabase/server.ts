import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => Boolean(url() && anon());

/** Cliente com a sessão do usuário (cookies) — usado no painel admin. RLS se aplica. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(url()!, anon()!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* chamado de Server Component: o proxy renova a sessão */
        }
      },
    },
  });
}

/** Cliente anônimo sem sessão — usado pela API pública de cadastro (apenas RPCs). */
export function createAnonClient() {
  return createClient(url()!, anon()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
