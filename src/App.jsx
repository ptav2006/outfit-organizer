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

      <div className="app">
        <header className="hero">
          <div>
            <p className="tag">STYLE PLANNER</p>
            <h1>Organizador de Outfits</h1>
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

