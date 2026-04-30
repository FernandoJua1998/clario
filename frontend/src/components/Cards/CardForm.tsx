import { useState, type FormEvent } from "react";
import type { Card, CardCreate } from "../../hooks/useCards";

const PRESET_COLORS = [
  "#0ea5e9", "#6366f1", "#ec4899", "#f59e0b",
  "#10b981", "#ef4444", "#8b5cf6", "#64748b",
];

interface Props {
  initial?: Card;
  onSubmit: (data: CardCreate) => Promise<void>;
  onCancel: () => void;
}

export default function CardForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"credit" | "debit">(initial?.type ?? "credit");
  const [creditLimit, setCreditLimit] = useState(initial?.credit_limit?.toString() ?? "");
  const [closingDay, setClosingDay] = useState(initial?.closing_day?.toString() ?? "");
  const [dueDay, setDueDay] = useState(initial?.due_day?.toString() ?? "");
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [currentBalance, setCurrentBalance] = useState(
    initial?.current_balance && initial.current_balance > 0
      ? initial.current_balance.toString()
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name,
        type,
        credit_limit: type === "credit" && creditLimit ? parseFloat(creditLimit) : null,
        closing_day: closingDay ? parseInt(closingDay) : null,
        due_day: dueDay ? parseInt(dueDay) : null,
        color,
        current_balance: currentBalance ? parseFloat(currentBalance) : 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre de la tarjeta</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='ej. "BBVA Azul"'
          className={inputClass}
        />
      </div>

      {/* Tipo */}
      <div>
        <label className={labelClass}>Tipo</label>
        <div className="grid grid-cols-2 gap-2">
          {(["credit", "debit"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                type === t
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-gray-200 text-gray-600 bg-white"
              }`}
            >
              {t === "credit" ? "Crédito" : "Débito"}
            </button>
          ))}
        </div>
      </div>

      {/* Límite de crédito — solo para crédito */}
      {type === "credit" && (
        <div>
          <label className={labelClass}>Límite de crédito (MXN)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            placeholder="ej. 20000"
            className={inputClass}
          />
        </div>
      )}

      {/* Días de corte y pago */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Día de corte</label>
          <input
            type="number"
            min="1"
            max="31"
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            placeholder="ej. 15"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Día límite de pago</label>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="ej. 10"
            className={inputClass}
          />
        </div>
      </div>

      {/* Saldo actual — solo crédito */}
      {type === "credit" && (
        <div>
          <label className={labelClass}>
            Saldo usado actualmente{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="ej. 3500.00"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">
            Permite calcular el pago sugerido desde el día 1
          </p>
        </div>
      )}

      {/* Color */}
      <div>
        <label className={labelClass}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                color === c ? "border-gray-800 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {loading ? "Guardando..." : initial ? "Guardar cambios" : "Agregar tarjeta"}
        </button>
      </div>
    </form>
  );
}
