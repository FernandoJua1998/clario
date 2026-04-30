import { useState } from "react";
import {
  useFixedExpenses,
  type FixedExpense,
  type FixedExpenseCreate,
} from "../hooks/useFixedExpenses";
import FixedExpenseItem from "../components/FixedExpenses/FixedExpenseItem";
import FixedExpenseForm from "../components/FixedExpenses/FixedExpenseForm";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

type Modal = { mode: "create" } | { mode: "edit"; fe: FixedExpense };

export default function FixedExpenses() {
  const { fixedExpenses, loading, error, createFixedExpense, updateFixedExpense, deleteFixedExpense } =
    useFixedExpenses();
  const [modal, setModal] = useState<Modal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FixedExpense | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const today = new Date().getDate();

  const pending = fixedExpenses.filter((fe) => fe.due_day > today);
  const past = fixedExpenses.filter((fe) => fe.due_day <= today);
  const totalMonthly = fixedExpenses.reduce((sum, fe) => sum + fe.amount, 0);
  const totalPending = pending.reduce((sum, fe) => sum + fe.amount, 0);

  const handleCreate = async (data: FixedExpenseCreate) => {
    await createFixedExpense(data);
    setModal(null);
  };

  const handleEdit = async (data: FixedExpenseCreate) => {
    if (!modal || modal.mode !== "edit") return;
    await updateFixedExpense(modal.fe.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFixedExpense(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Gastos fijos</h1>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando gastos fijos...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && fixedExpenses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium text-gray-700">Sin gastos fijos aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Agrega tus gastos recurrentes para tener una vista completa de tus compromisos mensuales
            </p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="mt-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Agregar gasto fijo
            </button>
          </div>
        )}

        {/* Resumen mensual */}
        {fixedExpenses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
              Resumen del mes
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">{fmt(totalMonthly)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total mensual</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{fmt(totalPending)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Pendientes este mes</p>
              </div>
            </div>
            {/* Barra de progreso */}
            {totalMonthly > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(((totalMonthly - totalPending) / totalMonthly) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {past.length} de {fixedExpenses.length} pagados este mes
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pendientes */}
        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium px-1">
              Por pagar
            </p>
            {pending.map((fe) => (
              <FixedExpenseItem
                key={fe.id}
                fe={fe}
                today={today}
                onEdit={() => setModal({ mode: "edit", fe })}
                onDelete={() => { setDeleteTarget(fe); setActionError(null); }}
              />
            ))}
          </div>
        )}

        {/* Ya pagados */}
        {past.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium px-1">
              Pagados este mes
            </p>
            {past.map((fe) => (
              <FixedExpenseItem
                key={fe.id}
                fe={fe}
                today={today}
                onEdit={() => setModal({ mode: "edit", fe })}
                onDelete={() => { setDeleteTarget(fe); setActionError(null); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {modal.mode === "create" ? "Nuevo gasto fijo" : "Editar gasto fijo"}
            </h2>
            <FixedExpenseForm
              initial={modal.mode === "edit" ? modal.fe : undefined}
              onSubmit={modal.mode === "create" ? handleCreate : handleEdit}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">¿Eliminar gasto fijo?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Se archivará <strong>{deleteTarget.name}</strong>. Puedes volver a agregarlo si lo necesitas.
            </p>
            {actionError && (
              <p className="text-sm text-red-600 mb-3">{actionError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
