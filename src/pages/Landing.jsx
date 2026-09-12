import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Store from '../components/Store';
import UsadosDisponibles from '../components/UsadosDisponibles';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import PaymentMethods from '../components/PaymentMethods';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

// La landing pública. "Usados disponibles" va justo debajo de la Tienda: esa
// sección se alimenta del inventario real, mientras que las tres categorías de
// Store siguen siendo contenido fijo de content.js.
export default function Landing() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Services />
        <Store />
        <UsadosDisponibles />
        <HowItWorks />
        <Testimonials />
        <PaymentMethods />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  );
}
