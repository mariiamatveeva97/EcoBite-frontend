import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Profile, Recipe } from "../types";

interface ProfileModalProps {
  onClose: () => void;
}

type Tab = "settings" | "recipes";

function ProfileModal({ onClose }: ProfileModalProps) {
  const [tab, setTab] = useState<Tab>("settings");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    api.get<Profile>("/profile").then(setProfile);
  }, []);

  useEffect(() => {
    if (tab === "recipes") {
      api.get<Recipe[]>("/recipes").then(setRecipes);
    }
  }, [tab]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      const updated = await api.put<Profile>("/profile", {
        display_name: profile.display_name,
        daily_calorie_target: profile.daily_calorie_target,
        cooking_experience_level: profile.cooking_experience_level,
        preferred_cooking_time_minutes: profile.preferred_cooking_time_minutes,
        dietary_preferences: profile.dietary_preferences,
      });
      setProfile(updated);
      onClose();
    } catch (error) {
      console.error("Fout bij opslaan van profiel:", error);
      alert("Er is een fout opgetreden bij het opslaan van de instellingen.");
    } finally {
      setSavingProfile(false);
    }
  }

  const X = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm("Weet je zeker dat je dit recept wilt verwijderen?")) {
      return;
    }

    try {
      await api.delete(`/recipes/${id}`);

      setRecipes(recipes.filter((r) => r.id !== id));

      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error("Fout bij verwijderen van recept:", error);
      alert("Er is een fout opgetreden bij het verwijderen.");
    }
  };

  async function handleSelectRecipe(id: string) {
    const full = await api.get<Recipe>(`/recipes/${id}`);
    setSelectedRecipe(full);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-tabs">
          <button
            className={tab === "settings" ? "active" : ""}
            onClick={() => setTab("settings")}
          >
            Instellingen
          </button>
          <button
            className={tab === "recipes" ? "active" : ""}
            onClick={() => setTab("recipes")}
          >
            Recepten
          </button>
        </div>

        {tab === "settings" && profile && (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <label>
              Naam
              <input
                type="text"
                value={profile.display_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
              />
            </label>
            <label>
              Dieetwensen (bijv. Low FODMAP, Vegan)
              <input
                type="text"
                placeholder="Komma gescheiden..."
                value={(profile.dietary_preferences || []).join(", ")}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    dietary_preferences: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label>
              Calorieëndoel
              <input
                type="number"
                value={profile.daily_calorie_target || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    daily_calorie_target: Number(e.target.value),
                  })
                }
              />
            </label>

            <label>
              Kookniveau
              <select
                value={profile.cooking_experience_level || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    cooking_experience_level: e.target.value,
                  })
                }
              >
                <option value="">-</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Gemiddeld</option>
                <option value="advanced">Gevorderd</option>
              </select>
            </label>

            <label>
              Max kooktijd (min)
              <input
                type="number"
                value={profile.preferred_cooking_time_minutes || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferred_cooking_time_minutes: Number(e.target.value),
                  })
                }
              />
            </label>

            <button type="submit" disabled={savingProfile}>
              {savingProfile ? "Opslaan..." : "Opslaan"}
            </button>
          </form>
        )}

        {tab === "recipes" && !selectedRecipe && (
          recipes.length === 0 ? (
            <p className="empty-state">
              Nog geen recepten - genereer je eerste recept op het dashboard!
            </p>
          ) : (
            <ul className="recipes-list">
              {recipes.map((r) => (
                <li
                  key={r.id}
                  className="recipe-history-item"
                  onClick={() => handleSelectRecipe(r.id)}
                >
                  <span>{r.title}</span>
                  <button
                    className="delete-recipe-btn"
                    onClick={(e) => handleDeleteRecipe(r.id, e)}
                    title="Verwijderen"
                  >
                    <X />
                  </button>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "recipes" && selectedRecipe && (
          <div className="recipe-detail">
            <button onClick={() => setSelectedRecipe(null)}>← Terug</button>
            <h3>{selectedRecipe.title}</h3>
            <p>{selectedRecipe.description}</p>
            <ol>
              {selectedRecipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;