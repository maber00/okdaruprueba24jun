// src/app/page.tsx
import { redirect } from 'next/navigation';


export default function Home() {
  redirect('/orders');  // O la ruta que prefieras como default
}