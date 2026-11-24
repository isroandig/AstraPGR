
import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import CharacterCreation from "./CharacterCreation";
import "./App.css";
import { NewsPage, EventsPage, PlayersPage, ClansPage, PoliticsPage, WorldPage, MissionsPage, SupportPage, ChatPage, CallPage, AdminPage, AstraRpgPagesStyle } from "./pages/AstraRpgPages";

const navigation = [
  "Início",
  "Novidades",
  "Loja",
  "Clãs",
  "Política",
  "Eventos",
  "Jogadores",
  "Mundo",
  "Missões",
  "Dúvidas",
  "Chat ao vivo",
  "Call",
  "Perfil",
  "Admin",
  "Configurações",
];

const navigationSymbols = ["⌂", "✧", "▣", "♜", "♛", "✿", "♙", "⌖", "⚔", "?", "◉", "☎", "♙", "⚙", "☼"];

const featuredEvents = [
  {
    tag: "EVENTO EM DESTAQUE",
    title: "A aventura está prestes a começar",
    description: "Novos desafios, descobertas e recompensas aguardam por você.",
    action: "Ver eventos",
    destination: "Eventos",
    style: "event-card--purple",
  },
  {
    tag: "LOJA ESPECIAL",
    title: "Itens raros chegaram",
    description: "Explore os itens especiais e prepare seu personagem.",
    action: "Explorar loja",
    destination: "Loja",
    style: "event-card--gold",
  },
];

const statLabels = {
  vida: "Vida",
  forca: "Força",
  inteligencia: "Inteligência",
  visao: "Visão",
  regeneracao: "Regeneração",
  reputacao: "Reputação",
  cheiro: "Cheiro",
  energia: "Energia",
  presenca: "Presença",
  defesa: "Defesa",
  conhecimento: "Conhecimento",
  mana: "Mana",
  percepcao: "Percepção",
};

const shopTabs = [
  "Loja",
  "Inventário",
  "Mercado",
  "Minhas vendas",
  "Craft",
  "Histórico",
];

const currencyLabels = {
  gold: "Ouro",
  crystals: "Cristais",
};

const categoryLabels = {
  geral: "Geral",
  box_evento: "Caixas de evento",
  equipamento: "Equipamentos",
  consumivel: "Consumíveis",
  material: "Materiais",
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function formatCurrency(currency) {
  return currency === "crystals" ? "◆" : "◈";
}

function AuthScreen() {
  const [mode, setMode] = useState(
    window.location.hash.includes("type=recovery") ? "recovery" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (mode === "signup" && name.trim().length < 2) {
      setError("Digite um nome com pelo menos 2 caracteres.");
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (mode === "recovery" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (authError) throw authError;

        if (data.session) {
          setMessage("Conta criada! Sua sessão já está ativa.");
        } else {
          setMessage("Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.");
          setMode("login");
          setPassword("");
        }
      } else if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      } else if (mode === "forgot") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: window.location.origin }
        );
        if (authError) throw authError;
        setMessage("Se o endereço estiver cadastrado, você receberá um e-mail com as instruções para redefinir a senha.");
      } else if (mode === "recovery") {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Senha alterada com sucesso. Você já pode continuar no AstraRpg.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (submitError) {
      setError(
        submitError?.message ||
        "Não foi possível concluir a operação. Confira os dados e tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (authError) throw authError;
    } catch (googleError) {
      setError(googleError?.message || "Não foi possível iniciar o login com Google.");
      setBusy(false);
    }
  }

  const titles = {
    login: ["Sua próxima aventura começa aqui", "Entre no AstraRpg"],
    signup: ["Crie sua conta e escreva sua história", "Criar conta"],
    forgot: ["Vamos ajudar você a voltar", "Recuperar senha"],
    recovery: ["Escolha uma nova senha", "Redefinir senha"],
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Astra<span>Rpg</span></span>
        </div>
        <div className="auth-eyebrow">SEU MUNDO, SUA HISTÓRIA</div>
        <h1>{titles[mode][0]}</h1>
        <p className="auth-intro">
          {mode === "signup"
            ? "Comece criando sua conta. Depois você poderá montar seu personagem."
            : mode === "forgot"
              ? "Informe o e-mail da sua conta para receber o link de recuperação."
              : mode === "recovery"
                ? "Use uma senha nova com pelo menos 6 caracteres."
                : "Entre para continuar sua jornada e encontrar outros aventureiros."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Nome
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como devemos chamar você?"
                autoComplete="name"
                required
              />
            </label>
          )}

          {mode !== "recovery" && (
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                required
              />
            </label>
          )}

          {mode !== "forgot" && (
            <label>
              {mode === "recovery" ? "Nova senha" : "Senha"}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete={mode === "signup" ? "new-password" : mode === "recovery" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </label>
          )}

          {mode === "recovery" && (
            <label>
              Confirmar nova senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
          )}

          {error && <div className="auth-message auth-message--error" role="alert">{error}</div>}
          {message && <div className="auth-message auth-message--success" role="status">{message}</div>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Aguarde..." : titles[mode][1]}
            {!busy && <span>→</span>}
          </button>
        </form>

        {mode === "login" && (
          <>
            <button className="google-button" type="button" onClick={handleGoogleLogin} disabled={busy}>
              <span className="google-g">G</span>
              Continuar com Google
            </button>
            <button className="auth-text-button auth-forgot" type="button" onClick={() => changeMode("forgot")}>
              Esqueci minha senha
            </button>
          </>
        )}

        <div className="auth-switch">
          {mode === "login" ? (
            <>Ainda não tem conta? <button type="button" onClick={() => changeMode("signup")}>Criar conta</button></>
          ) : mode === "signup" ? (
            <>Já possui uma conta? <button type="button" onClick={() => changeMode("login")}>Entrar</button></>
          ) : (
            <button type="button" onClick={() => changeMode("login")}>Voltar para o login</button>
          )}
        </div>
        <div className="auth-footnote">AstraRpg · Um universo, mil histórias</div>
      </section>
      <div className="auth-orbit auth-orbit--one" />
      <div className="auth-orbit auth-orbit--two" />
    </main>
  );
}

function ProfilePage({ profile, user }) {
  const [profileTab, setProfileTab] = useState("ficha");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  useEffect(() => {
    if (profileTab !== "inventario") return;
    let live = true;
    setInventoryLoading(true);
    setInventoryError("");
    (async () => {
      const [inv, catalog] = await Promise.all([
        supabase.from("player_inventory").select("id,item_id,quantity,acquired_at").eq("player_id", user.id).order("acquired_at", { ascending: false }),
        supabase.from("shop_items").select("id,name,description,image_url,rarity,item_type")
      ]);
      if (!live) return;
      if (inv.error) setInventoryError(inv.error.message);
      else {
        const byId = Object.fromEntries((catalog.data || []).map(item => [String(item.id), item]));
        setInventoryItems((inv.data || []).map(entry => ({ ...entry, item: byId[String(entry.item_id)] || null })));
      }
      setInventoryLoading(false);
    })();
    return () => { live = false; };
  }, [profileTab, user.id]);
  const stats = profile.stats && typeof profile.stats === "object"
    ? Object.entries(profile.stats)
    : [];

  const displayName = profile.display_name || user.user_metadata?.name || "Aventureiro";

  return (
    <div className="profile-page">
      <style>{`
        .profile-page { width: 100%; max-width: 1120px; margin: 0 auto; }
        .profile-heading { margin-bottom: 25px; }
        .profile-heading .section-kicker { color: #a78bfa; font-size: 11px; font-weight: 800; letter-spacing: 2px; }
        .profile-heading h1 { margin: 8px 0; color: #f5f2ff; font-size: clamp(27px, 4vw, 36px); }
        .profile-heading p { margin: 0; color: #9c98ad; line-height: 1.6; }
        .profile-hero { display: flex; align-items: center; gap: 22px; padding: 26px; border: 1px solid rgba(167,139,250,.2); border-radius: 18px; background: linear-gradient(120deg, rgba(111,76,190,.2), rgba(27,25,43,.92)); }
        .profile-avatar { width: 104px; height: 104px; flex: 0 0 104px; overflow: hidden; display: grid; place-items: center; border-radius: 50%; border: 3px solid rgba(190,165,255,.75); background: #29233d; color: #d9c9ff; font-size: 35px; font-weight: 800; }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-identity { min-width: 0; }
        .profile-identity h2 { margin: 0 0 7px; color: #fff; font-size: 25px; overflow-wrap: anywhere; }
        .profile-race { color: #c4b5fd; font-weight: 700; }
        .profile-email { margin-top: 7px; color: #9994aa; font-size: 13px; overflow-wrap: anywhere; }
        .profile-level-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 18px 0 28px; }
        .profile-info-card, .profile-section { border: 1px solid rgba(255,255,255,.08); border-radius: 15px; background: rgba(23,22,34,.8); }
        .profile-info-card { padding: 17px 19px; }
        .profile-info-card span { display: block; color: #9994aa; font-size: 12px; }
        .profile-info-card strong { display: block; margin-top: 7px; color: #f4efff; font-size: 22px; }
        .profile-section { padding: 22px; margin-bottom: 18px; }
        .profile-section h3 { margin: 0 0 17px; color: #f5f2ff; font-size: 17px; }
        .profile-details-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .profile-detail { padding: 13px; border-radius: 11px; background: rgba(255,255,255,.035); }
        .profile-detail span { display: block; color: #9994aa; font-size: 11px; }
        .profile-detail strong { display: block; margin-top: 6px; color: #eee9fb; font-size: 15px; }
        .profile-stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .profile-stat { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 14px; border-radius: 10px; background: rgba(255,255,255,.035); }
        .profile-stat span { color: #bcb6ca; font-size: 13px; }
        .profile-stat strong { color: #c4b5fd; font-size: 15px; }
        .profile-description { margin: -7px 0 17px; color: #a49eb2; font-size: 13px; line-height: 1.6; }
        .profile-empty { color: #9994aa; font-size: 13px; }
        .profile-subtabs { display:flex; gap:8px; flex-wrap:wrap; margin:18px 0; }
        .profile-subtabs button { border:1px solid rgba(167,139,250,.22); border-radius:10px; padding:10px 16px; color:#b9b0cd; background:rgba(25,22,38,.82); cursor:pointer; font-weight:700; }
        .profile-subtabs button.active { color:#fff; background:#7257ac; border-color:#a78bfa; }
        .profile-coming-soon { min-height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .profile-coming-soon>span { font-size:32px; color:#b7a0ff; }
        .profile-coming-soon p { color:#9994aa; }
        .profile-inventory-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
        .profile-inventory-item { display:flex; align-items:center; gap:12px; min-width:0; padding:12px; border:1px solid rgba(255,255,255,.08); border-radius:12px; background:rgba(255,255,255,.025); }
        .profile-inventory-image { width:58px; height:58px; flex:0 0 58px; display:grid; place-items:center; overflow:hidden; border-radius:10px; background:#29233d; color:#c4b5fd; font-size:23px; }
        .profile-inventory-image img { width:100%; height:100%; object-fit:cover; }
        .profile-inventory-item strong,.profile-inventory-item span { display:block; overflow-wrap:anywhere; }
        .profile-inventory-item strong { color:#f4efff; font-size:13px; }
        .profile-inventory-item span { color:#b7aecb; font-size:11px; margin-top:5px; }
        .profile-inventory-item p { color:#9994aa; font-size:11px; margin:6px 0 0; }
        .hero-banner--custom { background-size:cover; background-position:center; }
        .secondary-banner-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        .secondary-banner-card { overflow:hidden; border:1px solid rgba(167,139,250,.2); border-radius:16px; background:rgba(26,23,39,.92); }
        .secondary-banner-card>img { display:block; width:100%; height:150px; object-fit:cover; }
        .secondary-banner-card>div { padding:16px; }
        .secondary-banner-card h3 { color:#f5f2ff; margin:0 0 7px; }
        .secondary-banner-card p { color:#a49eb2; font-size:13px; line-height:1.6; }
        .secondary-banner-card button { border:0; border-radius:8px; padding:9px 12px; background:#7661b4; color:white; cursor:pointer; }
        @media (max-width: 760px) {
          .profile-level-grid { grid-template-columns: 1fr; }
          .profile-inventory-grid,.secondary-banner-grid { grid-template-columns:1fr; }
          .profile-details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .profile-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .profile-hero { align-items: flex-start; padding: 19px; gap: 15px; }
          .profile-avatar { width: 76px; height: 76px; flex-basis: 76px; font-size: 27px; }
          .profile-identity h2 { font-size: 20px; }
        }
        @media (max-width: 420px) {
          .profile-stats-grid { grid-template-columns: 1fr; }
          .profile-section { padding: 16px; }
        }
      `}</style>

      <div className="profile-heading">
        <span className="section-kicker">SUA JORNADA</span>
        <h1>Perfil do personagem</h1>
        <p>Confira as informações e os atributos do seu aventureiro.</p>
      </div>

      <section className="profile-hero">
        <div className="profile-avatar">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={`Foto de ${displayName}`} />
            : displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-identity">
          <h2>{displayName}</h2>
          <div className="profile-race">{profile.race_name || "Raça não identificada"}</div>
          <div className="profile-email">{user.email}</div>
        </div>
      </section>

      <nav className="profile-subtabs" aria-label="Abas do perfil">
        <button type="button" className={profileTab === "ficha" ? "active" : ""} onClick={() => setProfileTab("ficha")}>Ficha</button>
        <button type="button" className={profileTab === "arvore" ? "active" : ""} onClick={() => setProfileTab("arvore")}>Árvore</button>
        <button type="button" className={profileTab === "inventario" ? "active" : ""} onClick={() => setProfileTab("inventario")}>Inventário</button>
      </nav>
      {profileTab === "arvore" ? (
        <section className="profile-section profile-coming-soon"><span>✦</span><h3>Árvore de habilidades</h3><p>Coming soon — esta área chegará em uma próxima atualização.</p></section>
      ) : profileTab === "inventario" ? (
        <section className="profile-section"><h3>Inventário do personagem</h3>
          {inventoryError ? <p className="profile-empty">Não foi possível carregar o inventário: {inventoryError}</p> : inventoryLoading ? <p className="profile-empty">Carregando itens...</p> : inventoryItems.length ? <div className="profile-inventory-grid">{inventoryItems.map((entry, index) => <article className="profile-inventory-item" key={entry.id || `${entry.item_id}-${index}`}>
            <div className="profile-inventory-image">{entry.item?.image_url ? <img src={entry.item.image_url} alt={entry.item.name || "Item"}/> : <span>✦</span>}</div>
            <div><strong>{entry.item?.name || `Item #${entry.item_id}`}</strong><span>{entry.item?.rarity || "Item"} · Quantidade: {Number(entry.quantity || 0)}</span>{entry.item?.description && <p>{entry.item.description}</p>}</div>
          </article>)}</div> : <p className="profile-empty">Seu inventário está vazio. Os itens que você adquirir aparecerão aqui.</p>}
        </section>
      ) : <>
      <div className="profile-level-grid">
        <div className="profile-info-card">
          <span>Nível atual</span>
          <strong>{Number(profile.level || 0).toLocaleString("pt-BR")}</strong>
        </div>
        <div className="profile-info-card">
          <span>Experiência</span>
          <strong>{Number(profile.experience || 0).toLocaleString("pt-BR")} XP</strong>
        </div>
        <div className="profile-info-card">
          <span>Ouro</span>
          <strong>{Number(profile.gold || 0).toLocaleString("pt-BR")} ◈</strong>
        </div>
      </div>

      <section className="profile-section">
        <h3>Informações do personagem</h3>
        {profile.race_description && <p className="profile-description">{profile.race_description}</p>}
        <div className="profile-details-grid">
          <div className="profile-detail"><span>Raça</span><strong>{profile.race_name || "—"}</strong></div>
          <div className="profile-detail"><span>Idade</span><strong>{profile.age ?? "—"}{profile.age != null ? " anos" : ""}</strong></div>
          <div className="profile-detail"><span>Altura</span><strong>{profile.height_cm != null ? `${profile.height_cm} cm` : "—"}</strong></div>
          <div className="profile-detail"><span>Peso</span><strong>{profile.weight_kg != null ? `${profile.weight_kg} kg` : "—"}</strong></div>
          <div className="profile-detail"><span>Cristais</span><strong>{Number(profile.crystals || 0).toLocaleString("pt-BR")}</strong></div>
          <div className="profile-detail"><span>Conta criada em</span><strong>{profile.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "—"}</strong></div>
        </div>
      </section>

      <section className="profile-section">
        <h3>Atributos do personagem</h3>
        {stats.length > 0 ? (
          <div className="profile-stats-grid">
            {stats.map(([key, value]) => (
              <div className="profile-stat" key={key}>
                <span>{statLabels[key] || key.replaceAll("_", " ")}</span>
                <strong>{typeof value === "number" ? value.toLocaleString("pt-BR") : String(value ?? "—")}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty">Nenhum atributo foi encontrado na ficha.</p>
        )}
      </section>
      </>}
    </div>
  );
}

function ShopPage({ user, onWalletRefresh, showNotice }) {
  const [activeTab, setActiveTab] = useState("Loja");
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipeMaterials, setRecipeMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [listingItem, setListingItem] = useState("");
  const [listingQuantity, setListingQuantity] = useState("1");
  const [listingCurrency, setListingCurrency] = useState("gold");
  const [listingPrice, setListingPrice] = useState("");

  const itemMap = Object.fromEntries(items.map((item) => [String(item.id), item]));

  async function loadShopData() {
    setLoading(true);
    setError("");

    try {
      const [
        itemsResult,
        inventoryResult,
        listingsResult,
        recipesResult,
      ] = await Promise.all([
        supabase
          .from("shop_items")
          .select("*")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("player_inventory")
          .select("*")
          .eq("player_id", user.id)
          .order("acquired_at", { ascending: false }),
        supabase
          .from("marketplace_listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("craft_recipes")
          .select("*")
          .eq("is_active", true)
          .order("required_level"),
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (inventoryResult.error) throw inventoryResult.error;
      if (listingsResult.error) throw listingsResult.error;
      if (recipesResult.error) throw recipesResult.error;

      const loadedItems = itemsResult.data || [];
      const loadedInventory = inventoryResult.data || [];
      const loadedListings = listingsResult.data || [];
      const loadedRecipes = recipesResult.data || [];

      setItems(loadedItems);
      setInventory(loadedInventory);
      setListings(loadedListings);
      setMyListings(loadedListings.filter((listing) => listing.seller_id === user.id));
      setRecipes(loadedRecipes);

      if (loadedRecipes.length > 0) {
        const recipeIds = loadedRecipes.map((recipe) => recipe.id);
        const { data: materialData, error: materialError } = await supabase
          .from("craft_recipe_materials")
          .select("*")
          .in("recipe_id", recipeIds);

        if (materialError) throw materialError;
        setRecipeMaterials(materialData || []);
      } else {
        setRecipeMaterials([]);
      }

      const inventoryItemIds = loadedInventory.map((entry) => entry.item_id);
      const listingItemIds = loadedListings.map((entry) => entry.item_id);
      const recipeItemIds = loadedRecipes.map((recipe) => recipe.result_item_id);
      const materialItemIds = (loadedRecipes.length > 0
        ? (await supabase
            .from("craft_recipe_materials")
            .select("material_item_id")
            .in("recipe_id", loadedRecipes.map((recipe) => recipe.id))).data || []
        : []
      ).map((entry) => entry.material_item_id);

      const allIds = [...new Set([
        ...inventoryItemIds,
        ...listingItemIds,
        ...recipeItemIds,
        ...materialItemIds,
      ])];

      if (allIds.length > 0) {
        const missingIds = allIds.filter(
          (id) => !loadedItems.some((item) => String(item.id) === String(id))
        );

        if (missingIds.length > 0) {
          const { data: extraItems, error: extraError } = await supabase
            .from("shop_items")
            .select("*")
            .in("id", missingIds);

          if (extraError) throw extraError;
          if (extraItems?.length) {
            setItems((current) => {
              const merged = [...current];
              extraItems.forEach((extra) => {
                if (!merged.some((item) => String(item.id) === String(extra.id))) {
                  merged.push(extra);
                }
              });
              return merged;
            });
          }
        }
      }
    } catch (loadError) {
      setError(loadError?.message || "Não foi possível carregar os dados da Loja.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShopData();
  }, [user.id]);

  async function refreshAfterTransaction() {
    await loadShopData();
    if (onWalletRefresh) await onWalletRefresh();
  }

  async function buyItem(item) {
    if (!window.confirm(`Comprar ${item.name} por ${formatNumber(item.price)} ${currencyLabels[item.currency] || "moedas"}?`)) {
      return;
    }

    setBusyId(`buy-${item.id}`);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("astrarpg_buy_shop_item", {
        p_item_id: item.id,
        p_quantity: 1,
      });

      if (rpcError) throw rpcError;

      showNotice(`${item.name} comprado com sucesso!`);
      await refreshAfterTransaction();
    } catch (purchaseError) {
      setError(purchaseError?.message || "Não foi possível comprar este item.");
    } finally {
      setBusyId(null);
    }
  }

  async function buyListing(listing) {
    const item = itemMap[String(listing.item_id)];
    const itemName = item?.name || `Item #${listing.item_id}`;

    if (!window.confirm(`Comprar ${itemName} por ${formatNumber(listing.unit_price * listing.quantity)} ${currencyLabels[listing.currency] || "moedas"}?`)) {
      return;
    }

    setBusyId(`listing-${listing.id}`);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("astrarpg_buy_listing", {
        p_listing_id: listing.id,
      });

      if (rpcError) throw rpcError;

      showNotice("Compra realizada no mercado!");
      await refreshAfterTransaction();
    } catch (purchaseError) {
      setError(purchaseError?.message || "Não foi possível comprar este anúncio.");
    } finally {
      setBusyId(null);
    }
  }

  async function createListing(event) {
    event.preventDefault();
    setError("");

    const quantity = Number(listingQuantity);
    const price = Number(listingPrice);
    const selectedInventory = inventory.find(
      (entry) => String(entry.item_id) === String(listingItem)
    );

    if (!selectedInventory) {
      setError("Selecione um item do seu inventário.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > selectedInventory.quantity) {
      setError("A quantidade informada não é válida para seu inventário.");
      return;
    }

    if (!Number.isInteger(price) || price < 1) {
      setError("Informe um preço inteiro maior que zero.");
      return;
    }

    setBusyId("create-listing");

    try {
      const { error: rpcError } = await supabase.rpc("astrarpg_create_listing", {
        p_item_id: selectedInventory.item_id,
        p_quantity: quantity,
        p_currency: listingCurrency,
        p_unit_price: price,
      });

      if (rpcError) throw rpcError;

      setListingItem("");
      setListingQuantity("1");
      setListingPrice("");
      showNotice("Seu anúncio foi publicado no mercado!");
      await refreshAfterTransaction();
    } catch (listingError) {
      setError(listingError?.message || "Não foi possível publicar o anúncio.");
    } finally {
      setBusyId(null);
    }
  }

  async function cancelListing(listing) {
    if (!window.confirm("Cancelar este anúncio e devolver os itens ao inventário?")) {
      return;
    }

    setBusyId(`cancel-${listing.id}`);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("astrarpg_cancel_listing", {
        p_listing_id: listing.id,
      });

      if (rpcError) throw rpcError;

      showNotice("Anúncio cancelado. Os itens voltaram ao inventário.");
      await refreshAfterTransaction();
    } catch (cancelError) {
      setError(cancelError?.message || "Não foi possível cancelar o anúncio.");
    } finally {
      setBusyId(null);
    }
  }

  async function craftItem(recipe) {
    const quantity = Number(window.prompt("Quantas vezes deseja fabricar? (1 a 50)", "1"));

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return;
    }

    setBusyId(`craft-${recipe.id}`);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc("astrarpg_craft_item", {
        p_recipe_id: recipe.id,
        p_times: quantity,
      });

      if (rpcError) throw rpcError;

      showNotice("Fabricação concluída!");
      await refreshAfterTransaction();
    } catch (craftError) {
      setError(craftError?.message || "Não foi possível fabricar este item.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === "todos" || item.category === categoryFilter;
    const matchesSearch = `${item.name} ${item.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return item.is_active && matchesCategory && matchesSearch;
  });

  function getItemName(itemId) {
    return itemMap[String(itemId)]?.name || `Item #${itemId}`;
  }

  function getMaterials(recipeId) {
    return recipeMaterials.filter((material) => material.recipe_id === recipeId);
  }

  return (
    <div className="astrarpg-shop">
      <style>{`
        .astrarpg-shop { width: 100%; max-width: 1200px; margin: 0 auto; color: #f5f2ff; }
        .shop-heading { margin-bottom: 22px; }
        .shop-heading .section-kicker { color: #a78bfa; font-size: 11px; font-weight: 800; letter-spacing: 2px; }
        .shop-heading h1 { margin: 8px 0; font-size: clamp(27px, 4vw, 36px); }
        .shop-heading p { color: #a49eb2; margin: 0; line-height: 1.6; }
        .shop-wallet { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
        .shop-wallet span { border: 1px solid rgba(255,255,255,.09); background: rgba(255,255,255,.04); padding: 10px 14px; border-radius: 10px; color: #ddd5ef; font-size: 13px; }
        .shop-tabs { display: flex; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid rgba(255,255,255,.09); padding-bottom: 14px; margin-bottom: 22px; }
        .shop-tab { border: 1px solid rgba(255,255,255,.1); border-radius: 9px; padding: 10px 15px; background: rgba(255,255,255,.035); color: #bcb6ca; cursor: pointer; font: inherit; font-size: 13px; transition: .2s; }
        .shop-tab:hover, .shop-tab--active { color: #fff; border-color: rgba(167,139,250,.55); background: rgba(139,92,246,.18); }
        .shop-toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
        .shop-toolbar input, .shop-toolbar select, .shop-form input, .shop-form select { min-width: 0; border: 1px solid rgba(255,255,255,.12); border-radius: 9px; padding: 11px 13px; background: #211e2e; color: #f5f2ff; font: inherit; }
        .shop-toolbar input { flex: 1; min-width: 180px; }
        .shop-toolbar select { min-width: 175px; }
        .shop-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
        .shop-card { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 14px; background: rgba(25,23,37,.88); }
        .shop-card-image { height: 155px; display: grid; place-items: center; overflow: hidden; background: radial-gradient(circle at center, rgba(139,92,246,.2), rgba(255,255,255,.025)); color: #c4b5fd; font-size: 43px; }
        .shop-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .shop-card-body { padding: 16px; }
        .shop-card-category { color: #b9a4f7; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; font-weight: 800; }
        .shop-card h3 { margin: 8px 0; color: #fff; font-size: 17px; }
        .shop-card p { min-height: 38px; margin: 0 0 14px; color: #a49eb2; font-size: 12px; line-height: 1.55; }
        .shop-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .shop-price { color: #f2d48b; font-weight: 800; font-size: 14px; }
        .shop-buy-button, .shop-action-button { border: 0; border-radius: 8px; padding: 10px 13px; background: linear-gradient(120deg, #8b5cf6, #6d45c4); color: white; cursor: pointer; font: inherit; font-size: 12px; font-weight: 800; }
        .shop-buy-button:disabled, .shop-action-button:disabled { opacity: .5; cursor: wait; }
        .shop-secondary-button { border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: 9px 12px; background: rgba(255,255,255,.05); color: #ddd5ef; cursor: pointer; font: inherit; font-size: 12px; }
        .shop-list { display: grid; gap: 11px; }
        .shop-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px; border: 1px solid rgba(255,255,255,.09); border-radius: 12px; background: rgba(25,23,37,.8); }
        .shop-row-main { min-width: 0; }
        .shop-row-main strong { display: block; color: #f5f2ff; margin-bottom: 5px; }
        .shop-row-main span { color: #a49eb2; font-size: 12px; line-height: 1.5; }
        .shop-row-actions { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
        .shop-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; padding: 19px; border: 1px solid rgba(255,255,255,.09); border-radius: 13px; background: rgba(25,23,37,.8); margin-bottom: 20px; }
        .shop-form label { display: grid; gap: 7px; color: #c7c0d5; font-size: 12px; }
        .shop-form button { align-self: end; min-height: 40px; }
        .shop-form .shop-form-wide { grid-column: 1 / -1; }
        .shop-error { padding: 13px 15px; margin-bottom: 17px; border: 1px solid rgba(248,113,113,.3); border-radius: 9px; background: rgba(127,29,29,.17); color: #fecaca; font-size: 13px; overflow-wrap: anywhere; }
        .shop-empty { padding: 35px 20px; text-align: center; border: 1px dashed rgba(255,255,255,.14); border-radius: 13px; color: #a49eb2; line-height: 1.6; }
        .shop-section-title { margin: 0 0 15px; color: #eee9fb; font-size: 17px; }
        .shop-info { padding: 17px; border: 1px solid rgba(167,139,250,.2); border-radius: 12px; background: rgba(139,92,246,.08); color: #c9bdf0; font-size: 13px; line-height: 1.65; }
        .shop-loading { padding: 35px; text-align: center; color: #bcb6ca; }
        .shop-recipe-materials { margin: 12px 0; padding: 10px; border-radius: 8px; background: rgba(255,255,255,.035); color: #aaa3b9; font-size: 11px; line-height: 1.7; }
        @media (max-width: 900px) { .shop-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) {
          .shop-grid { grid-template-columns: 1fr; }
          .shop-row { align-items: flex-start; flex-direction: column; }
          .shop-row-actions { justify-content: flex-start; }
          .shop-form { grid-template-columns: 1fr; }
          .shop-form .shop-form-wide { grid-column: auto; }
          .shop-tab { flex: 1 1 auto; }
        }
      `}</style>

      <div className="shop-heading">
        <span className="section-kicker">COMÉRCIO DE ASTRARPG</span>
        <h1>Loja e inventário</h1>
        <p>Adquira equipamentos, negocie com outros aventureiros e fabrique novos itens.</p>
      </div>

      <div className="shop-tabs">
        {shopTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`shop-tab ${activeTab === tab ? "shop-tab--active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setError("");
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="shop-error" role="alert">{error}</div>}

      {loading ? (
        <div className="shop-loading">Carregando dados da Loja...</div>
      ) : (
        <>
          {activeTab === "Loja" && (
            <>
              <div className="shop-toolbar">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar item..."
                  aria-label="Buscar item"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filtrar categoria"
                >
                  <option value="todos">Todas as categorias</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {filteredItems.length > 0 ? (
                <div className="shop-grid">
                  {filteredItems.map((item) => (
                    <article className="shop-card" key={item.id}>
                      <div className="shop-card-image">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} />
                          : "✧"}
                      </div>
                      <div className="shop-card-body">
                        <span className="shop-card-category">{categoryLabels[item.category] || item.category}</span>
                        <h3>{item.name}</h3>
                        <p>{item.description || "Um item disponível no universo AstraRpg."}</p>
                        <div className="shop-card-footer">
                          <span className="shop-price">
                            {formatCurrency(item.currency)} {formatNumber(item.price)}
                          </span>
                          <button
                            className="shop-buy-button"
                            type="button"
                            disabled={busyId === `buy-${item.id}`}
                            onClick={() => buyItem(item)}
                          >
                            {busyId === `buy-${item.id}` ? "Comprando..." : "Comprar"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="shop-empty">
                  Nenhum item encontrado nessa categoria.
                  <br />
                  Os itens cadastrados pelo administrador aparecerão aqui.
                </div>
              )}
            </>
          )}

          {activeTab === "Inventário" && (
            <>
              <h2 className="shop-section-title">Seus itens</h2>
              {inventory.length > 0 ? (
                <div className="shop-list">
                  {inventory.map((entry) => {
                    const item = itemMap[String(entry.item_id)];
                    return (
                      <div className="shop-row" key={entry.id}>
                        <div className="shop-row-main">
                          <strong>{item?.name || `Item #${entry.item_id}`}</strong>
                          <span>
                            {item?.description || "Item do seu inventário"}
                            {item?.is_tradeable === false ? " · Não negociável" : ""}
                          </span>
                        </div>
                        <div className="shop-row-actions">
                          <span className="shop-price">Quantidade: {formatNumber(entry.quantity)}</span>
                          {item?.is_tradeable !== false && (
                            <button
                              className="shop-secondary-button"
                              type="button"
                              onClick={() => {
                                setListingItem(String(entry.item_id));
                                setActiveTab("Minhas vendas");
                              }}
                            >
                              Anunciar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="shop-empty">
                  Seu inventário está vazio.
                  <br />
                  Os itens comprados e fabricados aparecerão aqui.
                </div>
              )}
            </>
          )}

          {activeTab === "Mercado" && (
            <>
              <h2 className="shop-section-title">Anúncios de outros jogadores</h2>
              {listings.filter((listing) => listing.seller_id !== user.id).length > 0 ? (
                <div className="shop-list">
                  {listings
                    .filter((listing) => listing.seller_id !== user.id)
                    .map((listing) => (
                      <div className="shop-row" key={listing.id}>
                        <div className="shop-row-main">
                          <strong>{getItemName(listing.item_id)}</strong>
                          <span>
                            Quantidade: {formatNumber(listing.quantity)}
                            {" · "}Vendedor: aventureiro
                            {" · "}Preço unitário: {formatCurrency(listing.currency)} {formatNumber(listing.unit_price)}
                          </span>
                        </div>
                        <div className="shop-row-actions">
                          <span className="shop-price">
                            Total: {formatCurrency(listing.currency)} {formatNumber(listing.unit_price * listing.quantity)}
                          </span>
                          <button
                            className="shop-buy-button"
                            type="button"
                            disabled={busyId === `listing-${listing.id}`}
                            onClick={() => buyListing(listing)}
                          >
                            {busyId === `listing-${listing.id}` ? "Comprando..." : "Comprar"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="shop-empty">
                  Ainda não existem anúncios de outros jogadores.
                </div>
              )}
            </>
          )}

          {activeTab === "Minhas vendas" && (
            <>
              <h2 className="shop-section-title">Publicar um anúncio</h2>
              <form className="shop-form" onSubmit={createListing}>
                <label>
                  Item do inventário
                  <select
                    value={listingItem}
                    onChange={(event) => setListingItem(event.target.value)}
                    required
                  >
                    <option value="">Selecione um item</option>
                    {inventory
                      .filter((entry) => itemMap[String(entry.item_id)]?.is_tradeable !== false)
                      .map((entry) => (
                        <option key={entry.id} value={entry.item_id}>
                          {getItemName(entry.item_id)} — {entry.quantity} disponível(is)
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Quantidade
                  <input
                    type="number"
                    min="1"
                    max={inventory.find((entry) => String(entry.item_id) === listingItem)?.quantity || 1}
                    value={listingQuantity}
                    onChange={(event) => setListingQuantity(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Moeda
                  <select
                    value={listingCurrency}
                    onChange={(event) => setListingCurrency(event.target.value)}
                  >
                    <option value="gold">Ouro</option>
                    <option value="crystals">Cristais</option>
                  </select>
                </label>

                <label>
                  Preço por unidade
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={listingPrice}
                    onChange={(event) => setListingPrice(event.target.value)}
                    placeholder="Ex.: 100"
                    required
                  />
                </label>

                <button
                  className="shop-action-button shop-form-wide"
                  type="submit"
                  disabled={busyId === "create-listing" || inventory.length === 0}
                >
                  {busyId === "create-listing" ? "Publicando..." : "Publicar anúncio"}
                </button>
              </form>

              <h2 className="shop-section-title">Seus anúncios ativos</h2>
              {myListings.length > 0 ? (
                <div className="shop-list">
                  {myListings.map((listing) => (
                    <div className="shop-row" key={listing.id}>
                      <div className="shop-row-main">
                        <strong>{getItemName(listing.item_id)}</strong>
                        <span>
                          Quantidade: {listing.quantity}
                          {" · "}Preço unitário: {formatCurrency(listing.currency)} {formatNumber(listing.unit_price)}
                        </span>
                      </div>
                      <div className="shop-row-actions">
                        <button
                          className="shop-secondary-button"
                          type="button"
                          disabled={busyId === `cancel-${listing.id}`}
                          onClick={() => cancelListing(listing)}
                        >
                          {busyId === `cancel-${listing.id}` ? "Cancelando..." : "Cancelar anúncio"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="shop-empty">
                  Você ainda não possui anúncios ativos.
                </div>
              )}
            </>
          )}

          {activeTab === "Craft" && (
            <>
              <h2 className="shop-section-title">Oficina de fabricação</h2>
              {recipes.length > 0 ? (
                <div className="shop-grid">
                  {recipes.map((recipe) => {
                    const materials = getMaterials(recipe.id);
                    const resultName = getItemName(recipe.result_item_id);

                    return (
                      <article className="shop-card" key={recipe.id}>
                        <div className="shop-card-image">⚒</div>
                        <div className="shop-card-body">
                          <span className="shop-card-category">Receita de fabricação</span>
                          <h3>{resultName}</h3>
                          <p>Produz {formatNumber(recipe.result_quantity)} unidade(s) por fabricação.</p>
                          <div className="shop-recipe-materials">
                            <strong>Materiais necessários:</strong>
                            {materials.length > 0 ? (
                              materials.map((material) => (
                                <div key={material.id}>
                                  {getItemName(material.material_item_id)}: {material.quantity}
                                </div>
                              ))
                            ) : (
                              <div>Nenhum material cadastrado nesta receita.</div>
                            )}
                          </div>
                          <div className="shop-card-footer">
                            <span className="shop-price">Nível {recipe.required_level || 1}</span>
                            <button
                              className="shop-buy-button"
                              type="button"
                              disabled={busyId === `craft-${recipe.id}`}
                              onClick={() => craftItem(recipe)}
                            >
                              {busyId === `craft-${recipe.id}` ? "Fabricando..." : "Fabricar"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="shop-empty">
                  Nenhuma receita foi cadastrada ainda.
                  <br />
                  As receitas criadas pelo administrador aparecerão aqui.
                </div>
              )}
            </>
          )}

          {activeTab === "Histórico" && (
            <div className="shop-info">
              <strong>Histórico de transações ainda não disponível.</strong>
              <br />
              O SQL atual registra inventário e anúncios, mas não possui uma tabela específica
              para guardar o histórico de compras, vendas e fabricação. Por isso, esta aba
              ainda não exibe transações antigas. Nenhuma informação será inventada.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SettingsPage({ theme, onThemeChange }) {
  return (
    <section className="settings-page">
      <style>{`
        .settings-page{max-width:900px;margin:0 auto;color:var(--settings-text,#f4efff)}
        .settings-page .settings-heading{margin-bottom:24px}
        .settings-page .settings-kicker{font-size:11px;letter-spacing:2px;font-weight:800;color:#a78bfa}
        .settings-page h1{margin:8px 0;font-size:clamp(28px,4vw,36px)}
        .settings-page .settings-subtitle{color:var(--settings-muted,#a49eb2);line-height:1.6;margin:0}
        .settings-panel{border:1px solid var(--settings-border,rgba(255,255,255,.09));background:var(--settings-card,rgba(23,22,34,.8));border-radius:16px;padding:22px;margin-bottom:16px}
        .settings-panel h2{margin:0 0 8px;font-size:18px}
        .settings-panel p{color:var(--settings-muted,#a49eb2);margin:0;line-height:1.6}
        .settings-theme-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
        .settings-theme-option{display:flex;align-items:center;gap:12px;text-align:left;padding:15px;border-radius:12px;border:1px solid var(--settings-border,rgba(255,255,255,.12));background:var(--settings-option,rgba(255,255,255,.025));color:inherit;cursor:pointer;font:inherit}
        .settings-theme-option[aria-pressed="true"]{border-color:#9b82ed;box-shadow:0 0 0 1px #9b82ed;background:rgba(124,91,199,.13)}
        .settings-theme-preview{width:44px;height:44px;border-radius:10px;flex:0 0 44px;border:1px solid #b9b2ca;display:flex;align-items:center;justify-content:center;font-size:21px}
        .settings-theme-preview.dark{background:#211d30;color:#d7c9ff}.settings-theme-preview.light{background:#f5f2fc;color:#5c477f}
        .settings-theme-option strong,.settings-theme-option small{display:block}.settings-theme-option small{color:var(--settings-muted,#a49eb2);margin-top:4px;font-size:12px}
        @media(max-width:560px){.settings-theme-options{grid-template-columns:1fr}.settings-panel{padding:17px}}
      `}</style>
      <header className="settings-heading"><span className="settings-kicker">PREFERÊNCIAS</span><h1>Configurações</h1><p className="settings-subtitle">Personalize a aparência do AstraRpg.</p></header>
      <section className="settings-panel">
        <h2>Aparência</h2><p>Escolha entre o modo escuro e o modo claro. Sua escolha fica salva neste navegador.</p>
        <div className="settings-theme-options" role="group" aria-label="Tema do site">
          <button type="button" className="settings-theme-option" aria-pressed={theme === "dark"} onClick={() => onThemeChange("dark")}><span className="settings-theme-preview dark">☾</span><span><strong>Modo escuro</strong><small>Visual original do AstraRpg</small></span></button>
          <button type="button" className="settings-theme-option" aria-pressed={theme === "light"} onClick={() => onThemeChange("light")}><span className="settings-theme-preview light">☀</span><span><strong>Modo claro</strong><small>Fundos claros e texto escuro</small></span></button>
        </div>
      </section>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [activePage, setActivePage] = useState("Início");
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("astrarpg-theme") === "light" ? "light" : "dark"; } catch { return "dark"; } });
  const changeTheme = (nextTheme) => { setTheme(nextTheme); try { localStorage.setItem("astrarpg-theme", nextTheme); } catch {} };
  useEffect(() => {
    // Publica o tema no documento inteiro para que estilos de todas as páginas o respeitem.
    try {
      document.documentElement.setAttribute("data-astrarpg-theme", theme);
      document.body.setAttribute("data-astrarpg-theme", theme);
    } catch {}
  }, [theme]);
  const [clicks, setClicks] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [easterEggReward, setEasterEggReward] = useState(null);
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [siteBanners, setSiteBanners] = useState([]);
  useEffect(() => {
    let live = true;
    supabase.from("site_banners").select("id,banner_type,title,description,image_url,button_text,button_target,sort_order").eq("is_active", true).order("sort_order", { ascending: true }).then(({ data }) => { if (live) setSiteBanners(data || []); });
    return () => { live = false; };
  }, []);
  const audioRef = useRef(null);
  const noticeTimer = useRef(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error("Erro ao recuperar sessão:", error.message);
      setUser(data?.session?.user ?? null);
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (event === "PASSWORD_RECOVERY") {
        // A tela de autenticação identifica o fluxo pelo hash de recuperação.
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPlayerProfile() {
      if (!user) {
        setPlayerProfile(null);
        setProfileError("");
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError("");

      const { data, error: loadError } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      if (loadError) {
        setProfileError(`Não foi possível carregar sua ficha: ${loadError.message}`);
        setProfileLoading(false);
        return;
      }

      if (data?.race_id) {
        const { data: raceData, error: raceError } = await supabase
          .from("races")
          .select("name, description")
          .eq("id", data.race_id)
          .maybeSingle();

        if (!active) return;
        if (raceError) {
          console.error("Não foi possível carregar os dados da raça:", raceError.message);
        }
        setPlayerProfile({
          ...data,
          race_name: raceData?.name || null,
          race_description: raceData?.description || null,
        });
      } else {
        setPlayerProfile(data || null);
      }

      setProfileLoading(false);
    }

    loadPlayerProfile();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    audioRef.current = new Audio("/audio/easter-egg.mp3");
    audioRef.current.preload = "auto";
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  function showNotice(message) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2600);
  }

  function playCharacterSound() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      showNotice("Clique novamente para ativar o som.");
    });
  }

  function handleCharacterClick() {
    playCharacterSound();
    if (clicks >= 20) return;

    const nextClick = clicks + 1;
    setClicks(nextClick);

    if (nextClick >= 15 && nextClick < 20) {
      showNotice(`${20 - nextClick} cliques restantes`);
    }

    if (nextClick === 20) {
      window.setTimeout(async () => {
        if (user) {
          const { data, error } = await supabase.rpc("astrarpg_claim_easter_egg");
          if (error) { console.error("Easter Egg:", error.message); }
          else if (data?.success) setEasterEggReward(data.item_name || "Item surpresa");
          else if (data?.item_name) setEasterEggReward(data.item_name);
        }
        setShowReward(true);
      }, 350);
    }
  }

  function handleNavigation(item) {
    setActivePage(item);
  }

  function handleDestination(destination) {
    setActivePage(destination);
  }

  async function refreshPlayerProfile() {
    if (!user) return;

    const { data, error: refreshError } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (refreshError) {
      showNotice(`Não foi possível atualizar sua carteira: ${refreshError.message}`);
      return;
    }

    if (data) {
      setPlayerProfile((current) => ({
        ...current,
        ...data,
      }));
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) showNotice(`Não foi possível sair: ${signOutError.message}`);
    setSigningOut(false);
  }

  if (!authReady) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-mark">✦</div>
        <span>Preparando o AstraRpg...</span>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (profileLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-mark">✦</div>
        <span>Carregando sua ficha...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="auth-loading auth-loading--error">
        <p>{profileError}</p>
        <button className="login-button" type="button" onClick={() => setUser({ ...user })}>Tentar novamente</button>
        <button className="auth-text-button" type="button" onClick={handleSignOut}>Sair da conta</button>
      </div>
    );
  }

  if (!playerProfile || !playerProfile.character_created) {
    return (
      <CharacterCreation
        user={user}
        onCreated={(createdProfile) => setPlayerProfile(createdProfile)}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className={`site-shell ${theme === "light" ? "theme-light" : ""}`}>
      <style>{`
        .site-shell.theme-light{background:#f4f2fa;color:#282338;--settings-text:#282338;--settings-muted:#6c667b;--settings-border:rgba(67,49,104,.16);--settings-card:#fff;--settings-option:#f8f6fc}
        .site-shell.theme-light .topbar{background:rgba(255,255,255,.96);border-bottom-color:#e5e0ef;color:#302844}
        .site-shell.theme-light .brand-name,.site-shell.theme-light .user-email{color:#302844}
        .site-shell.theme-light .sidebar{background:#fff;border-right-color:#e6e1ef}
        .site-shell.theme-light .sidebar-heading,.site-shell.theme-light .sidebar-footer{color:#777087}
        .site-shell.theme-light .nav-link{color:#625b73}
        .site-shell.theme-light .nav-link:hover,.site-shell.theme-light .nav-link--active{background:#eee8fb;color:#5e438f}
        .site-shell.theme-light .main-content{background:#f4f2fa;color:#282338}
        .site-shell.theme-light .wallet-label,.site-shell.theme-light .section-heading p,.site-shell.theme-light .welcome p{color:#716b80}
        .site-shell.theme-light .welcome h1,.site-shell.theme-light .section-heading h2,.site-shell.theme-light .mini-panel h3{color:#302844}
        .site-shell.theme-light .event-card,.site-shell.theme-light .mini-panel,.site-shell.theme-light .profile-info-card,.site-shell.theme-light .profile-section,.site-shell.theme-light .arp-box,.site-shell.theme-light .arp-call-room,.site-shell.theme-light .arp-call-active,.site-shell.theme-light .arp-panel,.site-shell.theme-light .arp-card{background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .profile-hero{background:linear-gradient(120deg,#eee7fb,#fff);border-color:#e1d7f4}
        .site-shell.theme-light .profile-identity h2,.site-shell.theme-light .profile-section h3,.site-shell.theme-light .profile-info-card strong,.site-shell.theme-light .profile-detail strong,.site-shell.theme-light .profile-inventory-item strong,.site-shell.theme-light .arp-box h2,.site-shell.theme-light .arp-box h3{color:#302844!important}
        .site-shell.theme-light .profile-email,.site-shell.theme-light .profile-heading p,.site-shell.theme-light .profile-description,.site-shell.theme-light .profile-empty,.site-shell.theme-light .arp-muted{color:#716b80!important}
        .site-shell.theme-light .profile-detail,.site-shell.theme-light .profile-stat,.site-shell.theme-light .profile-inventory-item{background:#f7f5fb!important;border-color:#e7e1f0!important}
        .site-shell.theme-light .profile-stat span,.site-shell.theme-light .profile-detail span{color:#625b73}
        .site-shell.theme-light .arp-form input,.site-shell.theme-light .arp-form textarea,.site-shell.theme-light .arp-form select,.site-shell.theme-light input,.site-shell.theme-light textarea,.site-shell.theme-light select{background:#fff;color:#302844;border-color:#d8d0e7}
        .site-shell.theme-light .site-footer{color:#716b80}
        /* Tema claro global: aplica a todas as páginas e componentes, não só às opções de tema. */
        .site-shell.theme-light{background:#f4f2fa!important;color:#282338!important;color-scheme:light;}
        .site-shell.theme-light .layout,.site-shell.theme-light .main-content,.site-shell.theme-light .profile-page,.site-shell.theme-light .settings-page,.site-shell.theme-light .section-block,.site-shell.theme-light .shop-section,.site-shell.theme-light .shop-toolbar{background:#f4f2fa!important;color:#282338!important}
        .site-shell.theme-light .welcome,.site-shell.theme-light .section-heading,.site-shell.theme-light .shop-heading,.site-shell.theme-light .settings-heading,.site-shell.theme-light .profile-heading,.site-shell.theme-light .arp-page,.site-shell.theme-light .arp-head{color:#302844!important}
        .site-shell.theme-light .welcome h1,.site-shell.theme-light .welcome h2,.site-shell.theme-light .section-heading h2,.site-shell.theme-light .shop-heading h1,.site-shell.theme-light .shop-section-title,.site-shell.theme-light .settings-heading h1,.site-shell.theme-light .profile-heading h1,.site-shell.theme-light .arp-head h1,.site-shell.theme-light .arp-box h2,.site-shell.theme-light .arp-empty h2,.site-shell.theme-light .arp-card h2,.site-shell.theme-light .arp-player h2,.site-shell.theme-light .arp-world h3,.site-shell.theme-light .arp-call-room h3,.site-shell.theme-light .arp-call-modal h2,.site-shell.theme-light .arp-mission h2{color:#302844!important}
        .site-shell.theme-light p,.site-shell.theme-light .welcome p,.site-shell.theme-light .section-heading p,.site-shell.theme-light .settings-subtitle,.site-shell.theme-light .profile-description,.site-shell.theme-light .profile-empty,.site-shell.theme-light .arp-head p,.site-shell.theme-light .arp-muted,.site-shell.theme-light .arp-loading,.site-shell.theme-light .arp-empty p,.site-shell.theme-light .arp-card p,.site-shell.theme-light .arp-player p,.site-shell.theme-light .arp-world p,.site-shell.theme-light .arp-mission p,.site-shell.theme-light .arp-call p{color:#716b80!important}
        .site-shell.theme-light .event-card,.site-shell.theme-light .mini-panel,.site-shell.theme-light .shop-card,.site-shell.theme-light .shop-row,.site-shell.theme-light .shop-info,.site-shell.theme-light .shop-recipe-materials,.site-shell.theme-light .shop-empty,.site-shell.theme-light .shop-loading,.site-shell.theme-light .shop-error,.site-shell.theme-light .profile-hero,.site-shell.theme-light .profile-info-card,.site-shell.theme-light .profile-section,.site-shell.theme-light .profile-detail,.site-shell.theme-light .profile-stat,.site-shell.theme-light .profile-inventory-item,.site-shell.theme-light .settings-panel,.site-shell.theme-light .arp-box,.site-shell.theme-light .arp-card,.site-shell.theme-light .arp-player,.site-shell.theme-light .arp-empty,.site-shell.theme-light .arp-list-simple>div,.site-shell.theme-light .arp-offices>div,.site-shell.theme-light .arp-world article,.site-shell.theme-light .arp-call-room,.site-shell.theme-light .arp-call-active,.site-shell.theme-light .arp-call,.site-shell.theme-light .arp-chat,.site-shell.theme-light .arp-chat-scroll,.site-shell.theme-light .arp-call-modal,.site-shell.theme-light .arp-player-edit{background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .profile-hero{background:linear-gradient(120deg,#eee7fb,#fff)!important}
        .site-shell.theme-light .profile-detail,.site-shell.theme-light .profile-stat,.site-shell.theme-light .profile-inventory-item,.site-shell.theme-light .arp-empty>div,.site-shell.theme-light .arp-player>div,.site-shell.theme-light .arp-call-avatar,.site-shell.theme-light .arp-msg,.site-shell.theme-light .arp-call-active,.site-shell.theme-light .arp-mission>span{background:#f3effa!important;color:#5e438f!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .arp-msg.mine{background:#e8def9!important}
        .site-shell.theme-light .arp-msg span,.site-shell.theme-light .arp-msg b,.site-shell.theme-light .arp-msg small,.site-shell.theme-light .arp-list-simple strong,.site-shell.theme-light .arp-list-simple span,.site-shell.theme-light .arp-offices strong,.site-shell.theme-light .arp-call-member,.site-shell.theme-light .arp-remote-audio>div{color:#514765!important}
        .site-shell.theme-light .shop-card-body,.site-shell.theme-light .shop-card-footer,.site-shell.theme-light .shop-row-main,.site-shell.theme-light .shop-row-actions,.site-shell.theme-light .mini-panel-icon{color:#302844!important}
        .site-shell.theme-light .shop-card-category,.site-shell.theme-light .shop-price,.site-shell.theme-light .profile-email,.site-shell.theme-light .profile-stat span,.site-shell.theme-light .profile-detail span,.site-shell.theme-light .arp-form label{color:#625b73!important}
        .site-shell.theme-light input:not([type="checkbox"]):not([type="radio"]),.site-shell.theme-light textarea,.site-shell.theme-light select,.site-shell.theme-light .arp-form input,.site-shell.theme-light .arp-form textarea,.site-shell.theme-light .arp-form select,.site-shell.theme-light .arp-search,.site-shell.theme-light .arp-call input,.site-shell.theme-light .arp-call-modal input{background:#fff!important;color:#302844!important;border-color:#d8d0e7!important;color-scheme:light}
        .site-shell.theme-light input::placeholder,.site-shell.theme-light textarea::placeholder{color:#938ba3!important;opacity:1}
        .site-shell.theme-light .arp-tabs button,.site-shell.theme-light .settings-theme-option,.site-shell.theme-light .shop-tabs button,.site-shell.theme-light .shop-secondary-button{background:#fff!important;color:#625b73!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .arp-tabs .active,.site-shell.theme-light .shop-tabs button.active{background:#eee8fb!important;color:#5e438f!important;border-color:#d7ccec!important}
        .site-shell.theme-light .arp-player-select{background:#f3effa!important;color:#514765!important}
        .site-shell.theme-light .banner-decoration,.site-shell.theme-light .banner-star{opacity:.45}
        .site-shell.theme-light .secondary-banner-card{background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .toast{background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}

        /* Tema claro global reforçado: sobrescreve fundos escuros definidos diretamente nas páginas. */
        html[data-astrarpg-theme="light"],body[data-astrarpg-theme="light"]{background:#f4f2fa!important;color:#302844!important;color-scheme:light}
        .site-shell.theme-light{min-height:100vh;background:#f4f2fa!important;color:#302844!important}
        .site-shell.theme-light .layout,.site-shell.theme-light .main-content,.site-shell.theme-light .section-block,.site-shell.theme-light .shop-section,.site-shell.theme-light .shop-toolbar,.site-shell.theme-light .settings-page,.site-shell.theme-light .profile-page{background:#f4f2fa!important;color:#302844!important}
        .site-shell.theme-light .topbar,.site-shell.theme-light .sidebar{background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}
        .site-shell.theme-light :is(.event-card,.mini-panel,.settings-panel,.shop-card,.shop-row,.shop-info,.shop-recipe-materials,.shop-empty,.shop-loading,.shop-error,.profile-hero,.profile-info-card,.profile-section,.profile-detail,.profile-stat,.profile-inventory-item,.secondary-banner-card,.arp-box,.arp-card,.arp-player,.arp-empty,.arp-list-simple>div,.arp-offices>div,.arp-world article,.arp-call-room,.arp-call-active,.arp-call,.arp-chat,.arp-chat-scroll,.arp-call-modal,.arp-player-edit,.arp-admin-row,.admin-panel,.admin-card,.modal-content,.toast){background:#fff!important;color:#302844!important;border-color:#e5e0ef!important}
        .site-shell.theme-light :is(.profile-detail,.profile-stat,.profile-inventory-item,.arp-empty>div,.arp-player>div,.arp-call-avatar,.arp-msg,.arp-call-active,.arp-mission>span,.arp-player-select){background:#f3effa!important;color:#514765!important;border-color:#e5e0ef!important}
        .site-shell.theme-light :is(h1,h2,h3,h4,p,label,small,strong,b,li,a,span,summary,legend,dt,dd):not(button *):not(.hero-banner *):not(.welcome .eyebrow):not(.nav-symbol):not(.wallet-icon){color:#302844!important}
        .site-shell.theme-light :is(.sidebar-heading,.sidebar-footer,.wallet-label,.section-heading p,.welcome p,.profile-email,.profile-heading p,.profile-description,.profile-empty,.arp-muted,.arp-head p,.arp-loading,.arp-empty p,.arp-card p,.arp-player p,.arp-world p,.arp-mission p,.arp-call p,.shop-card-category,.shop-price,.arp-form label){color:#716b80!important}
        .site-shell.theme-light input:not([type="checkbox"]):not([type="radio"]),.site-shell.theme-light textarea,.site-shell.theme-light select,.site-shell.theme-light .arp-form input,.site-shell.theme-light .arp-form textarea,.site-shell.theme-light .arp-form select,.site-shell.theme-light .arp-search,.site-shell.theme-light .arp-call input,.site-shell.theme-light .arp-call-modal input{background:#fff!important;color:#302844!important;border-color:#d8d0e7!important;color-scheme:light}
        .site-shell.theme-light input::placeholder,.site-shell.theme-light textarea::placeholder{color:#938ba3!important;opacity:1}
        .site-shell.theme-light .nav-link{color:#625b73!important}.site-shell.theme-light .nav-link:hover,.site-shell.theme-light .nav-link--active{background:#eee8fb!important;color:#5e438f!important}
        .site-shell.theme-light .hero-banner{color:#fff!important}.site-shell.theme-light .hero-banner *{color:#fff!important}
        .site-shell.theme-light button{color:inherit}.site-shell.theme-light .login-button,.site-shell.theme-light .arp-actions button,.site-shell.theme-light .arp-form button,.site-shell.theme-light .arp-mission button,.site-shell.theme-light .arp-chat button,.site-shell.theme-light .arp-call button,.site-shell.theme-light .arp-admin-row button,.site-shell.theme-light .arp-list-simple button,.site-shell.theme-light .arp-call-join,.site-shell.theme-light .arp-call-fab{color:#fff!important}
        .site-shell.theme-light .arp-tabs button,.site-shell.theme-light .settings-theme-option,.site-shell.theme-light .shop-tabs button,.site-shell.theme-light .shop-secondary-button{background:#fff!important;color:#625b73!important;border-color:#e5e0ef!important}
        .site-shell.theme-light .arp-tabs .active,.site-shell.theme-light .shop-tabs button.active{background:#eee8fb!important;color:#5e438f!important;border-color:#d7ccec!important}
        .site-shell.theme-light .banner-decoration,.site-shell.theme-light .banner-star{opacity:.45}
      `}</style>
      <AstraRpgPagesStyle />
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => handleNavigation("Início")}
          aria-label="AstraRpg - início"
        >
          <span className="brand-mark">✦</span>
          <span className="brand-name">Astra<span>Rpg</span></span>
        </button>

        <div className="wallet" aria-label="Carteira do jogador">
          <div className="wallet-item">
            <span className="wallet-icon wallet-icon--gold">◈</span>
            <span className="wallet-value">{Number(playerProfile.gold || 0).toLocaleString("pt-BR")}</span>
            <span className="wallet-label">Ouro</span>
          </div>
          <div className="wallet-item">
            <span className="wallet-icon wallet-icon--crystal">◆</span>
            <span className="wallet-value">{Number(playerProfile.crystals || 0).toLocaleString("pt-BR")}</span>
            <span className="wallet-label">Cristais</span>
          </div>
          <span className="user-email" title={user.email}>{user.email}</span>
          <button className="login-button" type="button" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="Menu principal">
          <div className="sidebar-heading">MENU PRINCIPAL</div>
          <nav className="navigation">
            {navigation.map((item, index) => (
              <button
                className={`nav-link ${activePage === item ? "nav-link--active" : ""}`}
                key={item}
                type="button"
                onClick={() => handleNavigation(item)}
              >
                <span className="nav-symbol">{navigationSymbols[index]}</span>
                {item}
                {item === "Eventos" && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span className="status-dot" />
            O mundo está esperando
          </div>
        </aside>

        <main className="main-content">
          {activePage === "Perfil" ? (
            <ProfilePage profile={playerProfile} user={user} />
          ) : activePage === "Loja" ? (
            <ShopPage user={user} onWalletRefresh={refreshPlayerProfile} showNotice={showNotice} />
          ) : activePage === "Novidades" ? (
            <NewsPage />
          ) : activePage === "Eventos" ? (
            <EventsPage onNavigate={handleNavigation} />
          ) : activePage === "Jogadores" ? (
            <PlayersPage />
          ) : activePage === "Clãs" ? (
            <ClansPage user={user} showNotice={showNotice} />
          ) : activePage === "Política" ? (
            <PoliticsPage />
          ) : activePage === "Mundo" ? (
            <WorldPage />
          ) : activePage === "Missões" ? (
            <MissionsPage user={user} showNotice={showNotice} />
          ) : activePage === "Dúvidas" ? (
            <SupportPage user={user} showNotice={showNotice} />
          ) : activePage === "Chat ao vivo" ? (
            <ChatPage user={user} />
          ) : activePage === "Call" ? (
            <CallPage user={user} />
          ) : activePage === "Admin" ? (
            <AdminPage user={user} showNotice={showNotice} />
          ) : activePage === "Configurações" ? (
            <SettingsPage theme={theme} onThemeChange={changeTheme} />
          ) : (
            <>
              <section className="welcome">
                <div className="eyebrow"><span /> SEU PRÓXIMO CAPÍTULO COMEÇA AQUI</div>
                <h1>Bem-vindo ao <span>AstraRpg</span></h1>
                <p>Um mundo de possibilidades espera por você. Crie sua história.</p>
              </section>

              <section className={`hero-banner ${siteBanners.find(b => b.banner_type === "main")?.image_url ? "hero-banner--custom" : ""}`} style={siteBanners.find(b => b.banner_type === "main")?.image_url ? { backgroundImage: `linear-gradient(90deg, rgba(70,54,111,.86), rgba(104,82,151,.28)), url("${siteBanners.find(b => b.banner_type === "main").image_url}")` } : undefined}>
                <div className="hero-banner-copy">
                  <span className="banner-kicker">{siteBanners.find(b => b.banner_type === "main")?.title ? "DESTAQUE" : "UM UNIVERSO, MIL HISTÓRIAS"}</span>
                  <h2>{siteBanners.find(b => b.banner_type === "main")?.title || <>Sua jornada<br />começa agora.</>}</h2>
                  <p>{siteBanners.find(b => b.banner_type === "main")?.description || "Construa seu personagem, encontre aliados e descubra o que existe além do horizonte."}</p>
                  <button className="primary-button" type="button" onClick={() => handleNavigation(siteBanners.find(b => b.banner_type === "main")?.button_target || "Missões")}>
                    {siteBanners.find(b => b.banner_type === "main")?.button_text || "Começar aventura"} <span>→</span>
                  </button>
                </div>
                <div className="banner-decoration banner-decoration--one" />
                <div className="banner-decoration banner-decoration--two" />
                <div className="banner-star">✦</div>
              </section>

              {siteBanners.some(b => b.banner_type === "secondary") && <section className="section-block secondary-banners-block">
                <div className="section-heading"><div><span className="section-kicker">EXPLORE MAIS</span><h2>Novidades e destaques</h2></div></div>
                <div className="secondary-banner-grid">{siteBanners.filter(b => b.banner_type === "secondary").map(b => <article className="secondary-banner-card" key={b.id}>
                  {b.image_url && <img src={b.image_url} alt=""/>}<div><h3>{b.title}</h3><p>{b.description}</p>{b.button_text && <button type="button" onClick={() => handleNavigation(b.button_target || "Eventos")}>{b.button_text} →</button>}</div>
                </article>)}</div>
              </section>}

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <span className="section-kicker">FIQUE POR DENTRO</span>
                    <h2>Destaques do mundo</h2>
                  </div>
                  <button className="text-button" type="button" onClick={() => handleDestination("Eventos")}>Ver eventos <span>→</span></button>
                </div>

                <div className="feature-grid">
                  {featuredEvents.map((event) => (
                    <article className={`event-card ${event.style}`} key={event.title}>
                      <div className="event-card-art" aria-hidden="true"><span>✧</span></div>
                      <div className="event-card-content">
                        <span className="card-tag">{event.tag}</span>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <button type="button" onClick={() => handleDestination(event.destination)}>
                          {event.action} <span>→</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section-block lower-grid">
                <article className="mini-panel">
                  <div className="mini-panel-icon">♜</div>
                  <div>
                    <span className="section-kicker">COMUNIDADE</span>
                    <h3>Encontre seu clã</h3>
                    <p>Una forças com outros aventureiros.</p>
                  </div>
                  <button type="button" aria-label="Ver clãs" onClick={() => handleDestination("Clãs")}>→</button>
                </article>
                <article className="mini-panel">
                  <div className="mini-panel-icon mini-panel-icon--blue">⚔</div>
                  <div>
                    <span className="section-kicker">AVENTURAS</span>
                    <h3>Missões disponíveis</h3>
                    <p>Desafios e recompensas aguardam.</p>
                  </div>
                  <button type="button" aria-label="Ver missões" onClick={() => handleDestination("Missões")}>→</button>
                </article>
              </section>

              <footer className="site-footer">ASTRARPG <span>•</span> SEU MUNDO, SUA HISTÓRIA</footer>
            </>
          )}
        </main>
      </div>

      {activePage === "Início" && (
        <button
          className="character-trigger"
          type="button"
          onClick={handleCharacterClick}
          aria-label="Clique na personagem para descobrir um segredo"
          title="Clique para descobrir um segredo"
        >
          <picture>
            <source media="(max-width: 700px)" srcSet="/characters/personagem-mobile.png" />
            <img src="/characters/personagem-pc.png" alt="Personagem do AstraRpg" />
          </picture>
          <span className="character-hint">Psst... ✦</span>
        </button>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}

      {showReward && (
        <div className="reward-overlay" role="dialog" aria-modal="true" aria-labelledby="reward-title">
          <div className="reward-box">
            <button className="reward-close" type="button" onClick={() => setShowReward(false)} aria-label="Fechar">×</button>
            <div className="gift-animation" aria-hidden="true"><span>🎁</span><i>✦</i><b>✧</b></div>
            <span className="section-kicker">SEGREDO DESCOBERTO</span>
            <h2 id="reward-title">Você encontrou um presente!</h2>
            <p>Parabéns! Você completou os 20 cliques.</p>
            <div className="reward-item">✨ <span>{easterEggReward || "Item surpresa (entre na conta para receber a recompensa)"}</span></div>
            <button className="primary-button reward-button" type="button" onClick={() => setShowReward(false)}>Incrível!</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
