'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const email=String(formData.get('email')); const password=String(formData.get('password'));
  const s=createClient(); const {error}=await s.auth.signInWithPassword({email,password});
  if(error) redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/','layout'); redirect('/');
}

export async function signUp(formData: FormData) {
  const email=String(formData.get('email')); const password=String(formData.get('password'));
  const name=String(formData.get('name')||'');
  const s=createClient(); const {error}=await s.auth.signUp({email,password,options:{data:{name}}});
  if(error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  redirect('/sign-in?confirm=1');
}

export async function signOut() {
  const s=createClient(); await s.auth.signOut();
  revalidatePath('/','layout'); redirect('/');
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email'));
  const s = createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await s.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
  // Always redirect to the same confirmation state, whether or not the email
  // exists — never reveal which emails have accounts.
  if (error) redirect('/forgot-password?sent=1');
  redirect('/forgot-password?sent=1');
}
