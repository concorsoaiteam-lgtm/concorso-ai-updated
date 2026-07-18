"use client";

export default function SimulationPage() {
  return (
    <main className="min-h-screen bg-[#F0F5FA] flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-[32px] shadow-xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B3156] flex items-center justify-center text-white text-sm font-bold shrink-0">
              CA
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-[#0B3156]">Commissario AI</p>
              <p className="text-[11px] font-semibold text-gray-500">
                Sessione 03 - Diritto Amministrativo
              </p>
              <p className="text-[11px] font-semibold text-emerald-600">
                ● Simulazione in corso - 12:34
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full border-2 border-emerald-400 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M17 11a5 5 0 0 1-10 0" />
              <path d="M12 17v3" />
              <path d="M8 20h8" />
            </svg>
          </div>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-full py-1.5 px-2 text-center text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200">
            Domanda 4/12
          </div>
          <div className="rounded-full py-1.5 px-2 text-center text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200">
            <svg className="inline-block w-3 h-3 -mt-0.5 mr-1 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timer 12:34
          </div>
          <div className="rounded-full py-1.5 px-2 text-center text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200">
            <svg className="inline-block w-3 h-3 -mt-0.5 mr-1 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M17 11a5 5 0 0 1-10 0" />
            </svg>
            Voce attiva
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col gap-4 my-6">
          {/* Commissioner Bubble */}
          <div className="bg-[#F0F5FA] rounded-[18px] rounded-bl-[4px] p-4 max-w-[85%]">
            <p className="text-sm font-semibold text-[#0B3156] mb-1">Commissario</p>
            <p className="text-sm leading-relaxed text-gray-800">
              Buongiorno candidato. Inizi con l&apos;illustrare i principi fondamentali
              del diritto amministrativo, con particolare riferimento al principio
              di legalit&agrave; e al principio di trasparenza. Pu&ograve; anche fare
              riferimento alla legge 241 del 1990.
            </p>
          </div>

          {/* User Voice Response Bubble */}
          <div className="self-end max-w-[85%]">
            <div className="bg-[#0B3156] rounded-[18px] rounded-br-[4px] p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
                  <path d="M17 11a5 5 0 0 1-10 0" />
                  <path d="M12 17v3" />
                </svg>
                <p className="text-xs font-semibold text-white/80">Risposta vocale</p>
              </div>
              <div className="flex items-end gap-[3px] h-6">
                <div className="w-[3px] bg-white/80 rounded-full h-3" />
                <div className="w-[3px] bg-white/80 rounded-full h-5" />
                <div className="w-[3px] bg-white/80 rounded-full h-2" />
                <div className="w-[3px] bg-white/80 rounded-full h-6" />
                <div className="w-[3px] bg-white/80 rounded-full h-4" />
                <div className="w-[3px] bg-white/80 rounded-full h-2" />
                <div className="w-[3px] bg-white/80 rounded-full h-5" />
                <div className="w-[3px] bg-white/80 rounded-full h-3" />
                <div className="w-[3px] bg-white/80 rounded-full h-4" />
                <div className="w-[3px] bg-white/80 rounded-full h-6" />
                <div className="w-[3px] bg-white/80 rounded-full h-2" />
                <div className="w-[3px] bg-white/80 rounded-full h-5" />
                <div className="w-[3px] bg-white/80 rounded-full h-3" />
                <div className="w-[3px] bg-white/80 rounded-full h-4" />
                <div className="w-[3px] bg-white/80 rounded-full h-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Live Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-800">Feedback live</h3>

          {/* Metric: Chiarezza */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Chiarezza</span>
              <span className="text-xs font-bold text-emerald-600">8/10</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[80%] bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Esposizione lineare e ben strutturata. Ottimo uso dei connettivi logici.
            </p>
          </div>

          {/* Metric: Struttura */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Struttura</span>
              <span className="text-xs font-bold text-amber-600">6/10</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-amber-500 rounded-full" />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Organizzazione discreta. Prova a seguire lo schema: tesi, argomenti, conclusione.
            </p>
          </div>

          {/* Metric: Contenuto */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Contenuto</span>
              <span className="text-xs font-bold text-emerald-600">9/10</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[90%] bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Riferimenti normativi precisi e pertinenti al caso. Buona completezza.
            </p>
          </div>

          {/* Disagree Button */}
          <button
            type="button"
            className="w-full rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-bold py-2.5 px-4 transition hover:bg-gray-50 hover:border-gray-300 text-center"
          >
            Non sono d&apos;accordo - correggi
          </button>
        </div>
      </div>
    </main>
  );
}
