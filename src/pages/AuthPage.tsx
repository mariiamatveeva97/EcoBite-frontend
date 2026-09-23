import { useState } from "react";
import { api } from "../services/api";
import { User } from "../types";

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await api.post("/auth/register", { email, password, display_name: displayName });
        const user = await api.post<User>("/auth/login", { email, password });
        onAuthSuccess(user);
      } else {
        const user = await api.post<User>("/auth/login", { email, password });
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>EcoBite</h1>
      <form onSubmit={handleSubmit}>
        <h2>{isRegistering ? "Registreren" : "Inloggen"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isRegistering && (
          <input
            type="text"
            placeholder="Naam"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Bezig..." : isRegistering ? "Registreren" : "Inloggen"}
        </button>
      </form>

      <p>
        {isRegistering ? "Heb je al een account?" : "Nog geen account?"}{" "}
        <button
          type="button"
          className="link-button"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Inloggen" : "Registreren"}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;