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
