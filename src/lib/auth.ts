import { supabase } from './supabase'

export const signUp = async (email: string, password: string, userData: any) => {
  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) throw error

  return user
}

export const signIn = async (email: string, password: string) => {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getUserProfile = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userData: any) => {
  const user = await getCurrentUser()
  if (!user) return null

  const { error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', user.id)

  if (error) throw error
}
