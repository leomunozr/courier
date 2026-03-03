"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      loginAction(data.user, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background)]">
      <form onSubmit={handleLogin} className="p-8 bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-md border border-[var(--color-border)]">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">C</span>
            </div>
        </div>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-[var(--color-primary)] tracking-tight">Acceso Corporativo</h2>
        {error && <p className="text-white bg-red-500/90 p-3 rounded-md mb-4 text-center text-sm font-medium shadow-sm">{error}</p>}

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">Correo Electrónico</label>
          <input
            type="email"
            className="w-full p-3 border rounded-lg border-[var(--color-border)] bg-transparent focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-[var(--color-text)]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="usuario@empresa.com"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text)]">Contraseña</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg border-[var(--color-border)] bg-transparent focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-[var(--color-text)]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] text-white p-3 rounded-lg font-bold shadow-md hover:bg-[var(--color-text-muted)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
