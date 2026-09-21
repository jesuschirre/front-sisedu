import type { FormEventHandler } from "react";

interface ContenedorProps {
  children: React.ReactNode;
  onClosea: () => void;
  textHeader: string;
  isLoadinga: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitText?: string;
}

export default function Modal({ children, onClosea, textHeader, isLoadinga, onSubmit, submitText = "Guardar Usuario" }: ContenedorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl overflow-hidden border-4 border-black bg-[#15151c] shadow-[10px_10px_0_0_#D4FF00] animate-in fade-in zoom-in-95 duration-200">
        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b-4 border-black bg-[#D4FF00] p-5">
          <h2 className="font-mono text-xl font-black uppercase tracking-wide text-black">{textHeader}</h2>
          <button 
            onClick={onClosea}
            type="button"
            aria-label="Cerrar modal"
            className="border-2 border-black bg-white p-1 text-black shadow-[3px_3px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          {/* Botones de Acción */}
          <div className="mt-4 flex justify-end gap-3 border-t-4 border-black p-6 pt-5">
            <button 
              type="button" 
              onClick={onClosea}
              className="border-2 border-black bg-white px-5 py-2.5 font-mono text-sm font-black text-black shadow-[4px_4px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#111111]"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoadinga}
              className="flex items-center gap-2 border-2 border-black bg-[#D4FF00] px-6 py-2.5 font-mono text-sm font-black text-black shadow-[4px_4px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#111111] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isLoadinga ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
