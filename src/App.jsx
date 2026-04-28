import "./App.css";
import { useEffect, useMemo, useState } from "react";

const categories = [
  "T-shirt", "Camisa", "Polo", "Sweatshirt", "Casaco", "Zip-Up",
  "Calças", "Calções", "Calçado", "Relógio",
  "Headwear", "Mochila", "Acessório"
];

const closetFilters = ["Todos", ...categories];

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
  
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [closedSuggestions, setClosedSuggestions] = useState([]);
  const [closetFilter, setClosetFilter] = useState("Todos");

  const [closetItems, setClosetItems] = useState(() => {
    const saved = localStorage.getItem("closetItems");
    return saved ? JSON.parse(saved) : [];
  });

  const computedClosetItems = useMemo(() => {
    const allPieces = outfits.flatMap((o) => o.pieces || []);

    const unique = [];
    const seen = new Set();

    allPieces.forEach((item) => {
      const key = item.name + item.category;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return unique;
  }, [outfits]);

  const filteredCloset = computedClosetItems.filter((item) =>
  closetFilter === "Todos" || item.category === closetFilter
  );

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

  useEffect(() => {
    localStorage.setItem("closetItems", JSON.stringify(closetItems));
  }, [closetItems]);

  function addPiece() {
    setForm({
      ...form,
      pieces: [
        ...form.pieces,
        { name: "", category: "T-shirt", colors: [], tempColor: "#ffffff" }]
    });
  }

  function deleteClosetItem(id) {
    setClosetItems(closetItems.filter(item => item.id !== id));
  }

  function applyClosetSuggestion(pieceIndex, item) {
    const updated = [...form.pieces];

    updated[pieceIndex] = {
      ...updated[pieceIndex],
      name: item.nome,
      category: item.categoria,
      colors: item.cores || [item.corHex],
      tempColor: item.corHex || "#ffffff",
    };

    setForm({ ...form, pieces: updated });
    setClosedSuggestions([...closedSuggestions, pieceIndex]);
  }

  function editClosetItem(item) {
    const newName = prompt("Novo nome da peça:", item.nome);
    if (!newName || !newName.trim()) return;

    setClosetItems(closetItems.map(closetItem =>
      closetItem.id === item.id
        ? { ...closetItem, nome: newName.trim() }
        : closetItem
    ));
  }

  function addItemToCloset(newItem) {
    setClosetItems((prev) => {
      const alreadyExists = prev.find(
        (item) =>
          item.nome.toLowerCase() === newItem.nome.toLowerCase() &&
          item.cor.toLowerCase() === newItem.cor.toLowerCase()
      );

    if (alreadyExists) {
      return prev.map((item) =>
        item.id === alreadyExists.id
          ? { ...item, vezesUsada: item.vezesUsada + 1 }
          : item
      );
    }

    return [
      ...prev,
      {
        id: crypto.randomUUID(),
        nome: newItem.nome,
        cor: newItem.cor,
        corHex: newItem.corHex,
        cores: newItem.cores,
        categoria: newItem.categoria,
        vezesUsada: 1,
      },
    ];
  });
}

  function deleteOutfit(id) {
  setDeletingId(id);

  setTimeout(() => {
    setOutfits(outfits.filter(outfit => outfit.id !== id));
    setDeletingId(null);
  }, 250);
}

  function updatePiece(index, field, value) {
    const updated = [...form.pieces];
    updated[index][field] = value;
    setForm({ ...form, pieces: updated });
  }

  function editOutfit(outfit) {
  setForm(outfit);
  setEditingId(outfit.id);
  }

  function toggleFavorite(id) {
  setOutfits(outfits.map(outfit =>
    outfit.id === id
      ? { ...outfit, favorite: !outfit.favorite }
      : outfit
  ));
}

  function addColorToPiece(index) {
    const updated = [...form.pieces];
    const color = updated[index].tempColor || "#ffffff";

    updated[index].colors = [...(updated[index].colors || []), color];
    updated[index].tempColor = "#ffffff";
    
    setForm({ ...form, pieces: updated });
  }

  function moveOutfit(targetId) {
  if (!draggedId || draggedId === targetId) return;

  const draggedIndex = outfits.findIndex(o => o.id === draggedId);
  const targetIndex = outfits.findIndex(o => o.id === targetId);

  const updated = [...outfits];
  const [draggedItem] = updated.splice(draggedIndex, 1);
  updated.splice(targetIndex, 0, draggedItem);

  setOutfits(updated);
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
    if (editingId) {
      setOutfits(outfits.map(outfits => outfits.id === editingId ? { ...form, id: editingId, pieces: form.pieces.filter(p => p.name.trim()) } : outfits
    ));
      setEditingId(null);

      setForm({
        title: "",
        function: "Universidade",
        customFunction: "",
        style: "Casual",
        image: "",
        pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff" }]
      });

      return;
    }

    setSaved(true);

    setTimeout(() => setSaved(false), 1400);

    const validPieces = form.pieces.filter(p => p.name.trim());

    validPieces.forEach((piece) => {
      const mainColor = piece.colors?.[0] || piece.tempColor || "#ffffff";

      addItemToCloset({
        nome: piece.name.trim(),
        cor: mainColor,
        corHex: mainColor,
        cores: piece.colors?.length ? piece.colors : [mainColor],
        categoria: piece.category,
      });
    });

    setOutfits([
      {
        id: Date.now(),
        ...form,
        pieces: validPieces
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

  function addClosetItemToForm(item) {
    const newPiece = {
      name: item.nome,
      category: item.categoria,
      colors: item.cores || [item.corHex],
      tempColor: item.corHex || "#ffffff",
    };

    const hasEmptyPiece = form.pieces.findIndex(p => !p.name.trim());

    if (hasEmptyPiece !== -1) {
      const updated = [...form.pieces];
      updated[hasEmptyPiece] = newPiece;

      setForm({ ...form, pieces: updated });
      setClosedSuggestions(prev => [...prev, hasEmptyPiece]);
      return;
    }

    setForm({
      ...form,
      pieces: [...form.pieces, newPiece],
    });

    setClosedSuggestions(prev => [...prev, form.pieces.length]);
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
    let result = outfits.filter(outfit => {
      const text = JSON.stringify(outfit).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      if (filter === "Favoritos") {
        return matchesSearch && outfit.favorite;
      }

      const matchesFilter = filter === "Todos" || outfit.style === filter;

      return matchesSearch && matchesFilter;
    });

    return result;
  }, [outfits, search, filter]);

  return (
      <div className="app">
        <header className="hero">
          <div>
            <p className="tag">STYLE PLANNER</p>
            <h1>Outfit <span>Organizer</span></h1>
            <p className="subtitle">
              Guarda combinações, planeia looks e organiza as tuas peças de roupa de forma simples.
            </p>
          </div>
          <div className="hero-right">
            <div className="stats">
              <span>{outfits.length}</span>
              <p>outfits guardados</p>
            </div>
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
                  <div className="pieceNameArea">
                    <input
                      placeholder="Nome da peça"
                      value={piece.name}
                      onChange={e => {
                        updatePiece(index, "name", e.target.value);
                        setClosedSuggestions(closedSuggestions.filter(i => i !== index));
                      }}
                    />

                    {piece.name.trim() && !closedSuggestions.includes(index) && (
                      <div className="suggestionsBox">
                        {closetItems
                          .filter(item =>
                            item.nome.toLowerCase().includes(piece.name.toLowerCase())
                          )
                          .slice(0, 5)
                          .map(item => (
                            <button
                              type="button"
                              className="suggestionItem"
                              key={item.id}
                              onClick={() => applyClosetSuggestion(index, item)}
                            >
                              <div className="suggestionColors">
                                {(item.cores || [item.corHex]).map((color, i) => (
                                  <span
                                    key={i}
                                    className="suggestionColor"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>

                              <span>{item.nome}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

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

              <button className={`primary ${saved ? "savedBtn" : ""}`}>
                {saved ? "Guardado ✅" : editingId ? "Atualizar outfit" : "Guardar outfit"}
              </button>
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
                <option>Favoritos</option>
                {outfitStyles.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="closetBox">
              <div className="closetHeader">
                <div>
                  <p className="tag">CLOSET</p>
                  <h2>Armário pessoal</h2>
                </div>

                <span>{filteredCloset.length} peças</span>
              </div>

              <div className="closetFilters">
                {["Todos", ...categories].map((cat) => (
                  <button
                    key={cat}
                    className={`filterChip ${closetFilter === cat ? "active" : ""}`}
                    onClick={() => setClosetFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {closetItems.length === 0 ? (
                <p className="closetEmpty">As peças aparecem aqui quando guardares outfits.</p>
              ) : (
                <div className="closetGrid">
                  {filteredCloset.map((item) => (
                    <div 
                      className="closetItem" 
                      key={item.id}
                      onClick={() => addClosetItemToForm(item)}
                    >
                      <div className="closetColors">
                        {(item.cores || [item.corHex]).map((color, i) => (
                          <span
                            key={i}
                            className="closetColor"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div className="closetInfo">
                        <strong>{item.nome}</strong>
                        <p>{item.categoria} · usada {item.vezesUsada}x</p>
                      </div>

                      <div className="closetActions">
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            editClosetItem(item)
                          }}
                        >
                          ✏️
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClosetItem(item.id)
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cards">
              {filteredOutfits.length === 0 && (
                <div className="empty">
                  <div className="emptyIcon">👕</div>
                  <h2 className="ainda-title">Ainda não tens outfits guardados</h2>
                  <p>Cria o teu primeiro conjunto</p>
                </div>
              )}

              {filteredOutfits.map(outfit => (
                <article 
                  className={`card ${deletingId === outfit.id ? "deleting" : ""} ${draggedId === outfit.id ? "dragged" : ""}`}
                  key={outfit.id}
                  draggable
                  onDragStart={() => setDraggedId(outfit.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => moveOutfit(outfit.id)}
                  onDragEnd={() => setDraggedId(null)}  
                >
                  <button
                    className={`favoriteBtn ${outfit.favorite ? "active" : ""}`}
                    onClick={() => toggleFavorite(outfit.id)}
                  >
                    {outfit.favorite ? "❤️" : "🤍"}
                  </button>
                  {outfit.image ? (
                    <img src={outfit.image} alt={outfit.title} />
                  ) : (
                    <div className="placeholder">OUTFIT</div>
                  )}

                  <div className="cardBody">
                    <div className="cardTop">
                      <div>
                        <h2>{outfit.title}</h2>
                        <p>{outfit.function === "Outro" ? outfit.customFunction : outfit.function}</p>
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
                    <div className="actions">
                      <button 
                        className="edit"
                        onClick={() => editOutfit(outfit)}
                      >
                        ✏️ Editar
                      </button>

                      <button 
                        className="delete"
                        onClick={() => deleteOutfit(outfit.id)}
                      >
                        🗑️ Apagar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>  
  );
}

