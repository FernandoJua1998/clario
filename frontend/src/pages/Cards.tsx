import { useState } from "react";
import { useCards, type Card, type CardCreate } from "../hooks/useCards";
import CardItem from "../components/Cards/CardItem";
import CardForm from "../components/Cards/CardForm";

type Modal = { mode: "create" } | { mode: "edit"; card: Card };

export default function Cards() {
  const { cards, loading, error, createCard, updateCard, deleteCard } = useCards();
  const [modal, setModal] = useState<Modal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreate = async (data: CardCreate) => {
    await createCard(data);
    setModal(null);
  };

  const handleEdit = async (data: CardCreate) => {
    if (!modal || modal.mode !== "edit") return;
    await updateCard(modal.card.id, data);
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCard(deleteTarget.id);
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
          <h1 className="text-xl font-bold text-gray-900">Mis tarjetas</h1>
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

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando tarjetas...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💳</div>
            <p className="font-medium text-gray-700">Sin tarjetas aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Agrega tu primera tarjeta para empezar a registrar gastos
            </p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="mt-4 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Agregar tarjeta
            </button>
          </div>
        )}

        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onEdit={() => setModal({ mode: "edit", card })}
            onDelete={() => setDeleteTarget(card)}
          />
        ))}
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
              {modal.mode === "create" ? "Nueva tarjeta" : "Editar tarjeta"}
            </h2>
            <CardForm
              initial={modal.mode === "edit" ? modal.card : undefined}
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
            <h2 className="font-bold text-gray-900 mb-1">¿Eliminar tarjeta?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Se archivará <strong>{deleteTarget.name}</strong>. El historial de gastos se conserva.
            </p>
            {actionError && (
              <p className="text-sm text-red-600 mb-3">{actionError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteTarget(null); setActionError(null); }}
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
