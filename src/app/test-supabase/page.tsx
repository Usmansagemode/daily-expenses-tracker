// src/app/test-supabase/page.tsx
"use client";

import { useEffect, useState } from "react";

import { Expense } from "@/entities/Expense";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (supabase) {
        const { data, error } = await supabase.from("expenses").select("*");
        if (error) console.error(error);
        else setExpenses(data || []);
      }
    };
    fetchExpenses();
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl">Supabase Test</h1>
      <pre>{JSON.stringify(expenses, null, 2)}</pre>
    </div>
  );
}
