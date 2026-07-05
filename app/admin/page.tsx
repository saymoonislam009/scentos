// Redirect to the URL-based admin gate — direct /admin with no secret just goes home.
import { redirect } from 'next/navigation';
export default function AdminRoot() { redirect('/'); }
