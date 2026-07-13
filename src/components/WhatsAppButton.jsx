import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../data/content';

/**
 * CTA de WhatsApp reutilizable. `variant="floating"` la ancla como botón
 * flotante persistente; por defecto se renderiza inline (ej. navbar).
 */
export default function WhatsAppButton({
  message = 'Hola, quiero más información de Reboot PC Store.',
  variant = 'inline',
  className = '',
  children = 'Contáctanos por WhatsApp',
}) {
  const href = buildWhatsAppLink(message);

  if (variant === 'floating') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-xl shadow-emerald-900/30 transition hover:scale-105 md:bottom-8 md:right-8"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn-whatsapp ${className}`}>
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {children}
    </a>
  );
}
