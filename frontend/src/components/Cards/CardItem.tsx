import type { Card } from "../../hooks/useCards";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

interface Props {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CardItem({ card, onEdit, onDelete }: Props) {
  const usagePercent =
    card.type === "credit" && card.credit_limit && card.credit_limit > 0
      ? Math.min((card.current_balance / card.credit_limit) * 100, 100)
      : null;

  const usageColor =
    usagePercent === null
      ? ""
      : usagePercent >= 90
      ? "bg-red-500"
      : usagePercent >= 70
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header con color de tarjeta */}
      <div className="h-2" style={{ backgroundColor: card.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{card.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {card.type === "credit" ? "Crédito" : "Débito"}
              {card.closing_day && ` · Corte día ${card.closing_day}`}
              {card.due_day && ` · Pago día ${card.due_day}`}
            </p>
          </div>

          <div className="flex gap-1">
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

        {/* Barra de uso — solo crédito */}
        {card.type === "credit" && card.credit_limit && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Saldo usado: {fmt(card.current_balance)}</span>
              <span>Límite: {fmt(card.credit_limit)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usageColor}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent !== null && (
              <p className="text-xs text-gray-400 mt-1">{usagePercent.toFixed(0)}% utilizado</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
