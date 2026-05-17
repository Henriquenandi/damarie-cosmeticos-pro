import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';

export default function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#FAF3E8' }}>
      <Navbar />
      {children}
      <WhatsAppButton />
    </div>
  );
}
