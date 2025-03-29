import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the movies page
  redirect('/movies');
}
