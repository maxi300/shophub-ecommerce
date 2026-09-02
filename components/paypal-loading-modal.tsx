// components/paypal-loading-modal.tsx
'use client';

interface PayPalLoadingModalProps {
  isOpen: boolean;
}

export function PayPalLoadingModal({ isOpen }: PayPalLoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center flex flex-col items-center">
        {/* Contenedor de Logos */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-md">
            <span className="text-white text-2xl font-black">F</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#003087] flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xs tracking-wider">PayPal</span>
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-2">Conectando a tu PayPal</h3>
        <p className="text-xs font-medium text-slate-500">Conectando de forma segura a tu PayPal, sé paciente.</p>
      </div>
    </div>
  );
}