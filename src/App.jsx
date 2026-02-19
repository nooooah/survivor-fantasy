import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBw_D9jsLjTBtVdEyKokDR7MTayFHPlUMc",
  authDomain: "survivor-fantasy-cf5bd.firebaseapp.com",
  projectId: "survivor-fantasy-cf5bd",
  storageBucket: "survivor-fantasy-cf5bd.firebasestorage.app",
  messagingSenderId: "121170219746",
  appId: "1:121170219746:web:32207a0f22a17897bd04bb"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── DATA ───────────────────────────────────────────────────────────────────
// Tribes confirmed: Orange=Cila, Purple=Kalo, Teal=Vatu
const CAST = [
  { id: "christian", name: "Christian Hubicki",       seasons: "S37",             tribe: "Cila", emoji: "🤓", fact: "PhD roboticist who solved puzzles faster than anyone in S37 history." },
  { id: "cirie",     name: "Cirie Fields",            seasons: "S12,S16,S20,S34", tribe: "Cila", emoji: "👑", fact: "Never won an individual immunity challenge in 4 seasons — yet made it deep every time purely on social mastery." },
  { id: "emily",     name: "Emily Flippen",           seasons: "S45",             tribe: "Cila", emoji: "📈", fact: "Started as the most disliked player on her tribe and pulled off one of the best redemption arcs ever." },
  { id: "jenna",     name: "Jenna Lewis-Dougherty",  seasons: "S1, S8",          tribe: "Cila", emoji: "🌺", fact: "One of the original Borneo castaways — was on the very first season of Survivor ever aired." },
  { id: "joe",       name: "Joe Hunter",              seasons: "S48",             tribe: "Cila", emoji: "🦅", fact: "A firefighter whose social game kept him safe deep into S48 despite being a physical threat." },
  { id: "ozzy",      name: "Ozzy Lusth",              seasons: "S13,S16,S23,S34", tribe: "Cila", emoji: "🌊", fact: "Holds the record for most individual immunity wins in a single season (5) and is considered the greatest challenge beast ever." },
  { id: "rick",      name: "Rick Devens",             seasons: "S38",             tribe: "Cila", emoji: "📺", fact: "Was voted out, came back from Edge of Extinction, found 2 idols, and nearly won — all while being a local news anchor." },
  { id: "savannah",  name: "Savannah Louie",          seasons: "S49 (Winner)",    tribe: "Cila", emoji: "⭐", fact: "Won S49 without ever receiving a vote at Tribal Council the entire game." },
  { id: "angelina",  name: "Angelina Keeley",         seasons: "S37",             tribe: "Kalo", emoji: "✈️", fact: "Famously negotiated her way into a jacket at Tribal Council — and made a fake idol out of a napkin." },
  { id: "aubry",     name: "Aubry Bracco",            seasons: "S32, S34, S38",   tribe: "Kalo", emoji: "🦋", fact: "Lost Kaoh Rong by one jury vote after Michele flipped — one of the most debated finales ever." },
  { id: "colby",     name: "Colby Donaldson",         seasons: "S2, S8, S20",     tribe: "Kalo", emoji: "🤠", fact: "Infamously took Tina to the finals instead of Keith in S2, costing himself the million dollars." },
  { id: "genevieve", name: "Genevieve Mushaluk",      seasons: "S47",             tribe: "Kalo", emoji: "🌿", fact: "A corporate lawyer who dominated strategically and won S47 in a near-unanimous jury vote." },
  { id: "kyle",      name: "Kyle Fraser",             seasons: "S48 (Winner)",    tribe: "Kalo", emoji: "🥊", fact: "Won S48 after successfully navigating a tribe that kept losing immunity — the ultimate underdog winner." },
  { id: "q",         name: "Q Burdette",              seasons: "S46",             tribe: "Kalo", emoji: "⚡", fact: "Caused chaos in S46 by openly asking to be voted out at Tribal Council — then changed his mind mid-vote." },
  { id: "rizo",      name: "Rizo Velovic",            seasons: "S49",             tribe: "Kalo", emoji: "🎯", fact: "Played a quietly devastating strategic game in S49, orchestrating multiple blindsides without getting any blood on his hands." },
  { id: "stephenie", name: "Stephenie LaGrossa",      seasons: "S10, S11, S20",   tribe: "Kalo", emoji: "💪", fact: "Sole survivor of the Ulong tribe in Palau — the only tribe in history to lose every single immunity challenge." },
  { id: "charlie",   name: "Charlie Davis",           seasons: "S46",             tribe: "Vatu", emoji: "🎭", fact: "A law student who lost the S46 finale by one jury vote after being blindsided by Q's unpredictable game." },
  { id: "chrissy",   name: "Chrissy Hofbeck",         seasons: "S35",             tribe: "Vatu", emoji: "🧮", fact: "An actuary who used math and probability to calculate her way to the final 3 in Heroes vs. Healers vs. Hustlers." },
  { id: "coach",     name: "Coach Wade",              seasons: "S18, S20, S23",   tribe: "Vatu", emoji: "🐉", fact: "Self-proclaimed 'Dragon Slayer' who built a cult-like alliance in South Pacific and nearly won with it." },
  { id: "dee",       name: "Dee Valladares",          seasons: "S45 (Winner)",    tribe: "Vatu", emoji: "🏆", fact: "Won S45 by masterfully playing both sides of the merge while her closest ally Austin had no idea she was against him." },
  { id: "jonathan",  name: "Jonathan Young",          seasons: "S42",             tribe: "Vatu", emoji: "🦁", fact: "Single-handedly dragged a boat to shore in S42, cementing himself as one of the most physically dominant players ever." },
  { id: "kamilla",   name: "Kamilla Karthigesu",      seasons: "S44, S48",        tribe: "Vatu", emoji: "💼", fact: "Returned for S48 after a breakout S44 debut — one of only a few players to compete on back-to-back modern seasons." },
  { id: "mike",      name: "Mike White",              seasons: "S37",             tribe: "Vatu", emoji: "🎬", fact: "The writer/director of 'School of Rock' and 'The White Lotus' — and a legitimately great Survivor strategist." },
  { id: "tiffany",   name: "Tiffany Ervin",           seasons: "S46",             tribe: "Vatu", emoji: "🔥", fact: "Survived being on the wrong side of nearly every vote in S46 through sheer social charm and idol luck." },
];

const TRIBE_COLORS = {
  Cila: { bg: "#EA580C", light: "#FFF7ED", border: "#F97316" },  // orange
  Kalo: { bg: "#7C3AED", light: "#EDE9FE", border: "#8B5CF6" },  // purple
  Vatu: { bg: "#0D9488", light: "#F0FDFA", border: "#14B8A6" },  // teal
};

const SCORING_SYSTEM = [
  // Tribal Council
  { category: "Tribal Council", event: "Voted correctly at Tribal (Pre-Merge)", pts: 2,   icon: "🗳️" },
  { category: "Tribal Council", event: "Voted correctly at Tribal (Merge)",     pts: 4,   icon: "🗳️" },
  { category: "Tribal Council", event: "Received zero votes at Tribal (6+ left)", pts: 3, icon: "🛡️" },
  { category: "Tribal Council", event: "Survived Tribal while receiving votes", pts: 3,   icon: "😅" },
  { category: "Tribal Council", event: "First boot",                            pts: -5,  icon: "💀" },
  // Idols
  { category: "Idols", event: "Voted out with Idol in pocket",                  pts: -7,  icon: "🤦" },
  { category: "Idols", event: "Found Hidden Immunity Idol",                     pts: 5,   icon: "🗿" },
  { category: "Idols", event: "Won or found Idol Clue",                         pts: 2,   icon: "🔍" },
  { category: "Idols", event: "Played Idol for self successfully",              pts: 7,   icon: "✨" },
  { category: "Idols", event: "Played Idol for self unsuccessfully",            pts: -4,  icon: "😬" },
  { category: "Idols", event: "Played Idol on ally successfully",               pts: 6,   icon: "🤝" },
  { category: "Idols", event: "Played Idol on ally unsuccessfully",             pts: -2,  icon: "😬" },
  { category: "Idols", event: "Saved by another player's Idol",                 pts: 4,   icon: "🙏" },
  { category: "Idols", event: "With Hidden Immunity Idol at episode start",     pts: 1,   icon: "💎" },
  // Advantages
  { category: "Advantages", event: "Won or found an Advantage",                 pts: 3,   icon: "⚡" },
  { category: "Advantages", event: "Made fake Idol or Advantage",               pts: 2,   icon: "🎭" },
  { category: "Advantages", event: "Shot in the Dark success",                  pts: 6,   icon: "🎯" },
  { category: "Advantages", event: "Lost vote",                                 pts: -1,  icon: "🚫" },
  { category: "Advantages", event: "Played an Advantage that drove outcome",    pts: 5,   icon: "🎲" },
  { category: "Advantages", event: "Misplayed an Advantage",                    pts: -2,  icon: "💸" },
  // Immunity
  { category: "Immunity", event: "Tribal Immunity win (1st place)",             pts: 5,   icon: "🏆" },
  { category: "Immunity", event: "Tribal Immunity win (2nd place)",             pts: 3,   icon: "🥈" },
  { category: "Immunity", event: "Individual Immunity win",                     pts: 7,   icon: "🛡️" },
  { category: "Immunity", event: "Final Immunity win",                          pts: 10,  icon: "🏛️" },
  // Reward
  { category: "Reward", event: "Tribal Reward win (1st place)",                 pts: 3,   icon: "🎁" },
  { category: "Reward", event: "Tribal Reward win (2nd place)",                 pts: 2,   icon: "🎀" },
  { category: "Reward", event: "Individual Reward win",                         pts: 5,   icon: "🎖️" },
  { category: "Reward", event: "Picked for Individual Reward",                  pts: 2,   icon: "🤗" },
  // Risk & Penalties
  { category: "Risk & Penalties", event: "Medical evacuation",                  pts: -5,  icon: "🚑" },
  { category: "Risk & Penalties", event: "Quit the game",                       pts: -7,  icon: "🏳️" },
  // Others
  { category: "Others", event: "Mentioned episode title",                       pts: 1,   icon: "🎬" },
  { category: "Others", event: "Picked to go on a journey",                     pts: 2,   icon: "🚶" },
  { category: "Others", event: "Sits out a challenge",                          pts: -2,  icon: "🪑" },
  // Endgame
  { category: "Endgame", event: "Made Jury",                                    pts: 3,   icon: "⚖️" },
  { category: "Endgame", event: "Won Fire Making",                              pts: 5,   icon: "🔥" },
  { category: "Endgame", event: "2nd Runner-up",                                pts: 10,  icon: "🥉" },
  { category: "Endgame", event: "1st Runner-up",                                pts: 12,  icon: "🥈" },
  { category: "Endgame", event: "SOLE SURVIVOR",                                pts: 20,  icon: "🥥" },
];

// ─── FIRESTORE HELPERS ───────────────────────────────────────────────────────
async function saveScoresToDB(data) {
  try { await setDoc(doc(db, "fantasy", "scores"), data); } catch (e) { console.error(e); }
}
async function savePlayersToDB(data) {
  try { await setDoc(doc(db, "fantasy", "players"), { list: data }); } catch (e) { console.error(e); }
}

// ─── DEFAULT STATE ────────────────────────────────────────────────────────────
function defaultCastawayScores() {
  const scores = {};
  CAST.forEach(c => {
    scores[c.id] = { pts: 0, events: [], eliminated: false, placement: null };
  });
  return scores;
}

function defaultFantasyPlayers() { return []; }

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SurvivorFantasy() {
  const [tab, setTab] = useState("leaderboard");
  const [castawayScores, setCastawayScores] = useState(defaultCastawayScores());
  const [fantasyPlayers, setFantasyPlayers] = useState(defaultFantasyPlayers());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Add event modal
  const [eventModal, setEventModal] = useState(null); // {castawayId}
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventNote, setEventNote] = useState("");

  // Add fantasy player modal
  const [playerModal, setPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPicks, setNewPlayerPicks] = useState([]);

  // Edit score modal
  const [editModal, setEditModal] = useState(null); // {castawayId, eventIdx}

  // ── Real-time Firestore listeners ──
  useEffect(() => {
    // Listen to scores
    const unsubScores = onSnapshot(doc(db, "fantasy", "scores"), (snap) => {
      if (snap.exists()) {
        setCastawayScores({ ...defaultCastawayScores(), ...snap.data() });
      }
      setLoading(false);
    }, () => setLoading(false));

    // Listen to players
    const unsubPlayers = onSnapshot(doc(db, "fantasy", "players"), (snap) => {
      if (snap.exists()) setFantasyPlayers(snap.data().list || []);
    });

    return () => { unsubScores(); unsubPlayers(); };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateScores = useCallback((newScores) => {
    setCastawayScores(newScores);
    saveScoresToDB(newScores);
  }, []);

  const updatePlayers = useCallback((newPlayers) => {
    setFantasyPlayers(newPlayers);
    savePlayersToDB(newPlayers);
  }, []);

  // Add event to castaway
  const addEvent = () => {
    if (selectedEvent === null || selectedEvent === undefined || !eventModal) return;
    const evt = SCORING_SYSTEM[selectedEvent];
    const newScores = { ...castawayScores };
    const entry = newScores[eventModal];
    entry.pts += evt.pts;
    entry.events = [...(entry.events || []), {
      event: evt.event, pts: evt.pts, icon: evt.icon,
      note: eventNote.trim(), ts: new Date().toISOString()
    }];
    if (evt.event.includes("Voted Out")) entry.eliminated = true;
    updateScores(newScores);
    setEventModal(null);
    setSelectedEvent(null);
    setEventNote("");
    showToast(`${evt.pts > 0 ? "+" : ""}${evt.pts} pts for ${CAST.find(c=>c.id===eventModal).name}`);
  };

  const removeEvent = (castawayId, idx) => {
    const newScores = { ...castawayScores };
    const entry = newScores[castawayId];
    const removed = entry.events[idx];
    entry.pts -= removed.pts;
    entry.events = entry.events.filter((_, i) => i !== idx);
    updateScores(newScores);
    showToast("Event removed");
  };

  const toggleEliminated = (castawayId) => {
    const newScores = { ...castawayScores };
    newScores[castawayId].eliminated = !newScores[castawayId].eliminated;
    updateScores(newScores);
  };

  const addFantasyPlayer = () => {
    if (!newPlayerName.trim() || newPlayerPicks.length === 0) return;
    const player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      picks: newPlayerPicks,
    };
    updatePlayers([...fantasyPlayers, player]);
    setNewPlayerName("");
    setNewPlayerPicks([]);
    setPlayerModal(false);
    showToast(`${player.name} joined the fantasy draft!`);
  };

  const removeFantasyPlayer = (id) => {
    updatePlayers(fantasyPlayers.filter(p => p.id !== id));
    showToast("Player removed");
  };

  const getFantasyScore = (player) =>
    player.picks.reduce((sum, cid) => sum + (castawayScores[cid]?.pts || 0), 0);

  const sortedCastaways = CAST
    .map(c => ({ ...c, ...(castawayScores[c.id] || { pts: 0, events: [], eliminated: false }) }))
    .sort((a, b) => b.pts - a.pts);

  const sortedFantasyPlayers = [...fantasyPlayers]
    .map(p => ({ ...p, score: getFantasyScore(p) }))
    .sort((a, b) => b.score - a.score);

  if (loading) return (
    <div style={{
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#FFD700", fontFamily: "'Cinzel', serif", fontSize: 24
    }}>
      <span style={{animation: "pulse 1s infinite"}}>🌴 Loading Tribal Council...</span>
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #1a0a00 100%)",
      minHeight: "100vh", width: "100%", fontFamily: "'Cinzel Decorative', 'Cinzel', 'Georgia', serif",
      color: "#F5E6C8", userSelect: "none", margin: 0, padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; box-sizing: border-box; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a0a00; }
        ::-webkit-scrollbar-thumb { background: #B45309; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideIn { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media (max-width: 640px) { .leaderboard-grid { grid-template-columns: 1fr !important; } }
        .tab-btn { cursor:pointer; padding:10px 22px; border:none; border-radius:6px; font-family:inherit;
          font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; transition:all .2s; }
        .tab-btn:hover { transform:translateY(-2px); filter:brightness(1.15); }
        .tab-btn.active { box-shadow: 0 4px 20px rgba(255,215,0,.4); }
        .card { background:rgba(255,255,255,.04); border:1px solid rgba(255,215,0,.12);
          border-radius:12px; transition:all .2s; }
        .card:hover { background:rgba(255,255,255,.07); border-color:rgba(255,215,0,.25); }
        .castaway-row { cursor:pointer; padding:12px 16px; border-radius:10px;
          display:flex; align-items:center; gap:12px; transition:all .2s; margin-bottom:6px;
          border:1px solid transparent; }
        .castaway-row:hover { background:rgba(255,215,0,.06); border-color:rgba(255,215,0,.2); }
        .btn { cursor:pointer; border:none; border-radius:8px; font-family:inherit;
          font-weight:700; letter-spacing:1px; transition:all .2s; }
        .btn:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .btn:active { transform:translateY(0); }
        .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:100;
          display:flex; align-items:center; justify-content:center; animation:fadeIn .2s; }
        .modal { background:linear-gradient(145deg,#1a0a30,#0f0c29);
          border:1px solid rgba(255,215,0,.3); border-radius:16px;
          padding:28px; max-width:520px; width:90%; animation:slideIn .25s;
          max-height:85vh; overflow-y:auto; }
        .tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px;
          font-family:'Lato',sans-serif; font-weight:700; letter-spacing:1px; }
        .gold-gradient { background:linear-gradient(90deg,#FFD700,#FFA500,#FFD700);
          background-size:200% 100%; animation:shimmer 3s linear infinite;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        input,select,textarea { background:rgba(255,255,255,.06); border:1px solid rgba(255,215,0,.2);
          border-radius:8px; color:#F5E6C8; padding:10px 14px; font-family:'Lato',sans-serif;
          font-size:14px; outline:none; transition:border .2s; }
        input:focus,select:focus,textarea:focus { border-color:rgba(255,215,0,.6); }
        select option { background:#1a0a30; color:#F5E6C8; }
        .rank-1 { background:linear-gradient(90deg,rgba(255,215,0,.15),transparent); border-color:rgba(255,215,0,.4) !important; }
        .rank-2 { background:linear-gradient(90deg,rgba(192,192,192,.1),transparent); border-color:rgba(192,192,192,.3) !important; }
        .rank-3 { background:linear-gradient(90deg,rgba(205,127,50,.1),transparent); border-color:rgba(205,127,50,.3) !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign:"center", padding:"30px 20px 16px", borderBottom:"1px solid rgba(255,215,0,.15)" }}>
        <div style={{fontSize:11, letterSpacing:6, color:"#B45309", marginBottom:6, fontFamily:"'Lato',sans-serif"}}>SURVIVOR 50 · IN THE HANDS OF THE FANS</div>
        <h1 style={{margin:0, fontSize:"clamp(22px,5vw,42px)", fontWeight:700}} className="gold-gradient">
          🌴 Fantasy Draft 🌴
        </h1>
        <div style={{fontSize:11, color:"rgba(245,230,200,.5)", marginTop:6, fontFamily:"'Lato',sans-serif", letterSpacing:3}}>
          PREMIERES FEB 25, 2026 · CBS
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex", justifyContent:"center", gap:8, padding:"16px 20px", flexWrap:"wrap"}}>
        {[
          {key:"leaderboard", label:"🏆 Leaderboard"},
          {key:"castaways",   label:"🗿 Castaways"},
          {key:"fantasy",     label:"👥 Fantasy Players"},
          {key:"scoring",     label:"📋 Scoring Guide"},
        ].map(t => (
          <button key={t.key} className={`tab-btn${tab===t.key?" active":""}`}
            onClick={() => setTab(t.key)}
            style={{
              background: tab===t.key
                ? "linear-gradient(135deg,#B45309,#D97706)"
                : "rgba(255,255,255,.06)",
              color: tab===t.key ? "#fff" : "#c4a97a",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{width:"100%", padding:"0 24px 40px", boxSizing:"border-box"}}>

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <div style={{animation:"fadeIn .3s"}}>
            <div className="leaderboard-grid" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, alignItems:"start"}}>

              {/* LEFT: Castaway Point Leaders */}
              <div>
                <h2 style={{textAlign:"center", fontSize:13, letterSpacing:4, color:"#D97706", marginBottom:14, fontFamily:"'Lato',sans-serif", textTransform:"uppercase"}}>
                  🗿 Castaway Leaders
                </h2>
                {sortedCastaways.map((c, i) => {
                  const tc = TRIBE_COLORS[c.tribe];
                  const rankClass = i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
                  const managers = fantasyPlayers.filter(p => p.picks.includes(c.id));
                  return (
                    <div key={c.id} className={`card ${rankClass}`}
                      style={{border:"1px solid transparent", padding:"8px 10px", marginBottom:5,
                        display:"flex", alignItems:"center", gap:8, cursor:"pointer", borderRadius:9}}
                      onClick={() => setTab("castaways")}>
                      <div style={{width:24, textAlign:"center", fontSize:i<3?16:11,
                        color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#666", flexShrink:0}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                      </div>
                      <span style={{fontSize:22, flexShrink:0}}>{c.emoji}</span>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontWeight:700, fontSize:12, color: c.eliminated?"#555":"#F5E6C8",
                          textDecoration: c.eliminated?"line-through":"none",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                          {c.name}
                          {c.eliminated && <span style={{marginLeft:6, fontSize:9, color:"#ef4444"}}>OUT</span>}
                        </div>
                        <div style={{fontFamily:"'Lato',sans-serif", fontSize:10, marginTop:2, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap"}}>
                          <span className="tag" style={{background:tc.bg+"33", color:tc.border, border:`1px solid ${tc.border}44`, fontSize:9, padding:"1px 6px"}}>
                            {c.tribe}
                          </span>
                          {managers.map(m => (
                            <span key={m.id} style={{
                              background:"rgba(255,215,0,.08)", border:"1px solid rgba(255,215,0,.18)",
                              borderRadius:8, padding:"1px 5px", color:"#D97706", fontWeight:700, fontSize:9
                            }}>👤 {m.name}</span>
                          ))}
                          {managers.length === 0 && fantasyPlayers.length > 0 && (
                            <span style={{color:"#3a3a3a", fontSize:9}}>undrafted</span>
                          )}
                        </div>
                      </div>
                      <div style={{fontFamily:"'Cinzel Decorative',serif", fontSize:16, fontWeight:700, flexShrink:0,
                        color: c.pts>0?"#FFD700":c.pts<0?"#ef4444":"#666"}}>
                        {c.pts>0?"+":""}{c.pts}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT: Fantasy Player Standings */}
              <div>
                <h2 style={{textAlign:"center", fontSize:13, letterSpacing:4, color:"#D97706", marginBottom:14, fontFamily:"'Lato',sans-serif", textTransform:"uppercase"}}>
                  👥 Fantasy Standings
                </h2>
                {sortedFantasyPlayers.length === 0 ? (
                  <div style={{textAlign:"center", padding:"40px 16px", color:"#444",
                    fontFamily:"'Lato',sans-serif", fontSize:12, border:"1px dashed rgba(255,215,0,.1)",
                    borderRadius:10, lineHeight:1.8}}>
                    <div style={{fontSize:32, marginBottom:10}}>🌴</div>
                    No fantasy managers yet.<br/>
                    <span style={{color:"#D97706", cursor:"pointer", textDecoration:"underline"}}
                      onClick={() => setTab("fantasy")}>Add one here →</span>
                  </div>
                ) : sortedFantasyPlayers.map((p, i) => (
                  <div key={p.id} className={`card ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":""}`}
                    style={{padding:"10px 12px", marginBottom:5, display:"flex", flexDirection:"column", gap:8, borderRadius:9}}>
                    <div style={{display:"flex", alignItems:"center", gap:8}}>
                      <div style={{fontSize:i<3?16:11, color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#666", width:24, textAlign:"center", flexShrink:0}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, fontSize:13}}>{p.name}</div>
                      </div>
                      <div style={{fontFamily:"'Cinzel Decorative',serif", fontSize:18, fontWeight:700, flexShrink:0,
                        color: p.score>0?"#FFD700":p.score<0?"#ef4444":"#666"}}>
                        {p.score>0?"+":""}{p.score}
                      </div>
                      <div style={{fontSize:10, fontFamily:"'Lato',sans-serif", color:"#666"}}>pts</div>
                    </div>
                    {/* Mini pick avatars */}
                    <div style={{display:"flex", gap:6, paddingLeft:32, flexWrap:"wrap"}}>
                      {p.picks.map(id => {
                        const cast = CAST.find(c=>c.id===id);
                        const sc = castawayScores[id] || {pts:0};
                        if (!cast) return null;
                        return (
                          <div key={id} style={{display:"flex", alignItems:"center", gap:4,
                            fontFamily:"'Lato',sans-serif", fontSize:10, color:"#888"}}>
                            <span style={{fontSize:16}}>{cast.emoji}</span>
                            <span style={{fontSize:11, color:"#c4a97a"}}>{cast.name.split(" ")[0]}</span>
                            <span style={{color: sc.pts>0?"#FFD700":sc.pts<0?"#ef4444":"#666", fontWeight:700}}>
                              {sc.pts>0?"+":""}{sc.pts}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ── CASTAWAYS TAB ── */}
        {tab === "castaways" && (
          <div style={{animation:"fadeIn .3s"}}>
            <h2 style={{textAlign:"center", fontSize:16, letterSpacing:4, color:"#D97706", marginBottom:20, fontFamily:"'Lato',sans-serif", textTransform:"uppercase"}}>
              Manage Castaway Scores
            </h2>
            {["Cila","Kalo","Vatu"].map(tribe => {
              const tc = TRIBE_COLORS[tribe];
              const members = CAST.filter(c => c.tribe === tribe).sort((a, b) => a.name.localeCompare(b.name));
              return (
                <div key={tribe} style={{marginBottom:24}}>
                  <div style={{
                    textAlign:"center", padding:"8px 16px", borderRadius:"8px 8px 0 0",
                    background:`linear-gradient(90deg,${tc.bg},${tc.bg}99)`,
                    fontSize:13, letterSpacing:4, fontWeight:700, color:"#fff", textTransform:"uppercase"
                  }}>
                    🏝️ Tribe {tribe}
                  </div>
                  <div style={{border:`1px solid ${tc.border}44`, borderTop:"none", borderRadius:"0 0 12px 12px", overflow:"hidden"}}>
                    {members.map(c => {
                      const score = castawayScores[c.id] || { pts: 0, events: [], eliminated: false };
                      return (
                        <div key={c.id} style={{
                          padding:"12px 16px", borderBottom:`1px solid rgba(255,255,255,.05)`,
                          background: score.eliminated?"rgba(239,68,68,.04)":"transparent"
                        }}>
                          <div style={{display:"flex", alignItems:"center", gap:10}}>
                            <span style={{fontSize:24, flexShrink:0}}>{c.emoji}</span>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:700, fontSize:13, color: score.eliminated?"#666":"#F5E6C8",
                                textDecoration:score.eliminated?"line-through":"none"}}>
                                {c.name}
                              </div>
                              <div style={{fontFamily:"'Lato',sans-serif", fontSize:10, color:"#666", marginTop:1}}>
                                {c.seasons}
                              </div>
                              {c.fact && (
                                <div style={{fontFamily:"'Lato',sans-serif", fontSize:10, color:"#8a7a5a", marginTop:4, lineHeight:1.5, fontStyle:"italic"}}>
                                  {c.fact}
                                </div>
                              )}
                            </div>
                            <div style={{fontFamily:"'Cinzel Decorative',serif", fontSize:18, fontWeight:700,
                              color: score.pts>0?"#FFD700":score.pts<0?"#ef4444":"#888", minWidth:48, textAlign:"right"}}>
                              {score.pts>0?"+":""}{score.pts}
                            </div>
                            <button className="btn" onClick={() => setEventModal(c.id)}
                              style={{background:"linear-gradient(135deg,#7C3AED,#5B21B6)", color:"#fff", padding:"6px 14px", fontSize:11}}>
                              + Event
                            </button>
                            <button className="btn" onClick={() => toggleEliminated(c.id)}
                              title={score.eliminated?"Mark Active":"Mark Eliminated"}
                              style={{background: score.eliminated?"rgba(34,197,94,.15)":"rgba(239,68,68,.15)",
                                color: score.eliminated?"#22c55e":"#ef4444", padding:"6px 10px", fontSize:14, border:"1px solid currentColor"}}>
                              {score.eliminated?"♻":"✗"}
                            </button>
                          </div>
                          {/* Events log */}
                          {score.events && score.events.length > 0 && (
                            <div style={{marginTop:10, paddingLeft:34}}>
                              {score.events.map((e, i) => (
                                <div key={i} style={{
                                  display:"flex", alignItems:"center", gap:8,
                                  fontFamily:"'Lato',sans-serif", fontSize:11, marginBottom:4, color:"#a0937a"
                                }}>
                                  <span>{e.icon}</span>
                                  <span style={{flex:1}}>{e.event}{e.note ? ` — ${e.note}` : ""}</span>
                                  <span style={{color: e.pts>0?"#FFD700":"#ef4444", fontWeight:700, minWidth:30}}>
                                    {e.pts>0?"+":""}{e.pts}
                                  </span>
                                  <button onClick={() => removeEvent(c.id, i)}
                                    style={{background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:14, padding:"0 4px"}}
                                    title="Remove event">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FANTASY PLAYERS TAB ── */}
        {tab === "fantasy" && (
          <div style={{animation:"fadeIn .3s"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
              <h2 style={{fontSize:16, letterSpacing:4, color:"#D97706", margin:0, fontFamily:"'Lato',sans-serif", textTransform:"uppercase"}}>
                Fantasy Managers
              </h2>
              <button className="btn" onClick={() => setPlayerModal(true)}
                style={{background:"linear-gradient(135deg,#B45309,#D97706)", color:"#fff", padding:"10px 20px", fontSize:12}}>
                + Add Manager
              </button>
            </div>
            {fantasyPlayers.length === 0 ? (
              <div style={{textAlign:"center", color:"#666", padding:60, fontFamily:"'Lato',sans-serif"}}>
                <div style={{fontSize:48, marginBottom:12}}>🌴</div>
                <div>No fantasy managers yet. Add one to get started!</div>
              </div>
            ) : sortedFantasyPlayers.map((p, i) => (
              <div key={p.id} className="card" style={{padding:"18px 20px", marginBottom:12}}>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <div style={{fontSize:i<3?22:16, color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#888", width:36, textAlign:"center"}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:16}}>{p.name}</div>
                    <div style={{fontFamily:"'Lato',sans-serif", fontSize:12, color:"#888", marginTop:4}}>
                      Total Score: <span style={{color: p.score>0?"#FFD700":p.score<0?"#ef4444":"#888", fontWeight:700}}>
                        {p.score>0?"+":""}{p.score} pts
                      </span>
                    </div>
                  </div>
                  <button className="btn" onClick={() => removeFantasyPlayer(p.id)}
                    style={{background:"rgba(239,68,68,.15)", color:"#ef4444", border:"1px solid #ef4444", padding:"6px 12px", fontSize:11}}>
                    Remove
                  </button>
                </div>
                <div style={{marginTop:14, display:"flex", flexWrap:"wrap", gap:8}}>
                  {p.picks.map(id => {
                    const cast = CAST.find(c=>c.id===id);
                    const sc = castawayScores[id];
                    const tc = TRIBE_COLORS[cast?.tribe];
                    return cast ? (
                      <div key={id} style={{
                        background:`${tc.bg}22`, border:`1px solid ${tc.border}55`,
                        borderRadius:8, padding:"6px 12px", fontFamily:"'Lato',sans-serif", fontSize:12,
                        display:"flex", alignItems:"center", gap:8
                      }}>
                        <span style={{fontSize:18}}>{cast.emoji}</span>
                        <span style={{color:"#c4a97a"}}>{cast.name}</span>
                        <span style={{color: sc.pts>0?"#FFD700":sc.pts<0?"#ef4444":"#888", fontWeight:700}}>
                          {sc.pts>0?"+":""}{sc.pts}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SCORING GUIDE TAB ── */}
        {tab === "scoring" && (
          <div style={{animation:"fadeIn .3s"}}>
            <h2 style={{textAlign:"center", fontSize:16, letterSpacing:4, color:"#D97706", marginBottom:20, fontFamily:"'Lato',sans-serif", textTransform:"uppercase"}}>
              Scoring System
            </h2>
            <div className="card" style={{padding:24}}>
              <div style={{fontFamily:"'Lato',sans-serif", fontSize:13, color:"#888", marginBottom:20, textAlign:"center", letterSpacing:1}}>
                Points are awarded or deducted for the following events:
              </div>
              {(() => {
                const categories = [...new Set(SCORING_SYSTEM.map(s => s.category))];
                const catColors = {
                  "Tribal Council": "#7C3AED", "Idols": "#B45309", "Advantages": "#0369A1",
                  "Immunity": "#047857", "Reward": "#D97706", "Risk & Penalties": "#DC2626",
                  "Others": "#6B7280", "Endgame": "#F59E0B"
                };
                return categories.map(cat => (
                  <div key={cat} style={{marginBottom:20}}>
                    <div style={{
                      fontSize:11, letterSpacing:3, fontWeight:700, textTransform:"uppercase",
                      color: catColors[cat]||"#D97706", marginBottom:8, paddingBottom:6,
                      borderBottom:`1px solid ${catColors[cat]||"#D97706"}55`,
                      fontFamily:"'Lato',sans-serif"
                    }}>{cat}</div>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:6}}>
                      {SCORING_SYSTEM.filter(s=>s.category===cat).map((s, i) => (
                        <div key={i} style={{
                          background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,215,0,.08)",
                          borderRadius:8, padding:"9px 14px", display:"flex", alignItems:"center", gap:10
                        }}>
                          <span style={{fontSize:18}}>{s.icon}</span>
                          <div style={{flex:1, fontFamily:"'Lato',sans-serif", fontSize:12, color:"#c4a97a"}}>{s.event}</div>
                          <div style={{
                            fontFamily:"'Cinzel Decorative',serif", fontSize:15, fontWeight:700,
                            color: s.pts>0?"#FFD700":"#ef4444", minWidth:34, textAlign:"right"
                          }}>{s.pts>0?"+":""}{s.pts}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
              <div style={{marginTop:24, padding:16, background:"rgba(255,215,0,.05)", borderRadius:10, border:"1px solid rgba(255,215,0,.15)"}}>
                <div style={{fontFamily:"'Lato',sans-serif", fontSize:12, color:"#D97706", lineHeight:1.8}}>
                  <strong style={{display:"block", marginBottom:8, letterSpacing:2}}>📖 HOW TO PLAY</strong>
                  1. Each fantasy manager drafts up to <strong>6 castaways</strong> from the full cast.<br/>
                  2. Head to the <strong>Castaways</strong> tab to add events as they happen each episode.<br/>
                  3. Your total fantasy score = the sum of all your picks' points.<br/>
                  4. Track standings in the <strong>Leaderboard</strong> tab in real time.<br/>
                  5. All scores are saved automatically and persist between sessions.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD EVENT MODAL ── */}
      {eventModal && (
        <div className="modal-bg" onClick={() => setEventModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{margin:"0 0 6px", fontSize:14, letterSpacing:3, color:"#D97706", textTransform:"uppercase", fontFamily:"'Lato',sans-serif"}}>Add Event</h3>
            <div style={{fontWeight:700, fontSize:18, marginBottom:20}}>
              {CAST.find(c=>c.id===eventModal)?.emoji} {CAST.find(c=>c.id===eventModal)?.name}
            </div>
            <div style={{marginBottom:16}}>
              {(() => {
                const categories = [...new Set(SCORING_SYSTEM.map(s => s.category))];
                return categories.map(cat => (
                  <div key={cat} style={{marginBottom:10}}>
                    <div style={{fontSize:10, letterSpacing:3, color:"#888", fontFamily:"'Lato',sans-serif",
                      textTransform:"uppercase", marginBottom:5, paddingLeft:4}}>{cat}</div>
                    <div style={{display:"grid", gap:4}}>
                      {SCORING_SYSTEM.map((s, i) => s.category !== cat ? null : (
                        <div key={i}
                          onClick={() => setSelectedEvent(i)}
                          style={{
                            padding:"8px 12px", borderRadius:7, cursor:"pointer",
                            border:`1px solid ${selectedEvent===i?"rgba(255,215,0,.6)":"rgba(255,215,0,.08)"}`,
                            background: selectedEvent===i?"rgba(255,215,0,.1)":"rgba(255,255,255,.02)",
                            display:"flex", alignItems:"center", gap:8, transition:"all .15s"
                          }}>
                          <span style={{fontSize:16}}>{s.icon}</span>
                          <span style={{flex:1, fontFamily:"'Lato',sans-serif", fontSize:12, color:"#c4a97a"}}>{s.event}</span>
                          <span style={{fontWeight:700, fontFamily:"'Cinzel Decorative',serif", fontSize:13,
                            color: s.pts>0?"#FFD700":"#ef4444"}}>
                            {s.pts>0?"+":""}{s.pts}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <textarea value={eventNote} onChange={e=>setEventNote(e.target.value)}
              placeholder="Optional note (e.g. Episode 3, played idol on Cirie)..."
              style={{width:"100%", resize:"vertical", minHeight:60, marginBottom:16}}/>
            <div style={{display:"flex", gap:10}}>
              <button className="btn" onClick={addEvent} disabled={selectedEvent===null||selectedEvent===undefined}
                style={{flex:1, background:"linear-gradient(135deg,#B45309,#D97706)", color:"#fff", padding:"12px",
                  opacity: (selectedEvent===null||selectedEvent===undefined) ? .5:1, fontSize:13}}>
                Add Event ✓
              </button>
              <button className="btn" onClick={() => {setEventModal(null);setSelectedEvent(null);setEventNote("");}}
                style={{background:"rgba(255,255,255,.07)", color:"#888", padding:"12px 20px", fontSize:13}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD FANTASY PLAYER MODAL ── */}
      {playerModal && (
        <div className="modal-bg" onClick={() => setPlayerModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px", fontSize:14, letterSpacing:3, color:"#D97706", textTransform:"uppercase", fontFamily:"'Lato',sans-serif"}}>New Fantasy Manager</h3>
            <div style={{marginBottom:14}}>
              <label style={{fontFamily:"'Lato',sans-serif", fontSize:12, color:"#888", display:"block", marginBottom:6, letterSpacing:1}}>MANAGER NAME</label>
              <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)}
                placeholder="Enter your name..." style={{width:"100%"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontFamily:"'Lato',sans-serif", fontSize:12, color:"#888", display:"block", marginBottom:6, letterSpacing:1}}>
                PICK YOUR CASTAWAYS (up to 6 selected: {newPlayerPicks.length}/6)
              </label>
              <div style={{display:"grid", gap:6, maxHeight:320, overflowY:"auto"}}>
                {CAST.map(c => {
                  const selected = newPlayerPicks.includes(c.id);
                  const tc = TRIBE_COLORS[c.tribe];
                  return (
                    <div key={c.id}
                      onClick={() => {
                        if (selected) setNewPlayerPicks(p => p.filter(x=>x!==c.id));
                        else if (newPlayerPicks.length < 6) setNewPlayerPicks(p => [...p, c.id]);
                      }}
                      style={{
                        padding:"8px 12px", borderRadius:8, cursor:"pointer",
                        border:`1px solid ${selected?tc.border:"rgba(255,255,255,.08)"}`,
                        background: selected?`${tc.bg}33`:"rgba(255,255,255,.02)",
                        display:"flex", alignItems:"center", gap:10, transition:"all .15s",
                        opacity: !selected && newPlayerPicks.length>=6 ? .4 : 1
                      }}>
                      <span style={{fontSize:18}}>{c.emoji}</span>
                      <span style={{flex:1, fontFamily:"'Lato',sans-serif", fontSize:13, color: selected?"#F5E6C8":"#888"}}>{c.name}</span>
                      <span className="tag" style={{background:`${tc.bg}44`, color:tc.border, border:`1px solid ${tc.border}44`}}>{c.tribe}</span>
                      {selected && <span style={{color:"#FFD700", fontSize:16}}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex", gap:10}}>
              <button className="btn" onClick={addFantasyPlayer}
                disabled={!newPlayerName.trim() || newPlayerPicks.length===0}
                style={{flex:1, background:"linear-gradient(135deg,#B45309,#D97706)", color:"#fff",
                  padding:"12px", fontSize:13, opacity:(!newPlayerName.trim()||newPlayerPicks.length===0)?.5:1}}>
                Join Draft 🌴
              </button>
              <button className="btn" onClick={() => {setPlayerModal(false);setNewPlayerName("");setNewPlayerPicks([]);}}
                style={{background:"rgba(255,255,255,.07)", color:"#888", padding:"12px 20px", fontSize:13}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#B45309,#D97706)", color:"#fff",
          padding:"12px 24px", borderRadius:30, fontFamily:"'Lato',sans-serif",
          fontSize:13, fontWeight:700, letterSpacing:1, zIndex:200,
          animation:"slideIn .25s", boxShadow:"0 8px 32px rgba(180,83,9,.5)"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
