'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type ActionState = { error?: string; success?: string } | null

export async function createClinicAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sb = adminClient()

  const name         = (formData.get('name') as string).trim()
  const slug         = (formData.get('slug') as string).trim().toLowerCase().replace(/\s+/g, '-')
  const phone        = (formData.get('phone') as string).trim()
  const plan         = formData.get('plan') as string
  const agentId      = (formData.get('agent_id') as string).trim()
  const contactName  = (formData.get('contact_name') as string).trim()
  const contactEmail = (formData.get('contact_email') as string).trim()
  const role         = formData.get('role') as string

  if (!name || !slug || !contactEmail) return { error: 'Name, slug, and contact email are required.' }

  // 1. Create clinic
  const { data: clinic, error: clinicErr } = await sb
    .from('clinics')
    .insert({ name, slug, phone_number: phone || null, plan_tier: plan, retell_agent_id: agentId || null, status: 'active' })
    .select().single()

  if (clinicErr) return { error: `Clinic creation failed: ${clinicErr.message}` }

  // 2. Register agent in clinic_agents if provided
  if (agentId) {
    await sb.from('clinic_agents').insert({
      clinic_id: clinic.id,
      retell_agent_id: agentId,
      name: `${name} - Primary`,
      is_active: true,
    })
  }

  // 3. Invite the user — Supabase creates auth user and sends invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dashboard.aiwonderz.com'
  const { data: invite, error: inviteErr } = await sb.auth.admin.inviteUserByEmail(contactEmail, {
    redirectTo: `${appUrl}/login`,
    data: { name: contactName },
  })

  if (inviteErr) {
    // Rollback clinic if invite fails
    await sb.from('clinics').delete().eq('id', clinic.id)
    return { error: `Invite failed: ${inviteErr.message}` }
  }

  // 4. Create user row linking auth user → clinic
  const { error: userErr } = await sb.from('users').insert({
    id: invite.user.id,
    clinic_id: clinic.id,
    role: role || 'owner',
    name: contactName || null,
  })

  if (userErr) return { error: `User record failed: ${userErr.message}` }

  revalidatePath('/admin')
  return { success: `✓ ${name} created. Invite sent to ${contactEmail}.` }
}

export async function inviteUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sb = adminClient()

  const clinicId     = formData.get('clinic_id') as string
  const contactName  = (formData.get('contact_name') as string).trim()
  const contactEmail = (formData.get('contact_email') as string).trim()
  const role         = formData.get('role') as string

  if (!clinicId || !contactEmail) return { error: 'Clinic and email are required.' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dashboard.aiwonderz.com'
  const { data: invite, error: inviteErr } = await sb.auth.admin.inviteUserByEmail(contactEmail, {
    redirectTo: `${appUrl}/login`,
    data: { name: contactName },
  })

  if (inviteErr) return { error: inviteErr.message }

  await sb.from('users').insert({
    id: invite.user.id,
    clinic_id: clinicId,
    role: role || 'staff',
    name: contactName || null,
  })

  revalidatePath('/admin')
  return { success: `✓ Invite sent to ${contactEmail}.` }
}
