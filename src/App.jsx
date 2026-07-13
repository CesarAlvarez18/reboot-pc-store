import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Store from './components/Store';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import PaymentMethods from './components/PaymentMethods';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Services />
        <Store />
        <HowItWorks />
        <Testimonials />
        <PaymentMethods />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  );
}
