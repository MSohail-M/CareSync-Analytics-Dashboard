import { createClient } from '@supabase/supabase-js'

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function signIn(email: string, password: string) {
  const { data, error } = await client().auth.signInWithPassword({ email, password })
  if (error || !data.session) return error?.message ?? 'Login failed'

  // Store token in a plain cookie the server can read
  const maxAge = data.session.expires_in ?? 3600
  document.cookie = `sb-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
  return null // null = success
}

export async function signOut() {
  await client().auth.signOut()
  document.cookie = 'sb-token=; path=/; max-age=0'
  window.location.href = '/login'
}
