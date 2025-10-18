// src/app/test-supabase/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

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
      <h1 className="text-2xl mb-4">Supabase Test</h1>
      <pre>{JSON.stringify(expenses, null, 2)}</pre>
    </div>
  );
}
