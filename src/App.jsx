import "./App.css";
import { useEffect, useMemo, useState } from "react";

const categories = [
  "T-shirt", "Camisa", "Polo", "Sweatshirt", "Casaco", "Zip-Up",
  "Calças", "Calções", "Calçado", "Relógio",
  "Headwear", "Acessório"
];

const closetFilters = ["Todos", ...categories];

const outfitStyles = [
  "Casual",
  "Formal",
  "Streetwear",
  "Smart Casual",
  "Desportivo",
  "Minimalista",
  "Outro"
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

const RECENT_OUTFIT_DAYS = 7;

function CustomSelect({ value, options, onChange, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`customSelect ${open ? "open" : ""} ${className}`}
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="customSelectButton"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{value}</span>
        <span className="customSelectArrow">⌄</span>
      </button>

      {open && (
        <div className="customSelectMenu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`customSelectOption ${value === option ? "selected" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span>{option}</span>

              {value === option && (
                <span className="customSelectCheck">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [outfits, setOutfits] = useState(() => {
    const savedOutfits = JSON.parse(localStorage.getItem("outfits-masculinos")) || [];

    return savedOutfits.map(outfit => ({
      ...outfit,
      pieces: (outfit.pieces || []).map(piece => ({
        ...piece,
        unavailable: piece.unavailable ?? false
      }))
    }));
  });
  const [saveStatus, setSaveStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [closedSuggestions, setClosedSuggestions] = useState([]);
  const [closetFilter, setClosetFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState("looks");
  const [openPiecesOutfits, setOpenPiecesOutfits] = useState([]);
  const [showCloset, setShowCloset] = useState(false);
  const [laundryMode, setLaundryMode] = useState(false);
  const [previewClosetItem, setPreviewClosetItem] = useState(null);
  const [usingTodayOutfit, setUsingTodayOutfit] = useState(null);
  const [todayLaundryPieces, setTodayLaundryPieces] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  const [suggestedOutfit, setSuggestedOutfit] = useState(null);
  const [outfitSuggestionNotice, setOutfitSuggestionNotice] = useState("");
  const [notesOutfit, setNotesOutfit] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [outfitHistory, setOutfitHistory] = useState(() => {
    const saved = localStorage.getItem("outfit-history");
    return saved ? JSON.parse(saved) : [];
  });

  const [editingClosetItem, setEditingClosetItem] = useState(null);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("user-profile");

    return saved
      ? JSON.parse(saved)
      : {
          name: "",
          username: "",
          bio: "",
          avatar: "",
        };
  });

  const [profileSaved, setProfileSaved] = useState(false);

  const [editClosetForm, setEditClosetForm] = useState({
    name: "",
    category: "T-shirt",
    colors: [],
    tempColor: "#000000",
    image: "",
    favorite: false,
    unavailable: false,
  });

  const [manualClosetItems, setManualClosetItems] = useState(() => {
    const saved = localStorage.getItem("manual-closet-items");
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddClosetItem, setShowAddClosetItem] = useState(false);

  const [newClosetItem, setNewClosetItem] = useState({
    name: "",
    category: "T-shirt",
    colors: [],
    tempColor: "#000000",
    image: "",
    favorite: false,
    unavailable: false,
  });
  
  const computedClosetItems = useMemo(() => {
    const allPiecesFromOutfits = outfits.flatMap((outfit) =>
      (outfit.pieces || []).map((piece) => ({
        ...piece,
        id: piece.id || `${piece.name}-${piece.category}`,
        source: "outfit",
        closetKey: `${piece.name.trim().toLowerCase()}-${piece.category}`,
        unavailable: piece.unavailable ?? false,
        favorite: piece.favorite ?? false,
      }))
    );

    const unique = [];
    const seen = new Set();

    allPiecesFromOutfits.forEach((item) => {
      if (!seen.has(item.closetKey)) {
        seen.add(item.closetKey);
        unique.push(item);
      }
    });

    const manualItems = manualClosetItems.map((item) => ({
      ...item,
      source: "manual",
      closetKey: item.id,
      unavailable: item.unavailable ?? false,
      favorite: item.favorite ?? false,
    }));

    const combined = [...unique, ...manualItems];

    combined.sort((a, b) => {
      if (a.unavailable !== b.unavailable) {
        return a.unavailable ? 1 : -1;
      }

      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }

      return 0;
    });

    return combined;
  }, [outfits, manualClosetItems]);

  useEffect(() => {
    localStorage.setItem("manual-closet-items", JSON.stringify(manualClosetItems));
  }, [manualClosetItems]);

  function addManualClosetItem() {
    if (!newClosetItem.name.trim()) return;

    const item = {
      id: crypto.randomUUID(),
      name: newClosetItem.name.trim(),
      category: newClosetItem.category,
      colors: newClosetItem.colors.length > 0 
        ? newClosetItem.colors 
        : [newClosetItem.tempColor],
      image: newClosetItem.image,
      favorite: false,
      unavailable: newClosetItem.unavailable,
    };

    setManualClosetItems((prev) => [...prev, item]);

    setNewClosetItem({
      name: "",
      category: "T-shirt",
      colors: [],
      tempColor: "#000000",
      image: "",
      favorite: false,
      unavailable: false,
    });

    setShowAddClosetItem(false);
  }

  const laundryClosetCount = computedClosetItems.filter(
    (item) => item.unavailable
  ).length;

  const closetFilterOptions = [
    {
      value: "Todos",
      label: "Todos",
      count: computedClosetItems.length,
    },
    {
      value: "Favoritos",
      label: "Favoritos",
      count: computedClosetItems.filter((item) => item.favorite).length,
    },
    {
      value: "Para lavar",
      label: "Para lavar",
      icon: "🧺",
      count: laundryClosetCount,
    },
    ...categories.map((category) => {
      const categoryItems = computedClosetItems.filter(
        (item) => item.category === category
      );

      return {
        value: category,
        label: category,
        count: categoryItems.length,
        laundryCount: categoryItems.filter((item) => item.unavailable).length,
        showLaundryBadge: true,
      };
    }),
  ];

  const filteredCloset = computedClosetItems.filter((item) => {
    if (closetFilter === "Todos") return true;

    if (closetFilter === "Favoritos") {
      return item.favorite;
    }

    if (closetFilter === "Para lavar") {
      return item.unavailable;
    }

    return item.category === closetFilter;
  });


  const [form, setForm] = useState({
    title: "",
    style: "Casual",
    customStyle: "",
    function: "Universidade",
    customFunction: "",
    image: "",
    pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff", image: "", unavailable: false }]
  });

  useEffect(() => {
    localStorage.setItem("outfits-masculinos", JSON.stringify(outfits));
  }, [outfits]);

  useEffect(() => {
    localStorage.setItem("outfit-history", JSON.stringify(outfitHistory));
  }, [outfitHistory]);

  useEffect(() => {
    localStorage.setItem("user-profile", JSON.stringify(profile));
  }, [profile]);

  function addPiece() {
    setForm({
      ...form,
      pieces: [
        ...form.pieces,
        { name: "", category: "T-shirt", colors: [], tempColor: "#ffffff", image: "", unavailable: false }]
    });
  }

  function editClosetItem(item) {
    setEditingClosetItem(item);

    setEditClosetForm({
      name: item.name || "",
      category: item.category || "T-shirt",
      colors: item.colors?.length ? item.colors : [item.tempColor || "#000000"],
      tempColor: item.tempColor || item.colors?.[0] || "#000000",
      image: item.image || "",
      favorite: item.favorite ?? false,
      unavailable: item.unavailable ?? false,
    });
  }

  function saveEditedClosetItem() {
    if (!editingClosetItem || !editClosetForm.name.trim()) return;

    const editedItem = {
      name: editClosetForm.name.trim(),
      category: editClosetForm.category,
      colors:
        editClosetForm.colors.length > 0
          ? editClosetForm.colors
          : [editClosetForm.tempColor],
      tempColor: editClosetForm.tempColor,
      image: editClosetForm.image,
      favorite: editClosetForm.favorite,
      unavailable: editClosetForm.unavailable,
    };

    const isManualItem = editingClosetItem.source === "manual";

    if (isManualItem) {
      setManualClosetItems((prev) =>
        prev.map((manualItem) =>
          manualItem.id === editingClosetItem.id
            ? { ...manualItem, ...editedItem }
            : manualItem
        )
      );
    } else {
      const updatedOutfits = outfits.map((outfit) => ({
        ...outfit,
        pieces: (outfit.pieces || []).map((piece) =>
          piece.name === editingClosetItem.name &&
          piece.category === editingClosetItem.category
            ? { ...piece, ...editedItem }
            : piece
        ),
      }));

      setOutfits(updatedOutfits);
      localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
    }

    setEditingClosetItem(null);
  }

  function handleEditClosetImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setEditClosetForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  function addEditClosetColor() {
    setEditClosetForm((prev) => ({
      ...prev,
      colors: [...prev.colors, prev.tempColor],
    }));
  }

  function removeEditClosetColor(indexToRemove) {
    setEditClosetForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, index) => index !== indexToRemove),
    }));
  }

  function deleteClosetItem(item) {
    const isManualItem = manualClosetItems.some(
      (manualItem) => manualItem.id === item.id
    );

    if (isManualItem) {
      setManualClosetItems((prev) =>
        prev.filter((manualItem) => manualItem.id !== item.id)
      );

      return;
    }

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,
      pieces: (outfit.pieces || []).filter(
        (piece) =>
          !(piece.name === item.name && piece.category === item.category)
      ),
    }));

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
  }

  function applyClosetSuggestion(pieceIndex, item) {
    const updated = [...form.pieces];

    updated[pieceIndex] = {
      ...updated[pieceIndex],
      name: item.name,
      category: item.category,
      colors: item.colors || [item.tempColor || "#ffffff"],
      tempColor: item.tempColor || "#ffffff",
    };

    setForm({ ...form, pieces: updated });
    setClosedSuggestions([...closedSuggestions, pieceIndex]);
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
    setForm({
      ...outfit,
      pieces:
        outfit.pieces?.length > 0
          ? outfit.pieces
          : [
              {
                name: "",
                category: "T-shirt",
                colors: [],
                tempColor: "#ffffff",
                image: "",
                unavailable: false,
              },
            ],
    });

    setEditingId(outfit.id);

    setClosedSuggestions(
      (outfit.pieces || []).map((_, index) => index)
    );

    setActiveTab("create");
    setShowCloset(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function toggleOutfitPieces(outfitId) {
    setOpenPiecesOutfits((prev) =>
      prev.includes(outfitId)
        ? prev.filter((id) => id !== outfitId)
        : [...prev, outfitId]
    );
  }

  function isOutfitPiecesOpen(outfitId) {
    return openPiecesOutfits.includes(outfitId);
  }

  function openUseToday(outfit) {
    setUsingTodayOutfit(outfit);
    setTodayLaundryPieces([]);
  }

  function toggleTodayLaundryPiece(piece) {
    const pieceKey = getPieceKey(piece);

    setTodayLaundryPieces((prev) =>
      prev.includes(pieceKey)
        ? prev.filter((key) => key !== pieceKey)
        : [...prev, pieceKey]
    );
  }

  function selectAllTodayLaundryPieces() {
    if (!usingTodayOutfit) return;

    setTodayLaundryPieces(
      (usingTodayOutfit.pieces || []).map((piece) => getPieceKey(piece))
    );
  }

  function clearTodayLaundryPieces() {
    setTodayLaundryPieces([]);
  }

  function confirmUseToday() {
    if (!usingTodayOutfit) return;

    const selectedPieces = new Set(todayLaundryPieces);
    const usedAt = new Date().toISOString();

    const laundryPiecesNames = (usingTodayOutfit.pieces || [])
      .filter((piece) => selectedPieces.has(getPieceKey(piece)))
      .map((piece) => ({
        name: piece.name,
        category: piece.category,
      }));

    const historyEntry = {
      id: crypto.randomUUID(),
      date: usedAt,
      outfitId: usingTodayOutfit.id,
      outfitTitle: usingTodayOutfit.title,
      outfitStyle: getOutfitStyleLabel(usingTodayOutfit),
      outfitFunction:
        usingTodayOutfit.function === "Outro"
          ? usingTodayOutfit.customFunction
          : usingTodayOutfit.function,
      laundryPieces: laundryPiecesNames,
    };

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,

      lastUsedAt:
        outfit.id === usingTodayOutfit.id
          ? usedAt
          : outfit.lastUsedAt,

      pieces: (outfit.pieces || []).map((piece) =>
        selectedPieces.has(getPieceKey(piece))
          ? { ...piece, unavailable: true }
          : piece
      ),
    }));

    setOutfits(updatedOutfits);
    setOutfitHistory((prev) => [historyEntry, ...prev]);

    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));

    setUsingTodayOutfit(null);
    setTodayLaundryPieces([]);
  }

  function getDaysSince(dateString) {
    if (!dateString) return null;

    const usedDate = new Date(dateString);
    const today = new Date();

    const usedDay = new Date(
      usedDate.getFullYear(),
      usedDate.getMonth(),
      usedDate.getDate()
    );

    const currentDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffTime = currentDay - usedDay;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  function isRecentlyUsed(outfit) {
    const daysSince = getDaysSince(outfit.lastUsedAt);

    return daysSince !== null && daysSince <= RECENT_OUTFIT_DAYS;
  }

  function formatLastUsed(dateString) {
    const daysSince = getDaysSince(dateString);

    if (daysSince === null) return "";

    if (daysSince === 0) return "Usado hoje";
    if (daysSince === 1) return "Usado ontem";

    if (daysSince <= RECENT_OUTFIT_DAYS) {
      return `Usado há ${daysSince} dias`;
    }

    return `Última vez: ${new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
    })}`;
  }

  function toggleFavorite(id) {
  setOutfits(outfits.map(outfit =>
    outfit.id === id
      ? { ...outfit, favorite: !outfit.favorite }
      : outfit
  ));
  }

  function toggleClosetFavorite(item) {
    const isManualItem = manualClosetItems.some(
      (manualItem) => manualItem.id === item.id
    );

    if (isManualItem) {
      setManualClosetItems((prev) =>
        prev.map((manualItem) =>
          manualItem.id === item.id
            ? { ...manualItem, favorite: !manualItem.favorite }
            : manualItem
        )
      );

      return;
    }

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,
      pieces: (outfit.pieces || []).map((piece) =>
        piece.name === item.name && piece.category === item.category
          ? { ...piece, favorite: !piece.favorite }
          : piece
      ),
    }));

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
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

  const toggleUnavailable = (item) => {
    if (item.source === "manual") {
      setManualClosetItems((prev) =>
        prev.map((manualItem) =>
          manualItem.id === item.id
            ? { ...manualItem, unavailable: !manualItem.unavailable }
            : manualItem
        )
      );

      return;
    }

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,
      pieces: (outfit.pieces || []).map((piece) =>
        piece.name === item.name && piece.category === item.category
          ? { ...piece, unavailable: !piece.unavailable }
          : piece
      ),
    }));

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
  };

  function handleClosetItemClick(item) {
    if (laundryMode) {
      toggleUnavailable(item);
      return;
    }

    if (item.image) {
      setPreviewClosetItem(item);
      return;
    }

    addClosetItemToForm(item);
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
      setSaveStatus("updated");
      setTimeout(() => setSaveStatus(null), 1400);

      setOutfits(outfits.map(outfits => outfits.id === editingId ? { ...form, id: editingId, pieces: form.pieces.filter(p => p.name.trim()) } : outfits
    ));
      setEditingId(null);

      setForm({
        title: "",
        function: "Universidade",
        customFunction: "",
        style: "Casual",
        customStyle: "",
        image: "",
        pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff", image: "", unavailable: false }]
      });

      setActiveTab("looks");
      setShowCloset(false);

      return;
    }

    setSaveStatus("saved");

    setTimeout(() => setSaveStatus(null), 1400);

    const validPieces = form.pieces.filter(p => p.name.trim());

    const updatedOutfits = [
      {
        id: Date.now(),
        ...form,
        pieces: validPieces
      },
      ...outfits
    ];

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));

    setForm({
      title: "",
      function: "Universidade",
      customFunction: "",
      style: "Casual",
      customStyle: "",
      image: "",
      pieces: [{ name: "", category: "T-shirt", colors: [], tempColor: "#ffffff", image: "", unavailable: false }]
    });
  }

  function addClosetItemToForm(item) {
    const newPiece = {
      name: item.name,
      category: item.category,
      colors: item.colors || [item.tempColor || "#ffffff"],
      tempColor: item.tempColor || "#ffffff",
      image: item.image || "",
      unavailable: false
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

  function handleClosetImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setNewClosetItem((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  function handlePieceImage(e, index) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updated = [...form.pieces];

      updated[index] = {
        ...updated[index],
        image: reader.result,
      };

      setForm({ ...form, pieces: updated });
    };

    reader.readAsDataURL(file);
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

      if (filter === "Não usados recentemente") {
        return matchesSearch && !isRecentlyUsed(outfit);
      }

      const matchesFilter = filter === "Todos" || outfit.style === filter;

      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (a.favorite === b.favorite) return 0;
      return a.favorite ? -1 : 1;
    });

    return result;
  }, [outfits, search, filter]);

  const unavailablePieceKeys = useMemo(() => {
    return new Set(
      computedClosetItems
        .filter((item) => item.unavailable)
        .map((item) => `${(item.name || "").trim().toLowerCase()}-${item.category}`)
    );
  }, [computedClosetItems]);

  function getPieceKey(piece) {
    return `${(piece.name || "").trim().toLowerCase()}-${piece.category}`;
  }

  function isPieceUnavailable(piece) {
    return unavailablePieceKeys.has(getPieceKey(piece));
  }

  function getUnavailablePiecesCount(outfit) {
    return (outfit.pieces || []).filter((piece) =>
      isPieceUnavailable(piece)
    ).length;
  }

  function handleTabChange(tab) {
    setActiveTab(tab);

    if (tab !== "create") {
      setShowCloset(false);
    }

    if (tab === "closet") {
      setClosetFilter("Todos");
    }

    if (tab === "laundry") {
      setClosetFilter("Para lavar");
    }

    if (tab === "history") {
      setSelectedHistoryDate(null);
    }
  }

  const showOutfitsArea = activeTab === "looks";

  const showClosetArea =
    activeTab === "closet" ||
    (activeTab === "create" && showCloset);
  
  const showHistoryArea = activeTab === "history";
  const showSettingsArea = activeTab === "settings";
  const showLaundryArea = activeTab === "laundry";

  const laundryItems = computedClosetItems.filter((item) => item.unavailable);
  const favoriteOutfitsCount = outfits.filter((outfit) => outfit.favorite).length;

  function getHistoryDateKey(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatHistoryDate(dateKey) {
    const [year, month, day] = dateKey.split("-");

    return new Date(year, month - 1, day).toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatHistoryTime(dateString) {
    return new Date(dateString).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const historyByDate = useMemo(() => {
    const grouped = {};

    outfitHistory.forEach((entry) => {
      const dateKey = getHistoryDateKey(entry.date);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(entry);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, entries]) => ({
        date,
        entries,
      }));
  }, [outfitHistory]);

  const selectedHistoryGroup = historyByDate.find(
    (group) => group.date === selectedHistoryDate
  );

  function getRandomItem(items) {
    if (!items || items.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  function chooseOutfitForUser(excludeId = null) {
    const availableOutfits = outfits.filter((outfit) => {
      const isExcluded = outfit.id === excludeId;
      const hasUnavailablePieces = getUnavailablePiecesCount(outfit) > 0;

      return !isExcluded && !hasUnavailablePieces;
    });

    const notRecentlyUsed = availableOutfits.filter(
      (outfit) => !isRecentlyUsed(outfit)
    );

    if (notRecentlyUsed.length > 0) {
      setSuggestedOutfit(getRandomItem(notRecentlyUsed));
      setOutfitSuggestionNotice("");
      return;
    }

    if (availableOutfits.length > 0) {
      setSuggestedOutfit(getRandomItem(availableOutfits));
      setOutfitSuggestionNotice(
        "Todos os outfits disponíveis foram usados recentemente, por isso escolhi um na mesma."
      );
      return;
    }

    const fallbackOutfits = outfits.filter((outfit) => outfit.id !== excludeId);

    if (fallbackOutfits.length > 0) {
      setSuggestedOutfit(getRandomItem(fallbackOutfits));
      setOutfitSuggestionNotice(
        "Não encontrei outfits totalmente disponíveis. Esta sugestão pode ter peças para lavar."
      );
      return;
    }

    setSuggestedOutfit(null);
    setOutfitSuggestionNotice("Ainda não tens outfits suficientes para sugerir.");
  }

  function suggestOutfit() {
    chooseOutfitForUser();
  }

  function suggestAnotherOutfit() {
    chooseOutfitForUser(suggestedOutfit?.id);
  }

  function useSuggestedOutfit() {
    if (!suggestedOutfit) return;

    openUseToday(suggestedOutfit);
    setSuggestedOutfit(null);
  }

  function markClosetItemAsWashed(item) {
    if (item.source === "manual") {
      setManualClosetItems((prev) =>
        prev.map((manualItem) =>
          manualItem.id === item.id
            ? { ...manualItem, unavailable: false }
            : manualItem
        )
      );

      return;
    }

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,
      pieces: (outfit.pieces || []).map((piece) =>
        piece.name === item.name && piece.category === item.category
          ? { ...piece, unavailable: false }
          : piece
      ),
    }));

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
  }

  function markAllLaundryAsWashed() {
    setManualClosetItems((prev) =>
      prev.map((item) => ({
        ...item,
        unavailable: false,
      }))
    );

    const updatedOutfits = outfits.map((outfit) => ({
      ...outfit,
      pieces: (outfit.pieces || []).map((piece) => ({
        ...piece,
        unavailable: false,
      })),
    }));

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));
  }

  function openOutfitNotes(outfit) {
    setNotesOutfit(outfit);
    setNoteDraft(outfit.notes || "");
  }

  function saveOutfitNotes() {
    if (!notesOutfit) return;

    const updatedOutfits = outfits.map((outfit) =>
      outfit.id === notesOutfit.id
        ? { ...outfit, notes: noteDraft }
        : outfit
    );

    setOutfits(updatedOutfits);
    localStorage.setItem("outfits-masculinos", JSON.stringify(updatedOutfits));

    setNotesOutfit(null);
    setNoteDraft("");
  }

  function handleProfileAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  function saveProfileSettings() {
    localStorage.setItem("user-profile", JSON.stringify(profile));

    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 1600);
  }

  function getOutfitStyleLabel(outfit) {
    return outfit.style === "Outro"
      ? outfit.customStyle || "Outro"
      : outfit.style;
  }

  

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

        <nav className="appTabs">
          <button
            type="button"
            className={`appTab ${activeTab === "looks" ? "active" : ""}`}
            onClick={() => handleTabChange("looks")}
          >
            <span>Looks</span>
          </button>

          <button
            type="button"
            className={`appTab ${activeTab === "create" ? "active" : ""}`}
            onClick={() => handleTabChange("create")}
          >
            <span>Criar look</span>
          </button>

          <button
            type="button"
            className={`appTab ${activeTab === "closet" ? "active" : ""}`}
            onClick={() => handleTabChange("closet")}
          >
            <span>Closet</span>
          </button>

          <button
            type="button"
            className={`appTab ${activeTab === "laundry" ? "active" : ""}`}
            onClick={() => handleTabChange("laundry")}
          >
            <span>🧺 Lavandaria</span>
          </button>

          <button
            type="button"
            className={`appTab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => handleTabChange("history")}
          >
            <span>📅 Histórico</span>
          </button>

          <button
            type="button"
            className={`appTab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => handleTabChange("settings")}
          >
            <span>⚙️ Definições</span>
          </button>
        </nav>

        <main
          className={`layout ${
            activeTab !== "create"
              ? "singleColumnLayout"
              : showCloset
              ? ""
              : "formOnlyLayout"
          }`}
        >
          {activeTab === "create" && (
            <section className="panel">
              <div className="sectionHeader formSectionHeader">
                <div className="sectionMiniRow">
                  <span className="sectionNumber">01</span>
                  <span className="sectionKicker">LOOK BUILDER</span>
                </div>

                <h2>Criar look</h2>

                <p>Define o outfit, adiciona peças e guarda a combinação.</p>
              </div>

              <button
                type="button"
                className={`builderClosetBtn ${showCloset ? "active" : ""}`}
                onClick={() => setShowCloset((prev) => !prev)}
              >
                {showCloset ? "Fechar closet" : "Abrir closet para escolher peças"}
              </button>

              <form onSubmit={addOutfit}>
                <input
                  placeholder="Nome do outfit"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />

                <div className="grid2">
                  <CustomSelect
                    value={form.style}
                    options={outfitStyles}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        style: value,
                        customStyle: value === "Outro" ? form.customStyle : "",
                      })
                    }
                  />

                  <CustomSelect
                    value={form.function}
                    options={outfitFunctions}
                    onChange={(value) => setForm({ ...form, function: value })}
                  />
                </div>

                {form.style === "Outro" && (
                  <input
                    placeholder="Escreve o estilo do look"
                    value={form.customStyle}
                    onChange={(e) =>
                      setForm({ ...form, customStyle: e.target.value })
                    }
                  />
                )}

                {form.function === "Outro" && (
                  <input
                    placeholder="Escreve para que é o outfit"
                    value={form.customFunction}
                    onChange={e => setForm({ ...form, customFunction: e.target.value })}
                  />
                )}

                <label className={`upload ${form.image ? "uploadSelected" : ""}`}>
                  <input type="file" accept="image/*" onChange={handleImage} />

                  <span className="uploadIcon">
                    <span className="uploadIconInner">
                      {form.image ? "✓" : "📷"}
                    </span>
                  </span>

                  <span className="uploadText">
                    <strong>
                      {form.image ? "Fotografia adicionada" : "Adicionar fotografia"}
                    </strong>

                    <small>
                      {form.image ? "Clica para trocar a imagem" : "Escolhe uma imagem para este look"}
                    </small>
                  </span>
                </label>

                {form.image && <img className="preview" src={form.image} alt="Preview" />}

                <h3>Composição do look</h3>

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

                      {piece.name.trim() &&
                        filteredCloset.filter(item =>
                          item.name.toLowerCase().includes(piece.name.toLowerCase())
                        ).length > 0 &&
                        !closedSuggestions.includes(index) && (
                        <div className="suggestionsBox">
                          {filteredCloset
                            .filter(item =>
                              item.name.toLowerCase().includes(piece.name.toLowerCase())
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
                                  {(item.colors || [item.tempColor || "#ffffff"]).map((color, i) => (
                                    <span
                                      key={i}
                                      className="suggestionColor"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>

                                <span>{item.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                    <div className="pieceControls">
                      <div className="controlGroup">
                        <span className="controlLabel">Categoria</span>

                        <CustomSelect
                          value={piece.category}
                          options={categories}
                          onChange={(value) => updatePiece(index, "category", value)}
                        />
                      </div>

                      <div className="controlGroup colorGroup">
                        <span className="controlLabel">Cor</span>

                        <div className="colorPickerRow">
                          <label className="colorPickerButton" title="Escolher cor">
                            <input
                              type="color"
                              value={piece.tempColor || "#ffffff"}
                              onChange={(e) => updatePiece(index, "tempColor", e.target.value)}
                              className="colorPickerNative"
                            />

                            <span
                              className="colorPickerDot"
                              style={{ backgroundColor: piece.tempColor || "#ffffff" }}
                            />
                          </label>

                          <button
                            type="button"
                            className="addColorBtn"
                            onClick={() => addColorToPiece(index)}
                          >
                            + Cor
                          </button>
                        </div>

                        {piece.colors?.length > 0 && (
                          <div className="pieceSelectedColors">
                            {piece.colors.map((color, colorIndex) => (
                              <button
                                key={`${color}-${colorIndex}`}
                                type="button"
                                className="pieceSelectedColor"
                                style={{ backgroundColor: color }}
                                onClick={() => removeColorFromPiece(index, colorIndex)}
                                title="Remover cor"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="controlGroup">
                        <span className="controlLabel">Foto</span>

                        <label className="pieceImageUpload">
                          + Foto

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePieceImage(e, index)}
                          />
                        </label>
                      </div>
                    </div>
                    {form.pieces.length > 1 && (
                      <button
                        type="button"
                        className="deleteSmall"
                        onClick={() => removePiece(index)}
                      >
                        × Remover
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" className="secondary" onClick={addPiece}>
                  + Adicionar peça
                </button>

                <button className={`primary ${saveStatus ? "savedBtn" : ""}`}>
                  {saveStatus === "saved"
                  ? "Guardado ✅"
                  : saveStatus === "updated"
                  ? "Atualizado ✅"
                  : editingId
                  ? "Atualizar look"
                  : "Guardar look"}               
                </button>
              </form>
            </section>
          )}

          {(showOutfitsArea || showClosetArea || showLaundryArea || showHistoryArea || showSettingsArea) && (
            <section className="content">
              {showOutfitsArea && (
                <div className="toolbar looksToolbar">
                  <input
                    placeholder="Pesquisar por peça, cor, estilo..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />

                  <CustomSelect
                    value={filter === "Favoritos" ? "Todos" : filter}
                    options={["Todos", "Não usados recentemente", ...outfitStyles]}
                    onChange={(value) => setFilter(value)}
                  />

                  <button
                    type="button"
                    className="suggestOutfitBtn"
                    onClick={suggestOutfit}
                  >
                    ✨ Escolher por mim
                  </button>
                </div>
              )}

              {showOutfitsArea && favoriteOutfitsCount > 0 && (
                <div className="favoritesOverview">
                  <div>
                    <span>❤️ Favoritos</span>
                    <strong>
                      {favoriteOutfitsCount === 1
                        ? "1 outfit favorito"
                        : `${favoriteOutfitsCount} outfits favoritos`}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFilter(filter === "Favoritos" ? "Todos" : "Favoritos")
                    }
                  >
                    {filter === "Favoritos" ? "Ver todos" : "Ver favoritos"}
                  </button>
                </div>
              )}

              {showHistoryArea && (
                <div className="historyPage">
                  <div className="historyPageHeader">
                    <div>
                      <p className="tag">HISTÓRICO</p>
                      <h2>Outfits usados</h2>
                      <span>Consulta o que usaste em cada dia.</span>
                    </div>

                    <strong>{outfitHistory.length} registos</strong>
                  </div>

                  {historyByDate.length === 0 ? (
                    <div className="historyPageEmpty">
                      <div>📅</div>
                      <h3>Ainda não tens histórico</h3>
                      <p>Quando carregares em “Usar hoje”, o registo aparece aqui.</p>
                    </div>
                  ) : (
                    <div className="historyDateGrid">
                      {historyByDate.map((group) => (
                        <button
                          key={group.date}
                          type="button"
                          className="historyDateCard"
                          onClick={() => setSelectedHistoryDate(group.date)}
                        >
                          <div>
                            <strong>{formatHistoryDate(group.date)}</strong>
                            <span>
                              {group.entries.length === 1
                                ? "1 outfit usado"
                                : `${group.entries.length} outfits usados`}
                            </span>
                          </div>

                          <span className="historyDateArrow">›</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showLaundryArea && (
                <div className="laundryPage">
                  <div className="laundryPageHeader">
                    <div>
                      <p className="tag">LAVANDARIA</p>
                      <h2>Peças para lavar</h2>
                      <span>Consulta e marca como lavadas as peças indisponíveis.</span>
                    </div>

                    <strong>
                      {laundryItems.length === 1
                        ? "1 peça"
                        : `${laundryItems.length} peças`}
                    </strong>
                  </div>

                  {laundryItems.length > 0 && (
                    <button
                      type="button"
                      className="markAllWashedBtn"
                      onClick={markAllLaundryAsWashed}
                    >
                      ✓ Marcar tudo como lavado
                    </button>
                  )}

                  {laundryItems.length === 0 ? (
                    <div className="laundryEmpty">
                      <div>🧺</div>
                      <h3>Tudo limpo</h3>
                      <p>Não tens peças marcadas para lavar.</p>
                    </div>
                  ) : (
                    <div className="laundryGrid">
                      {laundryItems.map((item) => (
                        <div
                          key={item.closetKey || item.id}
                          className="laundryItemCard"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="laundryItemImage"
                            />
                          ) : (
                            <div className="laundryItemPlaceholder">
                              🧺
                            </div>
                          )}

                          <div className="laundryItemInfo">
                            <div>
                              <span>{item.category}</span>
                              <h3>{item.name}</h3>
                            </div>

                            <div className="laundryItemColors">
                              {(item.colors || [item.tempColor || "#ffffff"]).map((color, index) => (
                                <span
                                  key={`${color}-${index}`}
                                  className="laundryItemColor"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>

                            <button
                              type="button"
                              className="markWashedBtn"
                              onClick={() => markClosetItemAsWashed(item)}
                            >
                              ✓ Marcar como lavado
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showSettingsArea && (
                <div className="settingsPage">
                  <div className="settingsHeader">
                    <div>
                      <p className="tag">DEFINIÇÕES</p>
                      <h2>Perfil da app</h2>
                      <span>Personaliza a tua conta e prepara o perfil para a futura versão com login.</span>
                    </div>
                  </div>

                  <div className="settingsGrid">
                    <div className="profileCard">
                      <div className="profileAvatarArea">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt="Foto de perfil"
                            className="profileAvatar"
                          />
                        ) : (
                          <div className="profileAvatarPlaceholder">
                            {profile.name?.trim()
                              ? profile.name.trim().charAt(0).toUpperCase()
                              : "👤"}
                          </div>
                        )}

                        <label className="profileAvatarUpload">
                          Alterar foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileAvatar}
                          />
                        </label>
                      </div>

                      <div className="profilePreview">
                        <span>Pré-visualização</span>
                        <h3>{profile.name || "O teu nome"}</h3>
                        <p>{profile.username ? `@${profile.username}` : "@username"}</p>

                        {profile.bio && (
                          <small>{profile.bio}</small>
                        )}
                      </div>
                    </div>

                    <div className="settingsForm">
                      <label>Nome</label>
                      <input
                        type="text"
                        placeholder="O teu nome"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />

                      <label>Nome de utilizador</label>
                      <input
                        type="text"
                        placeholder="ex: vascofits"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            username: e.target.value.replace(/\s/g, "").toLowerCase(),
                          }))
                        }
                      />

                      <label>Bio / nota pessoal</label>
                      <textarea
                        placeholder="Ex: uso esta app para organizar outfits de universidade, saídas e trabalho..."
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                      />

                      <button
                        type="button"
                        className={`saveSettingsBtn ${profileSaved ? "saved" : ""}`}
                        onClick={saveProfileSettings}
                      >
                        {profileSaved ? "Guardado ✅" : "Guardar alterações"}
                      </button>
                    </div>
                  </div>

                  <div className="futureAccountBox">
                    <div>
                      <strong>Conta online em breve</strong>
                      <p>
                        Mais tarde, esta zona vai ligar ao login, sincronização entre dispositivos
                        e dados guardados na cloud.
                      </p>
                    </div>

                    <span>Supabase ready</span>
                  </div>
                </div>
              )}

              {showClosetArea && (
                <div className="closetToggle closetTabActions">
                  <button
                    type="button"
                    className={`laundryButtonInline ${laundryMode ? "active" : ""}`}
                    onClick={() => setLaundryMode(!laundryMode)}
                  >
                    🧺
                  </button>

                  {laundryMode && (
                    <span className="laundryText">Modo Lavandaria Ativo</span>
                  )}
                </div>
              )}

              {showClosetArea && (
                <div className="closetBox">
                  <div className="closetHeader">
                    <div className="sectionHeader closetSectionHeader">
                      <div className="sectionMiniRow">
                        <span className="sectionNumber">02</span>
                        <span className="sectionKicker">CLOSET</span>
                      </div>

                      <h2>Armário pessoal</h2>

                      <p>Consulta, filtra e reutiliza as tuas peças.</p>
                    </div>

                    <div className="closetHeaderActions">
                      <button
                        type="button"
                        className="addClosetBtn"
                        onClick={() => setShowAddClosetItem((prev) => !prev)}
                      >
                        + Nova peça
                      </button>

                      <span className="closetCount">
                        {filteredCloset.length} peças

                        {laundryClosetCount > 0 && (
                          <small>🧺 {laundryClosetCount} para lavar</small>
                        )}
                      </span>
                    </div>
                  </div>

                  {showAddClosetItem && (
                    <div className="addClosetForm">
                      <input
                        type="text"
                        placeholder="Nome da peça"
                        value={newClosetItem.name}
                        onChange={(e) =>
                          setNewClosetItem((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />

                      <CustomSelect
                        value={newClosetItem.category}
                        options={categories}
                        onChange={(value) =>
                          setNewClosetItem((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      />

                      <label className="closetUpload">
                        {newClosetItem.image ? "Imagem escolhida ✅" : "Adicionar imagem"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleClosetImage}
                        />
                      </label>

                      {newClosetItem.image && (
                        <img
                          src={newClosetItem.image}
                          alt="Preview"
                          className="closetPreview"
                        />
                      )}

                      <div className="closetColorPicker">
                        <input
                          type="color"
                          value={newClosetItem.tempColor}
                          onChange={(e) =>
                            setNewClosetItem((prev) => ({
                              ...prev,
                              tempColor: e.target.value,
                            }))
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setNewClosetItem((prev) => ({
                              ...prev,
                              colors: [...prev.colors, prev.tempColor],
                            }))
                          }
                        >
                          Adicionar cor
                        </button>
                      </div>

                      <div className="closetSelectedColors">
                        {newClosetItem.colors.map((color, index) => (
                          <span
                            key={`${color}-${index}`}
                            className="closetColorDot"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className="saveClosetItemBtn"
                        onClick={addManualClosetItem}
                      >
                        Guardar peça
                      </button>
                    </div>
                  )}

                  <div className="closetFilters">
                    {closetFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`filterChip ${closetFilter === option.value ? "active" : ""} ${
                          option.value === "Para lavar" ? "laundryFilterChip" : ""
                        }`}
                        onClick={() => setClosetFilter(option.value)}
                      >
                        <span className="filterChipText">
                          {option.icon && (
                            <span className="filterChipIcon">{option.icon}</span>
                          )}

                          {option.label}
                        </span>

                        {option.count > 0 && (
                          <span className="filterChipCount">{option.count}</span>
                        )}

                        {option.showLaundryBadge && option.laundryCount > 0 && (
                          <span className="filterChipLaundry">
                            🧺 {option.laundryCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {filteredCloset.length === 0 ? (
                    <p className="closetEmpty">
                      {closetFilter === "Para lavar"
                        ? "Não tens peças para lavar."
                        : "As peças aparecem aqui quando guardares outfits."}
                    </p>
                  ) : (
                    <div className="closetGrid">
                      {filteredCloset.map((item) => (
                        <div 
                          className={`closetItem ${item.unavailable ? "unavailable" : ""}`}
                          key={item.closetKey || item.id}
                          onClick={() => {
                            handleClosetItemClick(item);
                          }}
                        >                        
                          <div className="closetSwatches">
                            {(item.colors || [item.tempColor || "#ffffff"]).map((color, i) => (
                              <span
                                key={i}
                                className="closetColor"
                                style={{ backgroundColor: color }}
                              />
                            ))}

                          {item.unavailable && (
                            <span className="laundryBadge">🧺</span>
                          )}

                          </div>
            
                          <div className="closetInfo">
                            <strong>{item.name}</strong>
                            <p>{item.category}</p>
                          </div>

                          {item.image && (
                            <span className="closetPhotoIcon" title="Tem fotografia">
                              📷
                            </span>
                          )}

                          <button
                            type="button"
                            className={`closetFavoriteBtn ${item.favorite ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleClosetFavorite(item);
                            }}
                          >
                            {item.favorite ? "❤️" : "🤍"}
                          </button>
          
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
                                deleteClosetItem(item)
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
              )}

              {showOutfitsArea && (
                <div className="cardsWrapper">
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
                          <div className="placeholder outfitPlaceholder">
                            <div className="outfitPlaceholderIcon">📷</div>

                            <div className="outfitPlaceholderText">
                              <strong>Sem fotografia</strong>
                              <span>Adiciona uma imagem a este look</span>
                            </div>
                          </div>
                        )}

                        <div className="cardBody">
                          <div className="cardTop">
                            <div>
                              <h2>{outfit.title}</h2>
                              <p>{outfit.function === "Outro" ? outfit.customFunction : outfit.function}</p>
                            </div>

                            <div className="cardTopActions">
                              <button
                                type="button"
                                className={`noteIconBtn ${outfit.notes?.trim() ? "hasNote" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOutfitNotes(outfit);
                                }}
                                title={outfit.notes?.trim() ? "Ver nota" : "Adicionar nota"}
                              >
                                📝
                              </button>

                              <span>{getOutfitStyleLabel(outfit)}</span>
                            </div>
                          </div>

                          {outfit.lastUsedAt && (
                            <div className={`lastUsedBadge ${isRecentlyUsed(outfit) ? "recentUseBadge" : ""}`}>
                              <span>{isRecentlyUsed(outfit) ? "⏱️" : "👕"}</span>
                              <strong>{formatLastUsed(outfit.lastUsedAt)}</strong>
                            </div>
                          )}

                          {getUnavailablePiecesCount(outfit) > 0 && (
                            <div className="outfitLaundryBar">
                              <span>🧺</span>
                              <strong>
                                {getUnavailablePiecesCount(outfit) === 1
                                  ? "1 peça deste outfit está para lavar"
                                  : `${getUnavailablePiecesCount(outfit)} peças deste outfit estão para lavar`}
                              </strong>
                            </div>
                          )}

                          <div className="piecesToggleArea">
                            <button
                              type="button"
                              className={`piecesToggle ${isOutfitPiecesOpen(outfit.id) ? "open" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOutfitPieces(outfit.id);
                              }}
                            >
                              <span>
                                {isOutfitPiecesOpen(outfit.id)
                                  ? "Esconder peças"
                                  : `Ver peças (${outfit.pieces.length})`}
                              </span>

                              <span className="piecesToggleArrow">⌄</span>
                            </button>
                          </div>

                          {isOutfitPiecesOpen(outfit.id) && (
                            <div className="piecesList piecesListExpanded">
                              {outfit.pieces.map((p, i) => (
                                <div
                                  className={`pieceTag ${isPieceUnavailable(p) ? "pieceTagLaundry" : ""}`}
                                  key={i}
                                >
                                  <div className="pieceTagHeader">
                                    <span className="pieceCategoryBadge">{p.category}</span>

                                    <span className="savedColors">
                                      {p.colors?.map((color, i) => (
                                        <span
                                          key={i}
                                          className="savedColorDot"
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </span>
                                  </div>

                                  <strong>{p.name}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="actions">
                            <button 
                              className="useToday"
                              onClick={() => openUseToday(outfit)}
                            >
                              👕 Usar hoje
                            </button>

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
                </div>
              )}
            </section>
          )}
        </main>

        {editingClosetItem && (
          <div
            className="editClosetOverlay"
            onClick={() => setEditingClosetItem(null)}
          >
            <div
              className="editClosetModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="editClosetHeader">
                <div>
                  <span>EDITAR PEÇA</span>
                  <h2>{editClosetForm.name || "Nova peça"}</h2>
                </div>

                <button
                  type="button"
                  className="editClosetClose"
                  onClick={() => setEditingClosetItem(null)}
                >
                  ×
                </button>
              </div>

              <label className="editClosetLabel">Nome da peça</label>
              <input
                className="editClosetInput"
                type="text"
                value={editClosetForm.name}
                onChange={(e) =>
                  setEditClosetForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <label className="editClosetLabel">Categoria</label>
              <CustomSelect
                value={editClosetForm.category}
                options={categories}
                onChange={(value) =>
                  setEditClosetForm((prev) => ({
                    ...prev,
                    category: value,
                  }))
                }
              />

              <label className="editClosetLabel">Cores</label>

              <div className="editClosetColorRow">
                <input
                  type="color"
                  value={editClosetForm.tempColor}
                  onChange={(e) =>
                    setEditClosetForm((prev) => ({
                      ...prev,
                      tempColor: e.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  className="editClosetAddColor"
                  onClick={addEditClosetColor}
                >
                  + Adicionar cor
                </button>
              </div>

              <div className="editClosetColors">
                {editClosetForm.colors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    className="editClosetColorDot"
                    style={{ backgroundColor: color }}
                    onClick={() => removeEditClosetColor(index)}
                    title="Remover cor"
                  />
                ))}
              </div>

              <label className="editClosetLabel">Fotografia</label>

              <label className="editClosetUpload">
                {editClosetForm.image ? "Trocar fotografia" : "Adicionar fotografia"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditClosetImage}
                />
              </label>

              {editClosetForm.image && (
                <>
                  <img
                    src={editClosetForm.image}
                    alt="Preview da peça"
                    className="editClosetPreview"
                  />

                  <button
                    type="button"
                    className="editClosetRemovePhoto"
                    onClick={() =>
                      setEditClosetForm((prev) => ({
                        ...prev,
                        image: "",
                      }))
                    }
                  >
                    Remover fotografia
                  </button>
                </>
              )}

              <div className="editClosetToggles">
                <button
                  type="button"
                  className={`editClosetToggle ${editClosetForm.favorite ? "active" : ""}`}
                  onClick={() =>
                    setEditClosetForm((prev) => ({
                      ...prev,
                      favorite: !prev.favorite,
                    }))
                  }
                >
                  {editClosetForm.favorite ? "❤️ Favorita" : "🤍 Favorita"}
                </button>

                <button
                  type="button"
                  className={`editClosetToggle ${editClosetForm.unavailable ? "active" : ""}`}
                  onClick={() =>
                    setEditClosetForm((prev) => ({
                      ...prev,
                      unavailable: !prev.unavailable,
                    }))
                  }
                >
                  {editClosetForm.unavailable ? "🧺 Para lavar" : "🧺 Disponível"}
                </button>
              </div>

              <div className="editClosetActionsBottom">
                <button
                  type="button"
                  className="editClosetCancel"
                  onClick={() => setEditingClosetItem(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="editClosetSave"
                  onClick={saveEditedClosetItem}
                >
                  Guardar alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedHistoryGroup && (
          <div
            className="historyDayOverlay"
            onClick={() => setSelectedHistoryDate(null)}
          >
            <div
              className="historyDayModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="historyDayHeader">
                <div>
                  <span>HISTÓRICO DO DIA</span>
                  <h2>{formatHistoryDate(selectedHistoryGroup.date)}</h2>
                  <p>
                    {selectedHistoryGroup.entries.length === 1
                      ? "1 outfit usado neste dia."
                      : `${selectedHistoryGroup.entries.length} outfits usados neste dia.`}
                  </p>
                </div>

                <button
                  type="button"
                  className="historyDayClose"
                  onClick={() => setSelectedHistoryDate(null)}
                >
                  ×
                </button>
              </div>

              <div className="historyDayList">
                {selectedHistoryGroup.entries.map((entry) => {
                  const currentOutfit = outfits.find(
                    (outfit) => outfit.id === entry.outfitId
                  );

                  return (
                    <div className="historyDayItem" key={entry.id}>
                      {currentOutfit?.image ? (
                        <img
                          src={currentOutfit.image}
                          alt={entry.outfitTitle}
                          className="historyDayImage"
                        />
                      ) : (
                        <div className="historyDayPlaceholder">👕</div>
                      )}

                      <div className="historyDayInfo">
                        <div className="historyDayTop">
                          <div>
                            <h3>{entry.outfitTitle}</h3>
                            <p>
                              {entry.outfitFunction} · {entry.outfitStyle}
                            </p>
                          </div>

                          <span>{formatHistoryTime(entry.date)}</span>
                        </div>

                        {entry.laundryPieces?.length > 0 ? (
                          <div className="historyDayLaundry">
                            <strong>🧺 Peças enviadas para lavar</strong>

                            <ul>
                              {entry.laundryPieces.map((piece, index) => (
                                <li key={`${piece.name}-${index}`}>
                                  {piece.name} · {piece.category}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="historyDayNoLaundry">
                            Sem peças enviadas para lavar.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {notesOutfit && (
          <div
            className="notesOverlay"
            onClick={() => setNotesOutfit(null)}
          >
            <div
              className="notesModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="notesHeader">
                <div>
                  <span>NOTAS DO LOOK</span>
                  <h2>{notesOutfit.title}</h2>
                  <p>Guarda lembretes, ajustes ou ideias para este outfit.</p>
                </div>

                <button
                  type="button"
                  className="notesClose"
                  onClick={() => setNotesOutfit(null)}
                >
                  ×
                </button>
              </div>

              <textarea
                className="notesTextarea"
                placeholder="Ex: fica melhor com Air Force brancas, usar com casaco verde..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />

              <div className="notesFooter">
                <span>{noteDraft.length} caracteres</span>

                <button
                  type="button"
                  onClick={() => setNoteDraft("")}
                >
                  Limpar
                </button>
              </div>

              <div className="notesActions">
                <button
                  type="button"
                  className="notesCancel"
                  onClick={() => setNotesOutfit(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="notesSave"
                  onClick={saveOutfitNotes}
                >
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        )}

        {suggestedOutfit && (
          <div
            className="suggestOutfitOverlay"
            onClick={() => setSuggestedOutfit(null)}
          >
            <div
              className="suggestOutfitModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="suggestOutfitHeader">
                <div>
                  <span>SUGESTÃO</span>
                  <h2>Escolhi este outfit para ti</h2>
                  <p>
                    Dei prioridade a outfits disponíveis e que não foram usados recentemente.
                  </p>
                </div>

                <button
                  type="button"
                  className="suggestOutfitClose"
                  onClick={() => setSuggestedOutfit(null)}
                >
                  ×
                </button>
              </div>

              {outfitSuggestionNotice && (
                <div className="suggestOutfitNotice">
                  {outfitSuggestionNotice}
                </div>
              )}

              <div className="suggestOutfitCard">
                {suggestedOutfit.image ? (
                  <img
                    src={suggestedOutfit.image}
                    alt={suggestedOutfit.title}
                  />
                ) : (
                  <div className="suggestOutfitPlaceholder">👕</div>
                )}

                <div className="suggestOutfitInfo">
                  <div className="suggestOutfitTop">
                    <div>
                      <h3>{suggestedOutfit.title}</h3>
                      <p>
                        {suggestedOutfit.function === "Outro"
                          ? suggestedOutfit.customFunction
                          : suggestedOutfit.function} · {suggestedOutfit.style}
                      </p>
                    </div>

                    {suggestedOutfit.lastUsedAt && (
                      <span>{formatLastUsed(suggestedOutfit.lastUsedAt)}</span>
                    )}
                  </div>

                  {getUnavailablePiecesCount(suggestedOutfit) > 0 && (
                    <div className="suggestOutfitLaundryWarning">
                      🧺 Este outfit tem {getUnavailablePiecesCount(suggestedOutfit)} peça(s) para lavar.
                    </div>
                  )}

                  <div className="suggestOutfitPieces">
                    {(suggestedOutfit.pieces || []).map((piece, index) => (
                      <div
                        key={`${piece.name}-${index}`}
                        className={`suggestOutfitPiece ${
                          isPieceUnavailable(piece) ? "unavailable" : ""
                        }`}
                      >
                        <span>{piece.category}</span>
                        <strong>{piece.name}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="suggestOutfitActions">
                <button
                  type="button"
                  className="suggestAnotherBtn"
                  onClick={suggestAnotherOutfit}
                >
                  Escolher outro
                </button>

                <button
                  type="button"
                  className="suggestUseBtn"
                  onClick={useSuggestedOutfit}
                >
                  Usar este
                </button>
              </div>
            </div>
          </div>
        )}

        {usingTodayOutfit && (
          <div
            className="useTodayOverlay"
            onClick={() => setUsingTodayOutfit(null)}
          >
            <div
              className="useTodayModal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="useTodayHeader">
                <div>
                  <span>USAR HOJE</span>
                  <h2>{usingTodayOutfit.title}</h2>
                  <p>Escolhe as peças que queres meter para lavar. Podes não escolher nenhuma.</p>
                </div>

                <button
                  type="button"
                  className="useTodayClose"
                  onClick={() => setUsingTodayOutfit(null)}
                >
                  ×
                </button>
              </div>

              <div className="useTodayQuickActions">
                <button type="button" onClick={selectAllTodayLaundryPieces}>
                  Selecionar todas
                </button>

                <button type="button" onClick={clearTodayLaundryPieces}>
                  Limpar
                </button>
              </div>

              <div className="useTodayPieces">
                {(usingTodayOutfit.pieces || []).map((piece, index) => {
                  const pieceKey = getPieceKey(piece);
                  const selected = todayLaundryPieces.includes(pieceKey);
                  const alreadyUnavailable = isPieceUnavailable(piece);

                  return (
                    <button
                      key={`${pieceKey}-${index}`}
                      type="button"
                      className={`useTodayPiece ${selected ? "selected" : ""}`}
                      onClick={() => toggleTodayLaundryPiece(piece)}
                    >
                      <span className="useTodayCheck">
                        {selected ? "✓" : ""}
                      </span>

                      <div className="useTodayPieceInfo">
                        <strong>{piece.name}</strong>
                        <small>
                          {piece.category}
                          {alreadyUnavailable ? " · já está para lavar" : ""}
                        </small>
                      </div>

                      <div className="useTodayColors">
                        {(piece.colors || [piece.tempColor || "#ffffff"]).map((color, i) => (
                          <span
                            key={`${color}-${i}`}
                            className="useTodayColor"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="useTodayActions">
                <button
                  type="button"
                  className="useTodayCancel"
                  onClick={() => setUsingTodayOutfit(null)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="useTodaySave"
                  onClick={confirmUseToday}
                >
                  Guardar uso
                </button>
              </div>
            </div>
          </div>
        )}

        {previewClosetItem && (
          <div 
            className="imageOverlay"
            onClick={() => setPreviewClosetItem(null)}
          >
            <div 
              className="imagePreviewModal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="closePreviewBtn"
                onClick={() => setPreviewClosetItem(null)}
              >
                ×
              </button>

              <img 
                src={previewClosetItem.image} 
                alt={previewClosetItem.name} 
              />

              <div className="imagePreviewInfo">
                <h3>{previewClosetItem.name}</h3>
                <p>{previewClosetItem.category}</p>

                <div className="imagePreviewColors">
                  {(previewClosetItem.colors || [previewClosetItem.tempColor || "#ffffff"]).map((color, index) => (
                    <span
                      key={`${color}-${index}`}
                      className="imagePreviewColor"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="addFromPreviewBtn"
                  onClick={() => {
                    addClosetItemToForm(previewClosetItem);
                    setPreviewClosetItem(null);
                  }}
                >
                  + Adicionar ao look
                </button>
              </div>
            </div>
          </div>
        )}
      </div>  
  );
}

