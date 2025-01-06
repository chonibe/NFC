import dynamic from 'next/dynamic';

// Dynamically import the VerisartDashboard with no server-side rendering
const VerisartDashboard = dynamic(() => import('../components/VerisartDashboard'), {
  ssr: false
});

export default function Home() {
  return <VerisartDashboard />;
}
