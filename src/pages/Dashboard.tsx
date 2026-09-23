import { useState, useEffect } from "react";
import { api } from "../services/api";
import { User, Ingredient, Recipe } from "../types";
import ProfileModal from "../components/ProfileModal";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    try {
      const data = await api.get<Ingredient[]>("/ingredients");
      setIngredients(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddIngredient(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/ingredients", {
        name,
        quantity: Number(quantity),
        unit,
      });
      setName("");
      setQuantity("");
      setUnit("");
      loadIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon ingrediënt niet toevoegen");
    }
  }

  async function handleDeleteIngredient(id: string) {
    try {
      await api.delete(`/ingredients/${id}`);
      loadIngredients();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleGenerateRecipe() {
    setGenerating(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await api.post<Recipe>("/recipes/generate");
      setRecipe(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon geen recept genereren");
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogout() {
    await api.post("/auth/logout");
    onLogout();
  }

  return (
    <div className="dashboard">
      <header>
        <div className="brand">
          <img src="/logo.png" alt="EcoBite" className="logo" />
          <h1>EcoBite</h1>
        </div>
        <div className="header-actions">
          <button className="profile-icon-btn" onClick={() => setShowProfile(true)} title={user.display_name || user.email}>
            <UserIcon />
          </button>
          <button className="icon-btn" onClick={handleLogout} title="Uitloggen">
            <LogoutIcon />
          </button>
        </div>
      </header>

      <section className="ingredients-section">
        <h2>Mijn ingrediënten</h2>

        <form onSubmit={handleAddIngredient} className="ingredient-form">
          <input
            type="text"
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Hoeveelheid"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Eenheid (g, ml, pcs...)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
          <button type="submit">Toevoegen</button>
        </form>

        <ul className="ingredients-list">
          {ingredients.map((ing) => (
            <li key={ing.id}>
              {ing.quantity} {ing.unit} {ing.name}
              <button onClick={() => handleDeleteIngredient(ing.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="generate-section">
        <button onClick={handleGenerateRecipe} disabled={generating}>
          {generating ? (
            <span className="spinner-wrapper">
              <span className="spinner" /> Bezig...
            </span>
          ) : (
            "Genereer recept"
          )}
        </button>

        {error && <p className="error">{error}</p>}

        {recipe && (
          <div className="recipe-card">
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>

            <p>
              {recipe.cooking_time_minutes} min · {recipe.servings} porties
            </p>

            <h4>Ingrediënten</h4>
            <ul>
              {recipe.ingredients.map((ri, i) => (
                <li key={i}>
                  {ri.amount} {ri.unit} {ri.ingredient_name}
                </li>
              ))}
            </ul>

            <h4>Bereiding</h4>
            <ol>
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <div className="recipe-metrics-container">
              {recipe.nutrition && (
                <div className="metric-card">
                  <div className="metric-header">
                    <span className={`nutri-badge nutri-${recipe.nutrition.nutri_score.toLowerCase()}`}>
                      {recipe.nutrition.nutri_score}
                    </span>
                    <h4>Voedingswaarden</h4>
                    <span className="portion-badge">per portie</span>
                  </div>

                  <div className="macros-grid">
                    <div className="macro-item kcal">
                      <span className="macro-value">{recipe.nutrition.calories_per_serving}</span>
                      <span className="macro-label">kcal</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{recipe.nutrition.proteins_per_serving}g</span>
                      <span className="macro-label">eiwit</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{recipe.nutrition.fats_per_serving}g</span>
                      <span className="macro-label">vet</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">{recipe.nutrition.carbs_per_serving}g</span>
                      <span className="macro-label">koolhydr.</span>
                    </div>
                  </div>
                </div>
              )}

              {recipe.energy && (
                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Energie</h4>
                  </div>

                  <div className="energy-body">
                    <div className="eco-badge">
                      <span className="eco-label">label</span>
                      <span className="eco-grade">{recipe.energy.energy_efficiency_label}</span>
                    </div>

                    <div className="energy-details">
                      <div className="energy-detail-row">
                        <span className="detail-label">Verbruik</span>
                        <span className="detail-value">{recipe.energy.estimated_kwh} kWh</span>
                      </div>
                      <div className="energy-detail-row">
                        <span className="detail-label">CO₂-impact</span>
                        <span className="detail-value">{recipe.energy.co2_impact_grams} g</span>
                      </div>
                      <div className="energy-detail-row">
                        <span className="detail-label">Geschatte kosten</span>
                        <span className="detail-value">€{recipe.energy.estimated_cost_eur}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

export default Dashboard;