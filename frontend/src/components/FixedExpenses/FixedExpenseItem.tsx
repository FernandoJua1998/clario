import type { FixedExpense } from "../../hooks/useFixedExpenses";

const CATEGORY_LABELS: Record<string, string> = {
  alimentacion: "Alimentación",
  transporte: "Transporte",
  entretenimiento: "Entretenimiento",
  salud: "Salud",
  servicios: "Servicios",
  ropa: "Ropa",
  educacion: "Educación",
  viajes: "Viajes",
  otro: "Otro",
};

const CATEGORY_ICONS: Record<string, string> = {
  alimentacion: "🛒",
  transporte: "🚗",
  entretenimiento: "🎬",
  salud: "💊",
  servicios: "🔌",
  ropa: "👕",
  educacion: "📚",
  viajes: "✈️",
  otro: "📌",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

interface Props {
  fe: FixedExpense;
  today: number; // día actual del mes
  onEdit: () => void;
  onDelete: () => void;
}

export default function FixedExpenseItem({ fe, today, onEdit, onDelete }: Props) {
  const isPast = fe.due_day <= today;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
        isPast ? "border-gray-100 opacity-60" : "border-gray-100"
      }`}
    >
      <div className="p-4 flex items-center gap-3">
        {/* Icono categoría */}
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
          {CATEGORY_ICONS[fe.category] ?? "📌"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{fe.name}</p>
            {isPast ? (
              <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                Pagado
              </span>
            ) : (
              <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
                Día {fe.due_day}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {CATEGORY_LABELS[fe.category] ?? fe.category}
          </p>
        </div>

        {/* Monto */}
        <p className="font-semibold text-gray-900 shrink-0">{fmt(fe.amount)}</p>

        {/* Acciones */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
