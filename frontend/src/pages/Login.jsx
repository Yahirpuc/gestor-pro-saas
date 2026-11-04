import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field, Input, Spinner } from '../components/ui';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@norbe.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-[#08090c]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
            N
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Accede a tu espacio de trabajo
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          {mode === 'register' && (
            <Field label="Nombre">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoFocus />
            </Field>
          )}
          <Field label="Correo electrónico">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" autoFocus={mode === 'login'} />
          </Field>
          <Field label="Contraseña">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Spinner />}
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            className="w-full text-center text-xs text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-200"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Demo: admin@norbe.local / admin123
        </p>
      </div>
    </div>
  );
}
