import { createClient } from "./supabase-client"

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: "buyer" | "supplier",
  extras?: { whatsapp?: string; city?: string; state?: string }
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  if (error) return { error }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
      role,
      phone: extras?.whatsapp ?? null,
      city: extras?.city ?? null,
      state: extras?.state?.toUpperCase() ?? null,
    })

    if (role === "supplier") {
      await supabase.from("supplier_profiles").upsert({
        user_id: data.user.id,
        company_name: name,
        whatsapp: extras?.whatsapp ?? null,
        is_active: true,
      })
    }
  }

  return { data }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  return data
}
