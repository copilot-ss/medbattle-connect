import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';
import { formatUserError } from '../utils/formatUserError';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabaseReady = isSupabaseConfigured;
  const actionDisabled = loading || !supabaseReady;
  const supabaseUrlHint =
    import.meta.env?.VITE_SUPABASE_URL ??
    import.meta.env?.EXPO_PUBLIC_SUPABASE_URL;
  const privacyUrl = import.meta.env?.VITE_PRIVACY_URL;
  const termsUrl = import.meta.env?.VITE_TERMS_URL;
  const legalLinkClass = (url?: string) =>
    `text-primary hover:underline${url ? '' : ' opacity-50 pointer-events-none'}`;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      setMessage({
        type: 'error',
        text: 'Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.',
      });
      return;
    }

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
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check deine E-Mails für den Bestätigungslink!' });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password-Reset E-Mail wurde gesendet!' });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: formatUserError(error, {
          supabaseUrl: supabaseUrlHint,
          fallback: 'Unbekannter Fehler.',
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'discord') => {
    if (!supabaseReady) {
      setMessage({
        type: 'error',
        text: 'Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: formatUserError(error, {
          supabaseUrl: supabaseUrlHint,
          fallback: 'Unbekannter Fehler.',
        }),
      });
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
      <div className="absolute top-20 left-20 text-primary/30 text-6xl float pulse-neon">RX</div>
      <div className="absolute bottom-32 right-20 text-secondary/30 text-4xl float" style={{ animationDelay: '1s' }}>EKG</div>
      <div className="absolute top-40 right-32 text-accent/30 text-5xl float" style={{ animationDelay: '2s' }}>BP</div>
      <div className="absolute bottom-20 left-32 text-primary/30 text-4xl float" style={{ animationDelay: '0.5s' }}>LAB</div>

      {/* Main Card */}
      <div className="glass rounded-3xl p-8 w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary neon-glow mb-4">
            <span className="text-4xl">MB</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>MedBattle</h1>
          <p className="text-muted-foreground mt-2">Medical Quiz Arena</p>
        </div>

        {!supabaseReady && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 text-sm">
            Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY (oder EXPO_PUBLIC_ Varianten) setzen.
          </div>
        )}

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
            <h2 className="text-xl font-semibold text-center text-foreground">Passwort zur\u00fccksetzen</h2>
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
                placeholder="********"
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
              Zur\u00fcck zum Login
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
            disabled={actionDisabled}
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
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={actionDisabled}
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
                onClick={() => handleSocialLogin('discord')}
                disabled={actionDisabled}
                className="flex items-center justify-center py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all hover:scale-105 hover:border-[#5865F2]/50 disabled:opacity-50 group"
              >
                <svg className="w-5 h-5 text-[#5865F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 0H4C1.8 0 0 1.8 0 4v12c0 2.2 1.8 4 4 4h12l-.6-2.1 1.5 1.4L18 20l2.4 2 1.6-1.8-1.3-1.3.9-.7c.9-.7 1.4-1.8 1.4-3V4c0-2.2-1.8-4-4-4Zm-3.7 13.3c0 .1-.1.2-.2.2-1.5.4-2.9.4-4.3 0-.1 0-.2-.1-.2-.2v-.5c-.5.1-1.1.2-1.6.2-1 0-1.8-.3-2.5-.8-.1-.1-.1-.2 0-.3l.4-.7c0-.1.1-.1.2-.1h.1c.7.5 1.4.7 2.1.7.5 0 1-.1 1.5-.3v-.1c0-.2.1-.3.2-.4-.8-.2-1.5-.6-2-.2-.2.2-.4.4-.6.6 0 .1-.2.1-.3 0-.5-.3-.9-.7-1.2-1.2-.1-.1 0-.3.1-.3.5-.4 1-.6 1.6-.7.1 0 .2.1 .3.2.3.5.9.7 1.4.5l1-.3c.1 0 .3 0 .4.1l.3.3c.1.1.3.1.4 0l.3-.3c.1-.1.2-.1.4-.1l1 .3c.5.2 1.1 0 1.4-.5.1-.1.2-.2.3-.2.6.1 1.1.4 1.6.7.1.1.2.2.1.3-.3.5-.7.9-1.2 1.2-.1.1-.2.1-.3 0-.2-.2-.4-.4-.6-.6-.5-.4-1.2 0-2 .2.1.1.2.3.2.4v.1c.5.2 1 .3 1.5 .3.7 0 1.4-.2 2.1-.7.1-.1.2 0 .2.1l.4.7c.1.1.1.2 0 .3-.6.5-1.4.8-2.4.8-.6 0-1.1-.1-1.6-.2v.5Z"/>
                </svg>
              </button>

            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Mit der Anmeldung akzeptierst du unsere{' '}
          <a
            href={termsUrl || '#'}
            className={legalLinkClass(termsUrl)}
            aria-disabled={!termsUrl}
            target="_blank"
            rel="noreferrer"
          >
            AGB
          </a>{' '}
          und{' '}
          <a
            href={privacyUrl || '#'}
            className={legalLinkClass(privacyUrl)}
            aria-disabled={!privacyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Datenschutz
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
