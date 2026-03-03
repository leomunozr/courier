"use client";

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setShipment(null);
      const { data } = await api.get(`/shipments/track/${trackingNumber}`);
      setShipment(data);
    } catch (err) {
      setError('No pudimos localizar un envío con ese número de rastreo.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)] p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-primary)] rounded-2xl mb-6 shadow-lg transform rotate-3">
                <span className="text-white text-4xl font-extrabold -rotate-3">C</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3 text-[var(--color-primary)] tracking-tight">Rastreo de Paquetes</h1>
            <p className="text-[var(--color-text-muted)] text-lg">Consulta el estado de tu envío en tiempo real</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-3 mb-10 bg-[var(--color-surface)] p-3 rounded-2xl shadow-xl border border-[var(--color-border)]">
          <input
            type="text"
            placeholder="Ej. TRK123456789"
            className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-0 font-mono text-lg text-center tracking-widest uppercase placeholder:text-[var(--color-text-muted)] placeholder:font-sans placeholder:tracking-normal placeholder:text-base text-[var(--color-text)]"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            required
          />
          <button type="submit" className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl font-bold shadow-md hover:bg-[var(--color-text-muted)] transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap">
            Rastrear
          </button>
        </form>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-8" role="alert">
                <p className="font-bold">Aviso</p>
                <p>{error}</p>
            </div>
        )}

        {shipment && (
          <div className="bg-[var(--color-surface)] p-8 rounded-2xl shadow-2xl border border-[var(--color-border)] transform transition-all animate-fade-in-up">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-[var(--color-border)]">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Detalles del Envío</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Información actualizada</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Estado Actual</p>
                    <span className="bg-[var(--color-accent)] text-slate-900 font-bold px-4 py-2 rounded-full text-sm shadow-sm">
                        {shipment.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10 bg-[var(--color-background)] p-6 rounded-xl border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-1">Número de Rastreo</p>
                <p className="font-mono font-bold text-lg text-[var(--color-primary)]">{shipment.trackingNumber}</p>
              </div>
               <div>
                <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-1">Fecha de Creación</p>
                <p className="font-medium text-[var(--color-text)]">{new Date(shipment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-6 text-[var(--color-text)]">Historial de Movimientos</h3>
            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary)] before:to-[var(--color-border)]">
              {shipment.events?.map((ev: any, i: number) => (
                <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-[var(--color-surface)] bg-[var(--color-primary)] absolute -left-11 md:mx-auto md:left-1/2 md:-translate-x-1/2 shadow"></div>

                    <div className="w-full bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                             <p className="font-bold text-[var(--color-text)] text-lg">{ev.eventType}</p>
                             <p className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)]">{new Date(ev.createdAt).toLocaleString()}</p>
                        </div>
                        {ev.location && <p className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-1 mt-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {ev.location}
                        </p>}
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
