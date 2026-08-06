"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  image: string | null;
}

interface CartContextValue {
  items: CartItem[];
  tableId: string | null;
  tableNumber: number | null;
  totalItems: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
  addItem: (item: Omit<CartItem, "quantity" | "notes">, qty?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQty: (menuItemId: string, qty: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  setTable: (id: string | null, number: number | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pak-resto-cart";

interface StoredCart {
  items: CartItem[];
  tableId: string | null;
  tableNumber: number | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumberState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredCart = JSON.parse(raw);
        setItems(stored.items ?? []);
        setTableId(stored.tableId ?? null);
        setTableNumberState(stored.tableNumber ?? null);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const data: StoredCart = { items, tableId, tableNumber };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [items, tableId, tableNumber, hydrated]);

  const addItem = useCallback(
    (base: Omit<CartItem, "quantity" | "notes">, qty = 1, notes = "") => {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.menuItemId === base.menuItemId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + qty,
            notes: notes || updated[idx].notes,
          };
          return updated;
        }
        return [...prev, { ...base, quantity: qty, notes }];
      });
    },
    []
  );

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const updateQty = useCallback((menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i))
    );
  }, []);

  const setTable = useCallback((id: string | null, number: number | null) => {
    setTableId(id);
    setTableNumberState(number);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setTableId(null);
    setTableNumberState(null);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const grandTotal = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        tableId,
        tableNumber,
        totalItems,
        subtotal,
        tax,
        grandTotal,
        addItem,
        removeItem,
        updateQty,
        updateNotes,
        setTable,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
