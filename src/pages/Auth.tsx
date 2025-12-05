import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Erfolgreich eingeloggt!' });
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check deine E-Mails für den Bestätigungslink!' });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password-Reset E-Mail wurde gesendet!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  const isForgotMode = mode === 'forgot';

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Medical Icons */}
      <div className="absolute top-20 left-20 text-primary/30 text-6xl float pulse-neon">✚</div>
      <div className="absolute bottom-32 right-20 text-secondary/30 text-4xl float" style={{ animationDelay: '1s' }}>💊</div>
      <div className="absolute top-40 right-32 text-accent/30 text-5xl float" style={{ animationDelay: '2s' }}>🩺</div>
      <div className="absolute bottom-20 left-32 text-primary/30 text-4xl float" style={{ animationDelay: '0.5s' }}>🧬</div>

      {/* Main Card */}
      <div className="glass rounded-3xl p-8 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary neon-glow mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>MedBattle</h1>
          <p className="text-muted-foreground mt-2">Medical Quiz Arena</p>
        </div>

        {/* Tabs */}
        {!isForgotMode && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              onClick={() => { setMode('login'); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-primary text-primary-foreground neon-glow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setMessage(null); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'signup' 
                  ? 'bg-secondary text-secondary-foreground neon-glow-purple' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrieren
            </button>
          </div>
        )}

        {isForgotMode && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-center text-foreground">Passwort zurücksetzen</h2>
            <p className="text-muted-foreground text-center text-sm mt-1">Wir senden dir einen Reset-Link</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
              placeholder="deine@email.de"
              required
            />
          </div>

          {!isForgotMode && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setMessage(null); }}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Passwort vergessen?
            </button>
          )}

          {isForgotMode && (
            <button
              type="button"
              onClick={() => { setMode('login'); setMessage(null); }}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              ← Zurück zum Login
            </button>
          )}

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' 
                ? 'bg-primary/10 text-primary border border-primary/30' 
                : 'bg-destructive/10 text-destructive border border-destructive/30'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all btn-shine ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-secondary to-pink-500 text-white neon-glow-purple'
                : 'bg-gradient-to-r from-primary to-accent text-primary-foreground neon-glow'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Laden...
              </span>
            ) : mode === 'login' ? 'Einloggen' : mode === 'signup' ? 'Account erstellen' : 'Link senden'}
          </button>
        </form>

        {/* Divider */}
        {!isForgotMode && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-sm">oder weiter mit</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all hover:scale-105 hover:border-primary/50 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                  <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                  <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                </svg>
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
                className="flex items-center justify-center py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all hover:scale-105 hover:border-[#1877F2]/50 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <button
                onClick={() => handleSocialLogin('twitter')}
                disabled={loading}
                className="flex items-center justify-center py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all hover:scale-105 hover:border-foreground/30 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Mit der Anmeldung akzeptierst du unsere{' '}
          <a href="#" className="text-primary hover:underline">AGB</a> und{' '}
          <a href="#" className="text-primary hover:underline">Datenschutz</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
