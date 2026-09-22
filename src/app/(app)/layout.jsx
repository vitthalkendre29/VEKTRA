import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dbConnect } from '@/lib/db';
import { User, VektraProfile } from '@/models';
import { UIProvider } from '@/components/UIProvider';
import Shell from '@/components/Shell';

export default async function AppLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  const [user, profile] = await Promise.all([
    User.findById(session.userId).select('name email').lean(),
    VektraProfile.findOne({ userId: session.userId }).lean(),
  ]);

  return (
    <UIProvider>
      <Shell user={{ name: user?.name, email: user?.email }} initialTheme={profile?.theme || 'light'}>
        {children}
      </Shell>
    </UIProvider>
  );
}
