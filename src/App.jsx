import "./App.css";
import { useEffect, useMemo, useState } from "react";

const categories = [
  "T-shirt", "Camisa", "Polo", "Sweatshirt", "Casaco", "Blazer",
  "Calças", "Jeans", "Calções", "Fato", "Sapatilhas", "Sapatos",
  "Relógio", "Cinto", "Mochila", "Acessório"
];

const styles = ["Casual", "Formal", "Streetwear", "Universidade", "Trabalho", "Saída", "Viagem", "Ginásio"];

export default function App() {
  const [outfits, setOutfits] = useState(() => {
    return JSON.parse(localStorage.getItem("outfits-masculinos")) || [];
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  const [form, setForm] = useState({
    title: "",
    occasion: "",
    date: "",
    style: "Casual",
    image: "",
    pieces: [{ name: "", category: "T-shirt", color: "" }]
  });

  useEffect(() => {
    localStorage.setItem("outfits-masculinos", JSON.stringify(outfits));
  }, [outfits]);

  function addPiece() {
    setForm({
      ...form,
      pieces: [...form.pieces, { name: "", category: "T-shirt", color: "" }]
    });
  }

  function updatePiece(index, field, value) {
    const updated = [...form.pieces];
    updated[index][field] = value;
    setForm({ ...form, pieces: updated });
  }

  function removePiece(index) {
    setForm({
      ...form,
      pieces: form.pieces.filter((_, i) => i !== index)
    });
  }

  function addOutfit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setOutfits([
      {
        id: Date.now(),
        ...form,
        pieces: form.pieces.filter(p => p.name.trim())
      },
      ...outfits
    ]);

    setForm({
      title: "",
      occasion: "",
      date: "",
      style: "Casual",
      image: "",
      pieces: [{ name: "", category: "T-shirt", color: "" }]
    });
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  const filteredOutfits = useMemo(() => {
    return outfits.filter(outfit => {
      const text = JSON.stringify(outfit).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter = filter === "Todos" || outfit.style === filter;
      return matchesSearch && matchesFilter;
    });
  }, [outfits, search, filter]);

  return (
    <>
      <style>{css}</style>

      <div className="app">
        <header className="hero">
          <div>
            <p className="tag">STYLE PLANNER</p>
            <h1>Organizador de Outfits Masculinos</h1>
            <p className="subtitle">
              Guarda combinações, planeia looks e organiza as tuas peças por ocasião, estilo e data.
            </p>
          </div>

          <div className="stats">
            <span>{outfits.length}</span>
            <p>outfits guardados</p>
          </div>
        </header>

        <main className="layout">
          <section className="panel">
            <h2 className="form-title">Novo outfit</h2>

            <form onSubmit={addOutfit}>
              <input
                placeholder="Nome do outfit"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />

              <div className="grid2">
                <input
                  placeholder="Ocasião"
                  value={form.occasion}
                  onChange={e => setForm({ ...form, occasion: e.target.value })}
                />

                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <select
                value={form.style}
                onChange={e => setForm({ ...form, style: e.target.value })}
              >
                {styles.map(s => <option key={s}>{s}</option>)}
              </select>

              <label className="upload">
                {form.image ? "Imagem escolhida ✅" : "Adicionar fotografia do outfit"}
                <input type="file" accept="image/*" onChange={handleImage} />
              </label>

              {form.image && <img className="preview" src={form.image} alt="Preview" />}

              <h3>Peças do outfit</h3>

              {form.pieces.map((piece, index) => (
                <div className="piece" key={index}>
                  <input
                    placeholder="Nome da peça"
                    value={piece.name}
                    onChange={e => updatePiece(index, "name", e.target.value)}
                  />

                  <div className="grid2">
                    <select
                      value={piece.category}
                      onChange={e => updatePiece(index, "category", e.target.value)}
                    >
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>

                    <input
                      placeholder="Cor"
                      value={piece.color}
                      onChange={e => updatePiece(index, "color", e.target.value)}
                    />
                  </div>

                  {form.pieces.length > 1 && (
                    <button
                      type="button"
                      className="deleteSmall"
                      onClick={() => removePiece(index)}
                    >
                      Remover peça
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="secondary" onClick={addPiece}>
                + Adicionar peça
              </button>

              <button className="primary">Guardar outfit</button>
            </form>
          </section>

          <section className="content">
            <div className="toolbar">
              <input
                placeholder="Pesquisar por peça, cor, estilo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option>Todos</option>
                {styles.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="cards">
              {filteredOutfits.length === 0 && (
                <div className="empty">
                  <h2 className="ainda-title">Ainda não tens outfits guardados.</h2>
                  <p>Cria o primeiro conjunto no formulário ao lado.</p>
                </div>
              )}

              {filteredOutfits.map(outfit => (
                <article className="card" key={outfit.id}>
                  {outfit.image ? (
                    <img src={outfit.image} alt={outfit.title} />
                  ) : (
                    <div className="placeholder">OUTFIT</div>
                  )}

                  <div className="cardBody">
                    <div className="cardTop">
                      <div>
                        <h2>{outfit.title}</h2>
                        <p>{outfit.occasion || "Sem ocasião"} · {outfit.date || "Sem data"}</p>
                      </div>

                      <span>{outfit.style}</span>
                    </div>

                    <div className="piecesList">
                      {outfit.pieces.map((p, i) => (
                        <div className="pieceTag" key={i}>
                          <strong>{p.name}</strong>
                          <small>{p.category} {p.color && `· ${p.color}`}</small>
                        </div>
                      ))}
                    </div>

                    <button
                      className="delete"
                      onClick={() => setOutfits(outfits.filter(o => o.id !== outfit.id))}
                    >
                      Apagar outfit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

const css = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background:
    radial-gradient(circle at top left, #3b82f6 0, transparent 30%),
    radial-gradient(circle at top right, #111827 0, transparent 35%),
    #0f172a;
  color: #f8fafc;
}

.app {
  min-height: 100vh;
  padding: 32px;
}

.hero {
  max-width: 1300px;
  margin: 0 auto 32px;
  padding: 42px;
  border-radius: 34px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.18);
  display: flex;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.35);
}

.tag {
  letter-spacing: 4px;
  color: #93c5fd;
  font-size: 13px;
  font-weight: 800;
}

h1 {
  font-size: clamp(36px, 5vw, 72px);
  margin: 0;
  line-height: 1;
}

.subtitle {
  color: #cbd5e1;
  max-width: 680px;
  font-size: 18px;
  line-height: 1.7;
}

.stats {
  min-width: 190px;
  border-radius: 28px;
  padding: 28px;
  background: #f8fafc;
  color: #0f172a;
  text-align: center;
  align-self: center;
}

.stats span {
  font-size: 64px;
  font-weight: 900;
}

.stats p {
  margin: 0;
  color: #475569;
  font-weight: 700;
}

.layout {
  max-width: 1300px;
  margin: auto;
  display: grid;
  grid-template-columns: 430px 1fr;
  gap: 28px;
}

.panel, .toolbar, .card, .empty {
  background: rgba(255,255,255,0.92);
  color: #0f172a;
  border-radius: 30px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
}

.panel {
  padding: 26px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.panel h2 {
  margin-top: 0;
  font-size: 30px;
}

.panel h3 {
  margin-top: 26px;
}

input, select {
  width: 100%;
  padding: 15px 16px;
  margin-bottom: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  font-size: 15px;
  outline: none;
  background: white;
  color: #0f172a;
}

input:focus, select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.upload {
  display: block;
  padding: 18px;
  margin-bottom: 16px;
  border: 2px dashed #94a3b8;
  border-radius: 20px;
  text-align: center;
  font-weight: 800;
  color: #2563eb;
  cursor: pointer;
  background: #eff6ff;
}

.upload input {
  display: none;
}

.preview {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 24px;
  margin-bottom: 16px;
}

.piece {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 22px;
  margin-bottom: 14px;
}

button {
  border: 0;
  cursor: pointer;
  font-weight: 900;
  border-radius: 18px;
  transition: 0.2s;
}

.primary {
  width: 100%;
  padding: 17px;
  margin-top: 14px;
  background: #0f172a;
  color: white;
  font-size: 16px;
}

.primary:hover {
  transform: translateY(-2px);
  background: #020617;
}

.secondary {
  width: 100%;
  padding: 15px;
  background: #dbeafe;
  color: #1d4ed8;
}

.deleteSmall {
  background: transparent;
  color: #dc2626;
  padding: 6px 0;
}

.toolbar {
  padding: 18px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 14px;
}

.toolbar input,
.toolbar select {
  margin: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.card {
  overflow: hidden;
}

.card > img,
.placeholder {
  width: 100%;
  height: 280px;
  object-fit: cover;
  background: linear-gradient(135deg, #1e293b, #2563eb);
  color: white;
  display: grid;
  place-items: center;
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 5px;
}

.cardBody {
  padding: 24px;
}

.cardTop {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.cardTop h2 {
  margin: 0;
  font-size: 28px;
}

.cardTop p {
  margin: 8px 0 0;
  color: #64748b;
}

.cardTop span {
  height: fit-content;
  padding: 9px 14px;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-size: 13px;
  font-weight: 900;
}

.piecesList {
  margin-top: 20px;
  display: grid;
  gap: 10px;
}

.pieceTag {
  padding: 14px;
  border-radius: 16px;
  background: #f1f5f9;
}

.pieceTag strong {
  display: block;
}

.pieceTag small {
  color: #64748b;
}

.delete {
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background: #fee2e2;
  color: #b91c1c;
}

.empty {
  grid-column: 1 / -1;
  padding: 60px;
  text-align: center;
}

.empty h2 {
  margin: 0;
}

.empty p {
  color: #64748b;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .app {
    padding: 16px;
  }

  .hero {
    padding: 28px;
  }

  .grid2,
  .toolbar {
    grid-template-columns: 1fr;
  }
}
`;