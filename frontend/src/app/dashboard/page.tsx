"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchShipments();
    }
  }, []);

  const fetchShipments = async () => {
    try {
      const { data } = await api.get('/shipments');
      setShipments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">Panel Operativo</h1>
            <p className="text-[var(--color-text-muted)] mt-2 font-medium">Gestión de envíos y logística</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => router.push('/audit')} className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--color-border)] transition-colors shadow-sm">Auditoría</button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm">Cerrar Sesión</button>
          </div>
        </header>

        <div className="bg-[var(--color-surface)] p-8 rounded-2xl shadow-xl border border-[var(--color-border)]">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Envíos Recientes</h2>
              <button className="bg-[var(--color-primary)] hover:bg-[var(--color-text-muted)] text-white font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm">
                  + Nuevo Envío
              </button>
          </div>

          {shipments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                <p className="text-[var(--color-text-muted)] text-lg">No hay envíos registrados en el sistema.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--color-background)]">
                    <tr>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Tracking Number</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Estado Actual</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Fecha de Registro</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {shipments.map((s) => (
                    <tr key={s.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
                        <td className="p-4 font-mono font-medium text-[var(--color-primary)]">{s.trackingNumber}</td>
                        <td className="p-4">
                        <span className="bg-[var(--color-accent)] text-slate-900 font-bold px-3 py-1.5 rounded-full text-xs shadow-sm inline-block">
                            {s.status}
                        </span>
                        </td>
                        <td className="p-4 text-sm text-[var(--color-text-muted)] font-medium">
                        {new Date(s.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                            <button className="text-[var(--color-primary)] hover:text-[var(--color-text-muted)] font-semibold text-sm underline">Ver Detalle</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
