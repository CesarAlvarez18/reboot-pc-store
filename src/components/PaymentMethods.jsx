import { CreditCard, Banknote, Landmark, Smartphone } from 'lucide-react';
import { paymentMethods } from '../data/content';

const iconFor = (method) => {
  if (method === 'Efectivo') return Banknote;
  if (method === 'Transferencia Bancaria') return Landmark;
  if (method === 'Nequi' || method === 'Daviplata') return Smartphone;
  return CreditCard;
};

export default function PaymentMethods() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold text-slate-500">
          Medios de pago aceptados
        </h2>
        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {paymentMethods.map((method) => {
            const Icon = iconFor(method);
            return (
              <li key={method} className="flex flex-col items-center gap-2 text-slate-600">
                <Icon className="h-7 w-7" aria-hidden="true" />
                <span className="text-xs font-medium">{method}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
