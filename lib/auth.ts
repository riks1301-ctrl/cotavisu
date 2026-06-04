import { createClient } from "./supabase-client"

export async function signUp(email: string, password: string, name: string, role: "buyer" | "supplier") {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  if (error) return { error }

  // Cria perfil na tabela profiles
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
      role,
    })
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
