"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AuditPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/audit');
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--color-primary)] tracking-tight">Registro de Auditoría</h1>
            <p className="text-[var(--color-text-muted)] mt-2 font-medium">Historial inmutable de operaciones del sistema</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push('/dashboard')} className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold px-6 py-2.5 rounded-lg hover:bg-[var(--color-border)] transition-colors shadow-sm">Volver al Panel</button>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm">Cerrar Sesión</button>
          </div>
        </header>

        <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-xl border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[var(--color-background)]">
                <tr>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">ID Trace</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Operador</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Acción</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Módulo</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Ref. ID</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)]">Timestamp</th>
                    <th className="p-4 font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] text-center">Payload</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--color-background)] transition-colors">
                    <td className="p-4 text-xs text-[var(--color-text-muted)] font-mono font-medium">{log.id.slice(0, 8)}</td>
                    <td className="p-4 text-sm font-semibold text-[var(--color-text)]">{log.user?.email || log.userId}</td>
                    <td className="p-4">
                        <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold px-2.5 py-1 rounded text-xs border border-[var(--color-primary)]/20">
                            {log.action}
                        </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-[var(--color-text)]">{log.entity}</td>
                    <td className="p-4 text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-background)] rounded p-1 inline-block mt-3">{log.entityId}</td>
                    <td className="p-4 text-xs font-medium text-[var(--color-text)]">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 text-center">
                        <button
                            className="text-[var(--color-primary)] hover:text-white hover:bg-[var(--color-primary)] text-xs font-bold px-3 py-1.5 rounded border border-[var(--color-primary)] transition-colors"
                            onClick={() => alert(JSON.stringify(JSON.parse(log.metadata), null, 2))}
                        >
                            Ver JSON
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {logs.length === 0 && (
              <div className="text-center py-12">
                  <p className="text-[var(--color-text-muted)] font-medium text-lg">La bitácora de auditoría está vacía.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
