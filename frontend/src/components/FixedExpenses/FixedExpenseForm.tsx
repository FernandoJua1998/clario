import { useState, type FormEvent } from "react";
import type { FixedExpense, FixedExpenseCreate } from "../../hooks/useFixedExpenses";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "alimentacion", label: "Alimentación" },
  { value: "transporte", label: "Transporte" },
  { value: "entretenimiento", label: "Entretenimiento" },
  { value: "salud", label: "Salud" },
  { value: "servicios", label: "Servicios" },
  { value: "ropa", label: "Ropa" },
  { value: "educacion", label: "Educación" },
  { value: "viajes", label: "Viajes" },
  { value: "otro", label: "Otro" },
];

interface Props {
  initial?: FixedExpense;
  onSubmit: (data: FixedExpenseCreate) => Promise<void>;
  onCancel: () => void;
}

export default function FixedExpenseForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? "servicios");
  const [dueDay, setDueDay] = useState(initial?.due_day?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        name,
        amount: parseFloat(amount),
        category,
        due_day: parseInt(dueDay),
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
        <label className={labelClass}>Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='ej. "Netflix", "Renta", "Internet"'
          className={inputClass}
        />
      </div>

      {/* Monto */}
      <div>
        <label className={labelClass}>Monto mensual (MXN)</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ej. 299.00"
          className={inputClass}
        />
      </div>

      {/* Categoría */}
      <div>
        <label className={labelClass}>Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Día de vencimiento */}
      <div>
        <label className={labelClass}>Día de vencimiento del mes</label>
        <input
          type="number"
          required
          min="1"
          max="31"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          placeholder="ej. 5"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400">
          Día del mes en que se cobra o vence este gasto
        </p>
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
          {loading ? "Guardando..." : initial ? "Guardar cambios" : "Agregar"}
        </button>
      </div>
    </form>
  );
}
