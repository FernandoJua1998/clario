import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export interface FixedExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  is_active: boolean;
  created_at: string;
}

export interface FixedExpenseCreate {
  name: string;
  amount: number;
  category: string;
  due_day: number;
}

export interface FixedExpenseUpdate {
  name?: string;
  amount?: number;
  category?: string;
  due_day?: number;
  is_active?: boolean;
}

export function useFixedExpenses() {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFixedExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<FixedExpense[]>("/fixed-expenses");
      setFixedExpenses(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar gastos fijos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFixedExpenses();
  }, [fetchFixedExpenses]);

  const createFixedExpense = async (data: FixedExpenseCreate) => {
    const fe = await api.post<FixedExpense>("/fixed-expenses", data);
    setFixedExpenses((prev) => [...prev, fe].sort((a, b) => a.due_day - b.due_day));
    return fe;
  };

  const updateFixedExpense = async (id: string, data: FixedExpenseUpdate) => {
    const updated = await api.patch<FixedExpense>(`/fixed-expenses/${id}`, data);
    setFixedExpenses((prev) =>
      prev.map((fe) => (fe.id === id ? updated : fe)).sort((a, b) => a.due_day - b.due_day)
    );
    return updated;
  };

  const deleteFixedExpense = async (id: string): Promise<void> => {
    await api.delete<void>(`/fixed-expenses/${id}`);
    setFixedExpenses((prev) => prev.filter((fe) => fe.id !== id));
  };

  return {
    fixedExpenses,
    loading,
    error,
    createFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    refetch: fetchFixedExpenses,
  };
}
