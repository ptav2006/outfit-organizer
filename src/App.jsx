import "./App.css";
import { useEffect, useMemo, useState } from "react";

const categories = [
  "T-shirt", "Camisa", "Polo", "Sweatshirt", "Casaco",
  "Calças", "Calções", "Fato", "Calçado",
  "Relógio", "Cinto", "Mochila", "Acessório"
];

const outfitStyles = [
  "Casual",
  "Formal",
  "Streetwear",
  "Smart Casual",
  "Desportivo",
  "Minimalista"
];

const outfitFunctions = [
  "Universidade",
  "Trabalho",
  "Saída",
  "Evento",
  "Viagem",
  "Ginásio",
  "Outro"
];

export default function App() {
  const [outfits, setOutfits] = useState(() => {
    return JSON.parse(localStorage.getItem("outfits-masculinos")) || [];
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  const [form, setForm] = useState({
    title: "",
    style: "Casual",
    function: "Universidade",
    customFunction: "",
    image: "",
    pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff" }]
  });

  useEffect(() => {
    localStorage.setItem("outfits-masculinos", JSON.stringify(outfits));
  }, [outfits]);

  function addPiece() {
    setForm({
      ...form,
      pieces: [
        ...form.pieces,
        { name: "", category: "T-shirt", colors: [], tempColor: "#ffffff" }]
    });
  }

  function updatePiece(index, field, value) {
    const updated = [...form.pieces];
    updated[index][field] = value;
    setForm({ ...form, pieces: updated });
  }
  function addColorToPiece(index) {
    const updated = [...form.pieces];
    const color = updated[index].tempColor || "#ffffff";

    updated[index].colors = [...(updated[index].colors || []), color];
    updated[index].tempColor = "#ffffff";
    
    setForm({ ...form, pieces: updated });
  } 

  function removeColorFromPiece(pieceIndex, colorIndex) {
    const updated = [...form.pieces];

    updated[pieceIndex].colors = updated[pieceIndex].colors.filter((_, i) => i !== colorIndex);
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
      function: "Universidade",
      customFunction: "",
      style: "Casual",
      image: "",
      pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff" }]
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
      <div className="app">
        <header className="hero">
          <div>
            <p className="tag">STYLE PLANNER</p>
            <h1>Outfit Organizer</h1>
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
            <h2 className="form-title">New outfit</h2>

            <form onSubmit={addOutfit}>
              <input
                placeholder="Nome do outfit"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />

              <div className="grid2">
              <select
                value={form.style}
                onChange={e => setForm({ ...form, style: e.target.value })}
              >
                {outfitStyles.map(s => <option key={s}>{s}</option>)}
              </select>

              <select
                value={form.function}
                onChange={e => setForm({ ...form, function: e.target.value })}
              >
                {outfitFunctions.map(f => <option key={f}>{f}</option>)}
              </select>
              </div>

            {form.function === "Outro" && (
              <input
                placeholder="Escreve para que é o outfit"
                value={form.customFunction}
                onChange={e => setForm({ ...form, customFunction: e.target.value })}
              />
            )}

              <label className="upload">
                {form.image ? "Imagem escolhida ✅" : "Adicionar Fotografia"}
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

                    <div className="colorArea">
                      <div className="colorPickerRow">
                        <input
                          type="color"
                          value={piece.tempColor || "#ffffff"}
                          onChange={e => updatePiece(index, "tempColor", e.target.value)}
                          className="colorPicker"
                          />

                        <button
                          type="button"
                          className="addColorBtn"
                          onClick={() => addColorToPiece(index)}
                        >
                          +
                        </button>
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

                      <div className="colorsPreview">
                        {piece.colors?.map((color, colorIndex) => (
                          <span
                            key={colorIndex}
                            className="colorDot"
                            style={{ backgroundColor: color }}
                            onClick={() => removeColorFromPiece(index, colorIndex)}
                          />
                        ))}
                      </div>
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
                {outfitStyles.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="cards">
              {filteredOutfits.length === 0 && (
                <div className="empty">
                  <h2 className="ainda-title">Ainda não tens outfits guardados</h2>
                  <p>Cria o teu primeiro conjunto</p>
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
                          <small>
                            {p.category}
                            <span className="savedColors">
                              {p.colors?.map((color, i) => (
                                <span
                                  key={i}
                                  className="savedColorDot"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </span>
                          </small>
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
  );
}

