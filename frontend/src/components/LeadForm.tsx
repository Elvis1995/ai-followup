import { useState } from "react";

interface LeadFormProps {
  onLeadAdded?: () => void;
}

export default function LeadForm({ onLeadAdded }: LeadFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("");

  const submitLead = async () => {
    const res = await fetch("http://localhost:3001/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setStatus("Lead skickad!");
      setForm({ name: "", email: "", phone: "", message: "" });
      if (onLeadAdded) onLeadAdded();
    } else {
      setStatus("Fel uppstod: " + data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Skicka Lead</h2>

      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Namn"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Telefon"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />
      <textarea
        className="w-full mb-3 p-2 border rounded"
        placeholder="Meddelande"
        value={form.message}
        onChange={e => setForm({ ...form, message: e.target.value })}
      />

      <button
        onClick={submitLead}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
      >
        Skicka
      </button>

      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
