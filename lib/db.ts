import { supabase } from "./supabase"

export async function getCategories() {
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  return data ?? []
}

export async function getStandardServices(categorySlug?: string) {
  let query = supabase
    .from("standard_services")
    .select("*, service_categories(name, slug)")
    .eq("is_active", true)

  if (categorySlug) {
    query = query.eq("service_categories.slug", categorySlug)
  }

  const { data } = await query.order("name")
  return data ?? []
}

export async function getServiceRequests() {
  const { data } = await supabase
    .from("service_requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getServiceRequest(id: string) {
  const { data } = await supabase
    .from("service_requests")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

export async function getProposals(requestId: string) {
  const { data } = await supabase
    .from("proposals")
    .select("*, supplier_profiles(company_name, rating_avg, total_reviews, is_premium)")
    .eq("request_id", requestId)
    .order("price_total", { ascending: true })
  return data ?? []
}

export async function getSuppliers() {
  const { data } = await supabase
    .from("supplier_profiles")
    .select("*, profiles(city, state)")
    .eq("is_active", true)
    .order("rating_avg", { ascending: false })
  return data ?? []
}

export async function createServiceRequest(payload: {
  service_type: string
  category: string
  material: string
  width_m: number
  height_m: number
  quantity: number
  city: string
  state: string
  deadline_days: number
  description: string
  buyer_name?: string
}) {
  const { data, error } = await supabase
    .from("service_requests")
    .insert(payload)
    .select()
    .single()
  return { data, error }
}

export async function calculateEstimates(
  serviceType: string,
  widthM: number,
  heightM: number,
  quantity: number
) {
  const { data: services } = await supabase
    .from("standard_services")
    .select("*, service_categories(name)")
    .eq("is_active", true)
    .ilike("name", `%${serviceType.split(" ")[0]}%`)

  if (!services) return []

  return services.map((s) => {
    let price = 0
    if (s.formula_type === "area") price = widthM * heightM * quantity * s.base_price
    if (s.formula_type === "area_min1m2") price = Math.max(widthM * heightM, 1) * quantity * s.base_price
    if (s.formula_type === "unit") price = quantity * s.base_price
    return { ...s, estimated_price: Math.round(price * 100) / 100 }
  })
}

// Admin
export async function adminGetAllRequests() {
  const { data } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function adminToggleService(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("standard_services")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
  return !error
}

export async function adminToggleProduct(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("shelf_products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
  return !error
}

export async function adminGetStandardServices() {
  const { data } = await supabase
    .from("standard_services")
    .select("*, service_categories(name, slug)")
    .order("name")
  return data ?? []
}

export async function adminGetShelfProducts() {
  const { data } = await supabase
    .from("shelf_products")
    .select("*, service_categories(name, slug)")
    .order("name")
  return data ?? []
}

export async function adminGetStats() {
  const [requests, proposals, suppliers, users] = await Promise.all([
    supabase.from("service_requests").select("id", { count: "exact", head: true }),
    supabase.from("proposals").select("id", { count: "exact", head: true }),
    supabase.from("supplier_profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ])

  const today = new Date().toISOString().split("T")[0]
  const { count: requestsToday } = await supabase
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today)

  return {
    totalRequests: requests.count ?? 0,
    totalProposals: proposals.count ?? 0,
    totalSuppliers: suppliers.count ?? 0,
    totalUsers: users.count ?? 0,
    requestsToday: requestsToday ?? 0,
  }
}
