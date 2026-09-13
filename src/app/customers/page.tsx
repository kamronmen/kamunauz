"use client";

import { useEffect, useState } from "react";
import { Customer } from "@/types";
import { formatMoney, formatDateShort } from "@/lib/utils";
import { Users, Search, Plus, Phone, MapPin, Trash2, Edit3, UserCheck, BookOpen } from "lucide-react";
import { sound } from "@/lib/sound";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create/Edit customer inline state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [initialDebt, setInitialDebt] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cust?: Customer) => {
    if (cust) {
      setEditingCustomer(cust);
      setName(cust.name);
      setPhone(cust.phone);
      setAddress(cust.address || "");
      setNotes(cust.notes || "");
      setInitialDebt("");
    } else {
      setEditingCustomer(null);
      setName("");
      setPhone("+998 ");
      setAddress("");
      setNotes("");
      setInitialDebt("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
          initialDebt: initialDebt ? parseFloat(initialDebt) : undefined,
        }),
      });

      if (res.ok) {
        sound.playBeep();
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" mijozini bazadan o'chirishni tasdiqlaysizmi?`)) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        sound.playBeep();
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Mijozlar Bazasi</span>
          </h2>
          <p className="text-xs text-slate-500">
            Do'kon xaridorlari va qarzdorlar ro'yxati ({customers.length} ta)
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi mijoz</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Mijoz ismi, telefon raqami yoki manzilidan qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-100/80 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Mijoz Ismi</th>
                <th className="p-3.5">Telefon Raqami</th>
                <th className="p-3.5">Manzil</th>
                <th className="p-3.5 text-right">Nasiya Balansi</th>
                <th className="p-3.5 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Mijozlar topilmadi
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {c.name}
                      {c.notes && (
                        <p className="text-[10px] text-slate-400 font-normal">{c.notes}</p>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">
                      {c.phone}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {c.address || "-"}
                    </td>
                    <td className="p-3.5 text-right font-extrabold">
                      <span className={c.totalDebt > 0 ? "text-rose-600" : "text-emerald-600"}>
                        {formatMoney(c.totalDebt)}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingCustomer ? "Mijozni tahrirlash" : "Yangi mijoz yaratish"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mijoz Ismi *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefon raqam *:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Manzil / Mo'ljal:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Eslatma (Izoh):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {!editingCustomer && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Boshlang'ich qarz summasi (agar bor bo'lsa):</label>
                  <input
                    type="number"
                    value={initialDebt}
                    onChange={(e) => setInitialDebt(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
              )}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
