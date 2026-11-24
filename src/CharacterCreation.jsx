import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const statDefinitions = [
  ["vida", "❤️", "Vida"],
  ["forca", "💪", "Força"],
  ["inteligencia", "🧠", "Inteligência"],
  ["visao", "👁️", "Visão"],
  ["regeneracao", "🫀", "Regeneração"],
  ["reputacao", "👑", "Reputação"],
  ["cheiro", "🪷", "Cheiro"],
  ["energia", "⭐", "Energia"],
  ["presenca", "🎗️", "Presença"],
  ["defesa", "🛡️", "Defesa"],
  ["conhecimento", "⚔️", "Conhecimento"],
  ["mana", "🔮", "Mana"],
  ["percepcao", "🧮", "Percepção"],
];

const raceRanges = {
  Fada: { height: [15, 35], weight: [0.2, 2] },
  Goblin: { height: [90, 130], weight: [25, 55] },
  Anão: { height: [120, 155], weight: [45, 85] },
  Humano: { height: [150, 200], weight: [45, 110] },
  Elfo: { height: [160, 205], weight: [45, 95] },
  Kitsune: { height: [150, 195], weight: [45, 100] },
  Sereiano: { height: [150, 205], weight: [50, 110] },
  Vampiro: { height: [160, 205], weight: [50, 105] },
  Celestial: { height: [165, 210], weight: [50, 100] },
  Demônio: { height: [165, 220], weight: [55, 130] },
  Lobisomem: { height: [170, 220], weight: [70, 150] },
  Draconiano: { height: [175, 230], weight: [80, 180] },
  Orc: { height: [180, 235], weight: [90, 200] },
  Troll: { height: [230, 350], weight: [180, 500] },
  Golem: { height: [200, 400], weight: [250, 1000] },
};

function CharacterCreation({ user, onCreated, onSignOut }) {
  const [races, setRaces] = useState([]);
  const [raceId, setRaceId] = useState("");
  const [displayName, setDisplayName] = useState(user.user_metadata?.name || "");
  const [age, setAge] = useState("18");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRaces() {
      setLoadingRaces(true);
      const { data, error: racesError } = await supabase
        .from("races")
        .select("id, name, description, stat_modifiers")
        .order("id", { ascending: true });
      if (!active) return;
      if (racesError) setError(`Não foi possível carregar as raças: ${racesError.message}`);
      else {
        setRaces(data || []);
        if (data?.length) setRaceId(String(data[0].id));
      }
      setLoadingRaces(false);
    }
    loadRaces();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  const selectedRace = useMemo(
    () => races.find((race) => String(race.id) === raceId) || null,
    [races, raceId]
  );
  const selectedRange = selectedRace ? raceRanges[selectedRace.name] : null;

  function handleAvatarChange(event) {
    const file = event.target.files?.[0] || null;
    setError("");
    if (!file) {
      setAvatar(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }
    setAvatar(file);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    if (displayName.trim().length < 2) {
      setError("O nome do personagem precisa ter pelo menos 2 caracteres.");
      return;
    }
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 999) {
      setError("Informe uma idade válida entre 1 e 999 anos.");
      return;
    }
    if (!selectedRace) {
      setError("Escolha uma raça.");
      return;
    }
    if (!avatar) {
      setError("Adicione uma foto de perfil para continuar.");
      return;
    }

    setSaving(true);
    let uploadedPath = "";
    try {
      const extension = avatar.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = /^[a-z0-9]{1,5}$/.test(extension) ? extension : "jpg";
      uploadedPath = `${user.id}/avatar-${crypto.randomUUID()}.${safeExtension}`;
      const { error: uploadError } = await supabase.storage
        .from("player-avatars")
        .upload(uploadedPath, avatar, {
          cacheControl: "3600",
          upsert: false,
          contentType: avatar.type,
        });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("player-avatars")
        .getPublicUrl(uploadedPath);

      const { data, error: rpcError } = await supabase.rpc("create_astrarpg_character", {
        p_display_name: displayName.trim(),
        p_race_id: Number(raceId),
        p_age: numericAge,
        p_avatar_url: publicData.publicUrl,
      });
      if (rpcError) throw rpcError;
      onCreated(data);
    } catch (saveError) {
      if (uploadedPath) {
        await supabase.storage.from("player-avatars").remove([uploadedPath]).catch(() => {});
      }
      setError(saveError?.message || "Não foi possível criar sua ficha. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="character-creation-page">
      <div className="character-creation-glow character-creation-glow--one" />
      <div className="character-creation-glow character-creation-glow--two" />
      <section className="character-creation-card">
        <div className="character-creation-brand"><span>✦</span> Astra<span>Rpg</span></div>
        <div className="character-creation-kicker">SUA JORNADA COMEÇA AQUI</div>
        <h1>Crie seu personagem</h1>
        <p className="character-creation-intro">Antes de entrar no mundo, você precisa criar sua ficha. Escolha com atenção: sua raça define seus atributos iniciais.</p>

        <form onSubmit={handleCreate} className="character-creation-form">
          <div className="character-creation-avatar-row">
            <div className="character-avatar-preview">
              {avatarPreview ? <img src={avatarPreview} alt="Prévia do avatar" /> : <span>✦</span>}
            </div>
            <label className="character-upload-button">
              Escolher foto de perfil
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            <span className="character-upload-hint">Imagem de até 5 MB</span>
          </div>

          <label className="character-field">
            Nome do personagem
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} placeholder="Digite o nome do seu personagem" required />
          </label>

          <div className="character-field-grid">
            <label className="character-field">
              Raça
              <select value={raceId} onChange={(event) => setRaceId(event.target.value)} disabled={loadingRaces || !races.length} required>
                {loadingRaces && <option value="">Carregando raças...</option>}
                {!loadingRaces && !races.length && <option value="">Nenhuma raça disponível</option>}
                {races.map((race) => <option value={race.id} key={race.id}>{race.name}</option>)}
              </select>
            </label>
            <label className="character-field">
              Idade
              <input type="number" min="1" max="999" value={age} onChange={(event) => setAge(event.target.value)} required />
            </label>
          </div>

          <div className="character-random-info">
            <div><span>Altura</span><strong>{selectedRange ? `${selectedRange.height[0]}–${selectedRange.height[1]} cm` : "Definida pela raça"}</strong><small>Sorteada ao criar a ficha</small></div>
            <div><span>Peso</span><strong>{selectedRange ? `${selectedRange.weight[0]}–${selectedRange.weight[1]} kg` : "Definido pela altura"}</strong><small>Sorteado conforme sua altura</small></div>
          </div>

          <div className="character-stats-heading">
            <div><span>ATRIBUTOS INICIAIS</span><h2>{selectedRace?.name || "Escolha uma raça"}</h2></div>
            <small>Valores definidos pela raça</small>
          </div>
          <div className="character-stats-grid">
            {statDefinitions.map(([key, icon, label]) => (
              <div className="character-stat" key={key}>
                <span>{icon}</span><small>{label}</small>
                <strong>{selectedRace?.stat_modifiers?.[key] ?? "—"}</strong>
              </div>
            ))}
          </div>

          {selectedRace?.description && <p className="character-race-description">{selectedRace.description}</p>}
          {error && <div className="character-form-error" role="alert">{error}</div>}
          <button className="character-create-submit" type="submit" disabled={saving || loadingRaces || !races.length}>
            {saving ? "Criando sua ficha..." : "Criar personagem e entrar no mundo"}<span>→</span>
          </button>
          <p className="character-one-time-note">A altura, o peso e os atributos são definidos uma única vez. Não será possível recriar a ficha para sortear novos valores.</p>
        </form>
        <button className="character-signout" type="button" onClick={onSignOut}>Sair da conta</button>
      </section>
    </main>
  );
}

export default CharacterCreation;
