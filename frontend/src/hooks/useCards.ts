import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export interface Card {
  id: string;
  user_id: string;
  name: string;
  type: "credit" | "debit";
  credit_limit: number | null;
  closing_day: number | null;
  due_day: number | null;
  color: string;
  current_balance: number;
  balance_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CardCreate {
  name: string;
  type: "credit" | "debit";
  credit_limit?: number | null;
  closing_day?: number | null;
  due_day?: number | null;
  color: string;
  current_balance?: number;
}

export interface CardUpdate {
  name?: string;
  credit_limit?: number | null;
  closing_day?: number | null;
  due_day?: number | null;
  color?: string;
  current_balance?: number;
  is_active?: boolean;
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Card[]>("/cards");
      setCards(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar tarjetas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = async (data: CardCreate) => {
    const card = await api.post<Card>("/cards", data);
    setCards((prev) => [...prev, card]);
    return card;
  };

  const updateCard = async (id: string, data: CardUpdate) => {
    const updated = await api.patch<Card>(`/cards/${id}`, data);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCard = async (id: string): Promise<void> => {
    await api.delete<void>(`/cards/${id}`);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return { cards, loading, error, createCard, updateCard, deleteCard, refetch: fetchCards };
}
