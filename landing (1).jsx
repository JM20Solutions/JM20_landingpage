import { useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const T = {
  bg:"#FAF8F5", surface:"#FFFFFF", warm:"#F5EDE6", warmDark:"#EDD9CC",
  terra:"#C4633A", terraLight:"#F0D4C4", terraDark:"#9E4E2C",
  text:"#1C1917", muted:"#78716C", border:"#E8DDD5",
  shadow:"0 1px 3px rgba(196,99,58,0.07), 0 6px 20px rgba(0,0,0,0.05)",
  shadowHover:"0 4px 14px rgba(196,99,58,0.14), 0 16px 40px rgba(0,0,0,0.08)",
};

const FAQS = `You are an AI assistant for JM20, an AI automation consultancy based in Spain. Answer ONLY based on this. Be warm, concise and professional.
SERVICES: AI Customer Support Automation (n8n agentic workflows for Web, Telegram, WhatsApp), Secure Architecture (JWT→Intent Agent→Edge Functions→DB, data never leaves EU), Owner Dashboard (real-time metrics), NL2SQL (plain English queries), RAG FAQ Chatbox (like this, embeddable).
PRICING: Tier1 Core €2k-4k setup +€300-500/mo, Tier2 +Dashboard €4k-7k +€500-800/mo, Tier3 Full Suite €7k-12k +€800-1500/mo.
TECH: n8n, Supabase, PostgreSQL, Edge Functions, OpenAI/Anthropic, RAG, JWT, Telegram Bot API, WhatsApp Business API.
GDPR: Fully GDPR Article 28 compliant. Data stays in EU infrastructure. Client owns the system and keys. No vendor lock-in.
LOCATION: Spain/EU. 20+ years experience in banking, consulting, training.
If outside scope, redirect politely and suggest booking a call.`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:${T.bg};font-family:'Plus Jakarta Sans',sans-serif}
::selection{background:${T.terraLight};color:${T.terraDark}}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;box-shadow:${T.shadow};transition:box-shadow .2s,transform .2s}
.card:hover{box-shadow:${T.shadowHover};transform:translateY(-2px)}
a{text-decoration:none}
input,button,select,textarea{font-family:'Plus Jakarta Sans',sans-serif}
.btn-primary{background:${T.text};color:#fff;padding:.55rem 1.25rem;border-radius:100px;font-size:.875rem;font-weight:700;cursor:pointer;border:none;transition:opacity .2s;letter-spacing:-.01em}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:transparent;color:${T.muted};padding:.55rem 1rem;border-radius:100px;font-size:.875rem;font-weight:500;cursor:pointer;border:none;transition:color .2s}
.btn-ghost:hover{color:${T.text}}
`;

/* ── LOGOS ── */
const TelegramLogo = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#0088cc"/>
    <path d="M5.5 11.5l11-4.5-1.5 9-3.5-2.5-1.5 1.5-.5-3 5-4.5-6 3.5-3-.5z" fill="white" stroke="white" strokeWidth=".3" strokeLinejoin="round"/>
  </svg>
);

const WhatsAppLogo = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#25d366"/>
    <path d="M17.5 14.5c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5 0-.2-.8-2-.9-2.3-.2-.3-.5-.2-.7-.2h-.5c-.2 0-.5.1-.7.3C8 7.5 7.5 8.5 7.5 9.5c0 1 .7 2 .8 2.2.1.1 1.5 2.3 3.6 3.2 2.1.9 2.1.6 2.5.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1z" fill="white"/>
  </svg>
);

const WebChatLogo = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#3b82f6"/>
    <path d="M7 8h10a1 1 0 011 1v5a1 1 0 01-1 1H9l-3 2V9a1 1 0 011-1z" fill="white"/>
  </svg>
);

/* ── NAV (Cohere-style) ── */
const Nav = ({onContact}) => {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const f = () => setSc(window.scrollY > 20);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 2.5rem",
      background: sc ? "rgba(250,248,245,0.96)" : "transparent",
      backdropFilter: sc ? "blur(14px)" : "none",
      borderBottom: sc ? `1px solid ${T.border}` : "none",
      transition:"all .3s"
    }}>
      {/* Logo */}
      <div style={{display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer"}}>
        <div style={{display:"flex", gap:3}}>
          <div style={{width:10, height:10, borderRadius:"50%", background:T.terra}}/>
          <div style={{width:10, height:10, borderRadius:"50%", background:"#7c6af7"}}/>
          <div style={{width:10, height:10, borderRadius:"50%", background:"#22c55e"}}/>
        </div>
        <span style={{fontWeight:800, fontSize:"1.1rem", color:T.text, letterSpacing:"-0.025em"}}>jm20</span>
      </div>

      {/* Links */}
      <div style={{display:"flex", gap:"0.25rem", alignItems:"center"}}>
        {["Services","How it works","Demo","Pricing"].map(n => (
          <a key={n} href={`#${n.toLowerCase().replace(/ /g,"-")}`}
            style={{color:T.muted, fontSize:"0.875rem", fontWeight:500, padding:"0.4rem 0.875rem", borderRadius:100, transition:"all .15s"}}
            onMouseEnter={e => { e.currentTarget.style.background = T.warm; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.muted; }}
          >{n}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{display:"flex", alignItems:"center", gap:"0.5rem"}}>
        <a href="mailto:hello@jm20.eu" style={{color:T.muted, fontSize:"0.875rem", fontWeight:500, padding:"0.4rem 0.875rem"}}>Contact</a>
        <button className="btn-primary" onClick={onContact}>Request a demo</button>
      </div>
    </nav>
  );
};

/* ── GDPR TRUST BAR ── */
const TrustBar = () => (
  <div style={{
    background: T.text, color:"#fff",
    padding:"0.625rem 2.5rem",
    display:"flex", alignItems:"center", justifyContent:"center",
    gap:"2.5rem", flexWrap:"wrap"
  }}>
    {[
      {icon:"🇪🇺", text:"EU Data Sovereignty — your data never leaves the EU"},
      {icon:"🔒", text:"GDPR Article 28 compliant"},
      {icon:"🛡️", text:"Zero direct database exposure"},
      {icon:"🔑", text:"You own the system. No lock-in."},
    ].map((t,i) => (
      <div key={i} style={{display:"flex", alignItems:"center", gap:"0.4rem"}}>
        <span style={{fontSize:"0.875rem"}}>{t.icon}</span>
        <span style={{fontSize:"0.775rem", fontWeight:500, opacity:.85, letterSpacing:".01em"}}>{t.text}</span>
      </div>
    ))}
  </div>
);

/* ── HERO ── */
const Hero = ({onContact}) => (
  <section style={{minHeight:"100vh", display:"flex", alignItems:"center", padding:"9rem 3rem 5rem", position:"relative", overflow:"hidden"}}>
    <div style={{position:"absolute", top:"15%", right:"6%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,99,58,0.06) 0%,transparent 70%)", pointerEvents:"none"}}/>
    <div style={{position:"absolute", bottom:"10%", left:"3%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,106,247,0.05) 0%,transparent 70%)", pointerEvents:"none"}}/>

    <div style={{maxWidth:820, margin:"0 auto", textAlign:"center", animation:"fadeUp .8s ease both"}}>
      <div style={{display:"inline-flex", alignItems:"center", gap:"0.5rem", background:T.warm, border:`1px solid ${T.terraLight}`, borderRadius:100, padding:"0.4rem 1.1rem", marginBottom:"2rem"}}>
        <div style={{width:7, height:7, borderRadius:"50%", background:T.terra, animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:"0.78rem", color:T.terra, fontWeight:700, letterSpacing:"0.05em"}}>EU-BASED · GDPR-FIRST · YOUR DATA STAYS IN EUROPE</span>
      </div>

      <h1 style={{fontSize:"clamp(2.6rem,6vw,4.75rem)", fontWeight:800, lineHeight:1.05, color:T.text, letterSpacing:"-0.035em", marginBottom:"1.5rem"}}>
        AI that handles your support.<br/>
        <span style={{color:T.terra}}>Hackers that handle nothing.</span>
      </h1>

      <p style={{fontSize:"1.1rem", color:T.muted, lineHeight:1.75, maxWidth:600, margin:"0 auto 0.875rem", fontWeight:400}}>
        We build secure, production-grade AI support systems for EU businesses — agentic workflows on <strong style={{color:T.text, fontWeight:700}}>Web, Telegram & WhatsApp</strong>, owner dashboards, and RAG chatboxes.
      </p>
      <p style={{fontSize:"0.9rem", color:T.muted, marginBottom:"2.75rem"}}>
        Built on EU infrastructure. GDPR-compliant by design. You own every piece of it.
      </p>

      <div style={{display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap"}}>
        <button className="btn-primary" onClick={onContact} style={{padding:"0.9rem 2.25rem", fontSize:"1rem", borderRadius:10, boxShadow:`0 4px 20px rgba(28,25,23,0.2)`}}>Request a free demo →</button>
        <a href="#demo" style={{background:T.surface, color:T.text, padding:"0.9rem 2.25rem", borderRadius:10, fontSize:"1rem", fontWeight:600, border:`1px solid ${T.border}`, boxShadow:T.shadow}}>See it live ↓</a>
      </div>

      {/* Trust indicators */}
      <div style={{marginTop:"4rem", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", maxWidth:600, margin:"4rem auto 0"}}>
        {[
          {value:"88%+", label:"Average automation rate"},
          {value:"< 2s", label:"Average response time"},
          {value:"100%", label:"EU data residency"},
        ].map((s,i) => (
          <div key={i} style={{padding:"1rem", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, boxShadow:T.shadow}}>
            <div style={{fontSize:"1.6rem", fontWeight:800, color:T.terra, letterSpacing:"-0.02em"}}>{s.value}</div>
            <div style={{fontSize:"0.75rem", color:T.muted, fontWeight:500, marginTop:"0.2rem"}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── SECURITY ── */
const STEPS = [
  {n:"01", icon:"🔐", label:"JWT Authentication", desc:"Every request is verified against a signed token before anything else happens. No valid JWT, no access — full stop.", color:"#7c6af7"},
  {n:"02", icon:"🧠", label:"Intent Validation Agent", desc:"An AI agent classifies the request and confirms it's legitimate and within scope. Suspicious or out-of-scope requests are blocked before touching your data.", color:T.terra},
  {n:"03", icon:"⚡", label:"Scoped Edge Function", desc:"The request hits a single, purpose-built Edge Function. It can do exactly one thing — nothing more. No other tables, no other endpoints.", color:"#2563eb"},
  {n:"04", icon:"🗄️", label:"Database — never exposed", desc:"Your database is the innermost layer. It never receives a direct connection from n8n, your website, or any external service. Ever.", color:"#16a34a"},
];

const Security = () => (
  <section id="how-it-works" style={{padding:"6rem 3rem", background:T.warm}}>
    <div style={{maxWidth:1080, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center"}}>
      <div>
        <span style={{fontSize:"0.75rem", color:T.terra, fontWeight:700, letterSpacing:"0.1em"}}>SECURITY ARCHITECTURE</span>
        <h2 style={{fontSize:"clamp(1.75rem,3.5vw,2.5rem)", fontWeight:800, color:T.text, marginTop:"0.6rem", marginBottom:"1rem", letterSpacing:"-0.025em", lineHeight:1.15}}>
          Four layers between<br/>hackers and your data.
        </h2>
        <p style={{color:T.muted, fontSize:"0.95rem", lineHeight:1.7, marginBottom:"1.5rem"}}>
          Most automation tools connect directly to your database. One leaked credential and everything is exposed. We don't work that way.
        </p>
        <p style={{color:T.muted, fontSize:"0.95rem", lineHeight:1.7, marginBottom:"2rem"}}>
          Every request passes through four independent security layers. Your data never leaves EU infrastructure, and even if credentials are compromised, attackers hit a wall at layer one.
        </p>
        <div style={{display:"flex", flexDirection:"column", gap:"0.625rem"}}>
          {["GDPR Article 28 compliant","EU data residency guaranteed","Zero direct DB exposure","End-to-end scoped access"].map(t => (
            <div key={t} style={{display:"flex", alignItems:"center", gap:"0.625rem"}}>
              <div style={{width:18, height:18, borderRadius:"50%", background:T.terraLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", color:T.terra, fontWeight:800, flexShrink:0}}>✓</div>
              <span style={{fontSize:"0.875rem", color:T.text, fontWeight:500}}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:0}}>
        {STEPS.map((s,i) => (
          <div key={i} style={{display:"flex", gap:"1.25rem", alignItems:"flex-start", position:"relative"}}>
            {i < STEPS.length-1 && (
              <div style={{position:"absolute", left:19, top:44, width:2, height:"calc(100% - 8px)", background:`linear-gradient(to bottom, ${s.color}50, ${STEPS[i+1].color}30)`}}/>
            )}
            <div style={{width:40, height:40, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0, zIndex:1, boxShadow:`0 0 0 4px ${T.warm}, 0 0 0 6px ${s.color}25`}}>{s.icon}</div>
            <div style={{paddingBottom: i < STEPS.length-1 ? "2rem" : "0"}}>
              <div style={{display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.3rem"}}>
                <span style={{fontSize:"0.68rem", color:s.color, fontWeight:800, letterSpacing:"0.08em"}}>{s.n}</span>
                <span style={{fontWeight:700, fontSize:"0.95rem", color:T.text}}>{s.label}</span>
              </div>
              <p style={{fontSize:"0.85rem", color:T.muted, lineHeight:1.6}}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── SERVICES ── */
const Services = () => (
  <section id="services" style={{padding:"6rem 3rem", maxWidth:1080, margin:"0 auto"}}>
    <div style={{textAlign:"center", marginBottom:"3rem"}}>
      <span style={{fontSize:"0.75rem", color:T.terra, fontWeight:700, letterSpacing:"0.1em"}}>WHAT WE BUILD</span>
      <h2 style={{fontSize:"clamp(1.75rem,4vw,2.75rem)", fontWeight:800, color:T.text, marginTop:"0.5rem", letterSpacing:"-0.025em"}}>One secure stack. Five powerful tools.</h2>
    </div>
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1.25rem"}}>
      {[
        {icon:"🤖", title:"AI Support Agent", desc:"Agentic workflows on Web, Telegram & WhatsApp. Intent detection, RAG retrieval, LLM response, smart escalation.", tags:["Web","Telegram","WhatsApp","n8n"]},
        {icon:"🔐", title:"Secure Architecture", desc:"JWT → Intent Agent → Edge Functions → DB. Your database is never directly reachable from outside.", tags:["JWT","Edge Functions","GDPR"]},
        {icon:"📊", title:"Owner Dashboard", desc:"Real-time monitoring of support volume, automation rate, LLM token costs and workflow health.", tags:["Metrics","Alerts","Live"]},
        {icon:"💬", title:"NL2SQL Interface", desc:"Ask questions about your business data in plain English. No SQL needed. Secured behind Edge Functions.", tags:["Natural Language","Secure"]},
        {icon:"💡", title:"RAG FAQ Chatbox", desc:"Trained on your FAQs. Embeddable anywhere. Answers customers 24/7 without human involvement.", tags:["RAG","Embeddable","24/7"]},
      ].map((s,i) => (
        <div key={i} className="card" style={{padding:"1.75rem", cursor:"default"}}>
          <div style={{fontSize:"1.75rem", marginBottom:"0.875rem"}}>{s.icon}</div>
          <h3 style={{fontWeight:700, fontSize:"1rem", color:T.text, marginBottom:"0.5rem"}}>{s.title}</h3>
          <p style={{color:T.muted, fontSize:"0.85rem", lineHeight:1.65, marginBottom:"1.25rem"}}>{s.desc}</p>
          <div style={{display:"flex", gap:"0.4rem", flexWrap:"wrap"}}>
            {s.tags.map(tag => <span key={tag} style={{background:T.warm, border:`1px solid ${T.border}`, borderRadius:100, padding:"0.2rem 0.65rem", fontSize:"0.7rem", color:T.muted, fontWeight:600}}>{tag}</span>)}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ── DASHBOARD DEMO ── */
const generateData = (base, variance) => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({d, total:Math.floor(base+Math.random()*variance), auto:Math.floor((base+Math.random()*variance)*.88)}));
const generateTokens = () => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({d, k:Math.floor(30+Math.random()*55)}));
const CHANNELS = [{id:"all",label:"All Channels",Icon:null},{id:"web",label:"Web Chat",Icon:WebChatLogo},{id:"telegram",label:"Telegram",Icon:TelegramLogo},{id:"whatsapp",label:"WhatsApp",Icon:WhatsAppLogo}];
const PERIODS = [{id:"7d",label:"7 days"},{id:"30d",label:"30 days"},{id:"90d",label:"90 days"}];
const runs_by_channel = {
  all:[{name:"Handle refund request",s:"success",t:"2s",ago:"1 min ago"},{name:"FAQ: shipping policy",s:"success",t:"1s",ago:"3 min ago"},{name:"Escalate to human",s:"escalated",t:"4s",ago:"7 min ago"},{name:"Order status lookup",s:"success",t:"2s",ago:"12 min ago"}],
  web:[{name:"Web: billing question",s:"success",t:"2s",ago:"2 min ago"},{name:"Web: return request",s:"success",t:"1s",ago:"5 min ago"},{name:"Web: escalate to agent",s:"escalated",t:"3s",ago:"9 min ago"},{name:"Web: product availability",s:"success",t:"1s",ago:"15 min ago"}],
  telegram:[{name:"Telegram: /start onboarding",s:"success",t:"1s",ago:"1 min ago"},{name:"Telegram: order status",s:"success",t:"2s",ago:"4 min ago"},{name:"Telegram: refund query",s:"success",t:"2s",ago:"8 min ago"},{name:"Telegram: escalate",s:"escalated",t:"3s",ago:"11 min ago"}],
  whatsapp:[{name:"WhatsApp: duplicate charge",s:"success",t:"2s",ago:"2 min ago"},{name:"WhatsApp: delivery update",s:"success",t:"1s",ago:"6 min ago"},{name:"WhatsApp: escalate",s:"escalated",t:"4s",ago:"10 min ago"},{name:"WhatsApp: payment method",s:"success",t:"2s",ago:"14 min ago"}],
};

const DashboardDemo = () => {
  const [channel, setChannel] = useState("all");
  const [period, setPeriod] = useState("7d");
  const [tickets, setTickets] = useState(generateData(150,80));
  const [tokens, setTokens] = useState(generateTokens());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const base = channel==="web"?180:channel==="telegram"?90:channel==="whatsapp"?65:150;
      setTickets(generateData(base, base*.6));
      setTokens(generateTokens());
      setLoading(false);
    }, 500);
  }, [channel, period]);

  useEffect(() => { refresh(); }, [channel, period]);

  const totalTickets = tickets.reduce((a,t) => a+t.total, 0);
  const totalAuto = tickets.reduce((a,t) => a+t.auto, 0);
  const rate = totalTickets > 0 ? ((totalAuto/totalTickets)*100).toFixed(1) : 0;
  const totalTokens = tokens.reduce((a,t) => a+t.k, 0);

  return (
    <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, overflow:"hidden", boxShadow:T.shadow}}>
      <div style={{padding:"0.875rem 1.5rem", background:T.warm, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem"}}>
        <div style={{display:"flex", alignItems:"center", gap:"0.6rem"}}>
          {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{width:10, height:10, borderRadius:"50%", background:c}}/>)}
          <span style={{marginLeft:"0.5rem", fontWeight:600, fontSize:"0.8rem", color:T.muted}}>Support Dashboard — Acme Corp</span>
        </div>
        <div style={{display:"flex", gap:"0.5rem", alignItems:"center", flexWrap:"wrap"}}>
          <div style={{display:"flex", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden"}}>
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => setChannel(c.id)} style={{padding:"0.3rem 0.75rem", border:"none", background:channel===c.id?T.terra:"transparent", color:channel===c.id?"#fff":T.muted, fontSize:"0.75rem", fontWeight:600, cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:"0.3rem"}}>
                {c.Icon ? <c.Icon size={14}/> : <span>🌐</span>}
                {channel===c.id && <span>{c.label}</span>}
              </button>
            ))}
          </div>
          <div style={{display:"flex", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden"}}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{padding:"0.3rem 0.7rem", border:"none", background:period===p.id?T.terra:"transparent", color:period===p.id?"#fff":T.muted, fontSize:"0.75rem", fontWeight:600, cursor:"pointer"}}>{p.label}</button>
            ))}
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"0.4rem"}}>
            <div style={{width:7, height:7, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:"0.72rem", color:T.muted, fontWeight:500}}>Live</span>
          </div>
        </div>
      </div>
      <div style={{padding:"1.5rem", opacity:loading?.5:1, transition:"opacity .3s"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.25rem"}}>
          {[{label:"Tickets (period)", value:totalTickets, delta:"+12%", c:T.terra},{label:"Automation Rate", value:`${rate}%`, delta:"+3.2%", c:"#22c55e"},{label:"Avg Response", value:"1.4s", delta:"-0.3s", c:"#3b82f6"},{label:"Tokens Used", value:`${totalTokens}k`, delta:"+8%", c:"#8b5cf6"}].map((k,i) => (
            <div key={i} style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"1rem 1.25rem"}}>
              <div style={{fontSize:"0.7rem", color:T.muted, fontWeight:600, letterSpacing:"0.04em", marginBottom:"0.4rem"}}>{k.label}</div>
              <div style={{fontSize:"1.4rem", fontWeight:800, color:T.text, letterSpacing:"-0.02em"}}>{k.value}</div>
              <div style={{fontSize:"0.7rem", fontWeight:600, color:k.c, marginTop:"0.25rem"}}>{k.delta} vs prev</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:"1rem", marginBottom:"1.25rem"}}>
          <div style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"1rem"}}>
            <div style={{fontSize:"0.8rem", fontWeight:700, color:T.text, marginBottom:"0.75rem"}}>Tickets — Total vs Automated</div>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={tickets}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                <XAxis dataKey="d" tick={{fontSize:11, fill:T.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11, fill:T.muted}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12}}/>
                <Line type="monotone" dataKey="total" stroke={T.muted} strokeWidth={2} dot={false} name="Total"/>
                <Line type="monotone" dataKey="auto" stroke={T.terra} strokeWidth={2.5} dot={false} name="Automated"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"1rem"}}>
            <div style={{fontSize:"0.8rem", fontWeight:700, color:T.text, marginBottom:"0.75rem"}}>LLM Tokens (k)</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={tokens} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                <XAxis dataKey="d" tick={{fontSize:11, fill:T.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11, fill:T.muted}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12}}/>
                <Bar dataKey="k" fill={T.terraLight} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"1rem"}}>
          <div style={{fontSize:"0.8rem", fontWeight:700, color:T.text, marginBottom:"0.75rem"}}>Recent Workflow Runs</div>
          <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
            {(runs_by_channel[channel]||runs_by_channel.all).map((r,i) => (
              <div key={`${channel}-${i}`} style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.5rem 0.75rem", background:T.surface, borderRadius:8, border:`1px solid ${T.border}`, animation:"slideIn .3s ease both", animationDelay:`${i*0.05}s`}}>
                <div style={{display:"flex", alignItems:"center", gap:"0.625rem"}}>
                  <div style={{width:8, height:8, borderRadius:"50%", background:r.s==="success"?"#22c55e":"#f59e0b", flexShrink:0}}/>
                  <span style={{fontSize:"0.8rem", fontWeight:500, color:T.text}}>{r.name}</span>
                </div>
                <div style={{display:"flex", gap:"1rem"}}>
                  <span style={{fontSize:"0.75rem", color:T.muted}}>{r.t}</span>
                  <span style={{fontSize:"0.75rem", color:T.muted}}>{r.ago}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── NL2SQL ── */
const NL_EXAMPLES = ["Total revenue last 30 days","Customers with open invoices over €500","Refund rate by payment method this month","Top 5 customers by volume","WhatsApp tickets escalated this week"];

const NL2SQLDemo = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setQuery(text); setLoading(true); setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1000,
        system:`SQL generator for SaaS billing+support DB. Tables: invoices(customer_id,amount,tax,total,status,due_date,paid_at,created_at), transactions(customer_id,transaction_ref,type,amount,currency,status,payment_method,card_last_four,created_at), refunds(customer_id,refund_ref,amount,currency,reason,status,requested_at,processed_at), support_tickets(customer_id,channel,intent,status,escalated,created_at,resolved_at).
Respond ONLY with valid JSON no markdown: {"sql":"SELECT ...","explanation":"one sentence","columns":["c1","c2"],"rows":[["v1","v2"],["v1","v2"],["v1","v2"]]}
Use realistic sample data, max 4 rows.`,
        messages:[{role:"user", content:text}]
      })});
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setResult({error:true}); }
    setLoading(false);
  };
  return (
    <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, overflow:"hidden", boxShadow:T.shadow, maxWidth:720, margin:"0 auto"}}>
      <div style={{padding:"0.875rem 1.5rem", background:T.warm, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:"0.6rem"}}>
        {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{width:10, height:10, borderRadius:"50%", background:c}}/>)}
        <span style={{marginLeft:"0.5rem", fontWeight:600, fontSize:"0.8rem", color:T.muted}}>NL2SQL — Ask your data anything</span>
      </div>
      <div style={{padding:"1.5rem"}}>
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontSize:"0.72rem", fontWeight:700, color:T.muted, marginBottom:"0.5rem", letterSpacing:"0.05em"}}>TRY AN EXAMPLE</div>
          <div style={{display:"flex", gap:"0.5rem", flexWrap:"wrap"}}>
            {NL_EXAMPLES.map((e,i) => (
              <button key={i} onClick={() => run(e)} style={{background:T.warm, border:`1px solid ${T.border}`, borderRadius:100, padding:"0.3rem 0.875rem", fontSize:"0.75rem", color:T.text, cursor:"pointer", fontWeight:500}} onMouseEnter={e2=>e2.target.style.background=T.warmDark} onMouseLeave={e2=>e2.target.style.background=T.warm}>{e}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex", gap:"0.75rem"}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="Ask a question about your data..." style={{flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.9rem", color:T.text, outline:"none"}} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
          <button onClick={()=>run()} disabled={loading} style={{background:T.terra, color:"#fff", border:"none", borderRadius:10, padding:"0.75rem 1.5rem", fontWeight:700, fontSize:"0.875rem", cursor:loading?"not-allowed":"pointer", opacity:loading?.6:1}}>{loading?"…":"Run →"}</button>
        </div>
        {loading && <div style={{marginTop:"1.25rem", display:"flex", gap:"0.4rem", alignItems:"center", padding:"1rem", background:T.bg, borderRadius:10, border:`1px solid ${T.border}`}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.terra,animation:`bounce 1s ease-in-out ${i*.15}s infinite`}}/>)}<span style={{marginLeft:"0.5rem", fontSize:"0.8rem", color:T.muted}}>Translating to SQL…</span></div>}
        {result&&!result.error&&(
          <div style={{marginTop:"1.25rem", display:"flex", flexDirection:"column", gap:"0.875rem"}}>
            <div>
              <div style={{fontSize:"0.72rem", fontWeight:700, color:T.terra, letterSpacing:"0.06em", marginBottom:"0.4rem"}}>GENERATED SQL</div>
              <pre style={{background:"#1C1917", color:"#F5DDD0", borderRadius:10, padding:"1rem", fontSize:"0.78rem", overflow:"auto", lineHeight:1.6, fontFamily:"monospace"}}>{result.sql}</pre>
            </div>
            <div style={{background:T.warm, border:`1px solid ${T.terraLight}`, borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.85rem", color:T.muted, lineHeight:1.55}}>💡 {result.explanation}</div>
            {result.columns&&result.rows&&(
              <div style={{overflowX:"auto"}}>
                <div style={{fontSize:"0.72rem", fontWeight:700, color:T.muted, letterSpacing:"0.06em", marginBottom:"0.4rem"}}>SAMPLE RESULTS</div>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:"0.8rem"}}>
                  <thead><tr style={{background:T.bg, borderBottom:`2px solid ${T.border}`}}>{result.columns.map((c,i)=><th key={i} style={{padding:"0.5rem 0.75rem", textAlign:"left", color:T.text, fontWeight:700, fontSize:"0.75rem"}}>{c}</th>)}</tr></thead>
                  <tbody>{result.rows.map((row,ri)=><tr key={ri} style={{borderBottom:`1px solid ${T.border}`, background:ri%2===0?T.surface:T.bg}}>{row.map((cell,ci)=><td key={ci} style={{padding:"0.5rem 0.75rem", color:T.muted}}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {result?.error && <div style={{marginTop:"1rem", padding:"0.875rem", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, fontSize:"0.85rem", color:"#ef4444"}}>Something went wrong. Please try again.</div>}
      </div>
    </div>
  );
};

/* ── SUPPORT AGENT DEMO ── */
const CHANNEL_CONVOS = {
  web:[
    {from:"user",text:"Hi, I placed an order 3 days ago and haven't received a shipping update"},
    {from:"bot",text:"Hi! Let me check that right away 🔍 I can see order #ORD-8821 placed on the 19th — it shipped yesterday via DHL and is currently in transit. Estimated delivery is tomorrow before 6pm. I'll send you the tracking link now 📦"},
    {from:"user",text:"Thank you! And can I change the delivery address?"},
    {from:"bot",text:"Since your order is already in transit, address changes aren't possible at this stage. However, you can redirect it directly with DHL using your tracking number. Want me to send you the DHL redirect link?"},
  ],
  telegram:[
    {from:"user",text:"/start"},
    {from:"bot",text:"👋 Welcome to Acme Support on Telegram! I can help with orders, returns, billing and more. What can I help you with today?"},
    {from:"user",text:"I need to return a product"},
    {from:"bot",text:"Of course! I just need your order number to get started — you'll find it in your confirmation email starting with #ORD-. What's yours?"},
    {from:"user",text:"#ORD-7743"},
    {from:"bot",text:"✅ Found it! Order #ORD-7743 is eligible for return (within the 30-day window). I've generated a prepaid return label — check your email. Refund processed within 3–5 business days once we receive the item."},
  ],
  whatsapp:[
    {from:"user",text:"Hello, I was charged twice for my subscription this month"},
    {from:"bot",text:"Hi! I'm sorry to hear that — let me look into this immediately 🔍 Could you confirm the email address linked to your account?"},
    {from:"user",text:"sure, it's maria@example.com"},
    {from:"bot",text:"Thank you Maria 🙏 I can see the duplicate charge of €29.99 on the 15th. I've initiated a full refund — it will appear on your card within 2–3 business days. I've also flagged this with our billing team to prevent recurrence. Anything else I can help with?"},
    {from:"user",text:"No that's perfect, thank you!"},
    {from:"bot",text:"You're very welcome! Have a great day 😊"},
  ],
};

const CH_CFG = {
  web:{label:"Web Chat", color:"#3b82f6", bg:"#eff6ff", Logo:WebChatLogo},
  telegram:{label:"Telegram", color:"#0088cc", bg:"#e8f4fd", Logo:TelegramLogo},
  whatsapp:{label:"WhatsApp", color:"#25d366", bg:"#e8fdf0", Logo:WhatsAppLogo},
};

const SupportAgentDemo = () => {
  const [channel, setChannel] = useState("web");
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cfg = CH_CFG[channel];
  const convo = CHANNEL_CONVOS[channel];

  const reset = useCallback(() => { setVisibleCount(0); setPlaying(false); }, []);
  useEffect(() => { reset(); }, [channel]);

  const play = () => {
    if (playing) return;
    setPlaying(true); setVisibleCount(0);
    let i = 0;
    const next = () => {
      i++; setVisibleCount(i);
      if (i < convo.length) setTimeout(next, convo[i-1].from==="bot" ? 1400 : 900);
      else setPlaying(false);
    };
    setTimeout(next, 400);
  };

  return (
    <div style={{display:"flex", gap:"2.5rem", alignItems:"flex-start", justifyContent:"center", flexWrap:"wrap"}}>
      <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, overflow:"hidden", boxShadow:T.shadow, width:440, minWidth:320, flexShrink:0}}>
        {/* Channel picker */}
        <div style={{padding:"0.875rem 1.25rem", background:T.warm, borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:"0.72rem", fontWeight:700, color:T.muted, letterSpacing:"0.05em", marginBottom:"0.5rem"}}>SELECT CHANNEL</div>
          <div style={{display:"flex", gap:"0.5rem"}}>
            {Object.entries(CH_CFG).map(([id,c]) => (
              <button key={id} onClick={()=>setChannel(id)} style={{flex:1, padding:"0.45rem 0.5rem", borderRadius:8, border:`1px solid ${channel===id?c.color:T.border}`, background:channel===id?c.bg:"transparent", color:channel===id?c.color:T.muted, fontSize:"0.78rem", fontWeight:600, cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.4rem"}}>
                <c.Logo size={16}/><span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat header */}
        <div style={{padding:"0.875rem 1.25rem", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:cfg.bg}}>
          <div style={{display:"flex", alignItems:"center", gap:"0.625rem"}}>
            <cfg.Logo size={34}/>
            <div>
              <div style={{fontWeight:700, fontSize:"0.875rem", color:T.text}}>Acme Support</div>
              <div style={{display:"flex", alignItems:"center", gap:"0.35rem"}}>
                <div style={{width:6, height:6, borderRadius:"50%", background:"#22c55e"}}/>
                <span style={{fontSize:"0.72rem", color:T.muted}}>{cfg.label} · AI Agent</span>
              </div>
            </div>
          </div>
          <div style={{fontSize:"0.7rem", color:T.muted, background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:"0.2rem 0.6rem", fontWeight:600}}>n8n + RAG</div>
        </div>

        {/* Messages */}
        <div style={{height:280, overflowY:"auto", padding:"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem", background:visibleCount===0?"#fafafa":T.surface}}>
          {visibleCount===0 && (
            <div style={{height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.75rem", opacity:.5}}>
              <cfg.Logo size={40}/>
              <span style={{fontSize:"0.85rem", color:T.muted, fontWeight:500}}>Press Play to see a live conversation</span>
            </div>
          )}
          {convo.slice(0,visibleCount).map((m,i) => (
            <div key={i} style={{display:"flex", justifyContent:m.from==="user"?"flex-end":"flex-start", animation:"slideIn .3s ease both"}}>
              <div style={{maxWidth:"80%", padding:"0.65rem 0.95rem", borderRadius:m.from==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px", background:m.from==="user"?cfg.color:T.bg, color:m.from==="user"?"#fff":T.text, fontSize:"0.85rem", lineHeight:1.55, border:m.from==="user"?"none":`1px solid ${T.border}`}}>{m.text}</div>
            </div>
          ))}
          {playing && visibleCount < convo.length && convo[visibleCount]?.from==="bot" && (
            <div style={{display:"flex", gap:"0.35rem", padding:"0.5rem 0"}}>
              {[0,1,2].map(i => <div key={i} style={{width:7, height:7, borderRadius:"50%", background:cfg.color, animation:`bounce 1s ease-in-out ${i*.15}s infinite`}}/>)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{padding:"1rem 1.25rem", borderTop:`1px solid ${T.border}`, display:"flex", gap:"0.625rem", background:T.warm}}>
          <button onClick={play} disabled={playing} style={{flex:1, background:playing?"transparent":cfg.color, border:`1px solid ${playing?T.border:cfg.color}`, borderRadius:8, padding:"0.625rem", color:playing?T.muted:"#fff", fontWeight:700, fontSize:"0.85rem", cursor:playing?"not-allowed":"pointer", opacity:playing?.7:1, transition:"all .2s"}}>
            {playing ? "▶ Playing…" : "▶ Play conversation"}
          </button>
          <button onClick={reset} style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:"0.625rem 0.875rem", color:T.muted, fontWeight:600, fontSize:"0.85rem", cursor:"pointer"}}>↺</button>
        </div>
      </div>

      <div style={{maxWidth:300}}>
        <h3 style={{fontWeight:800, fontSize:"1.2rem", color:T.text, marginBottom:"1.5rem"}}>One agent. Three channels.</h3>
        {[
          {Logo:cfg.Logo, t:`${cfg.label} native`, d:`Same AI intelligence, same RAG knowledge base — adapted to how people actually communicate on ${cfg.label}.`},
          {icon:"🧠", t:"Intent → RAG → Response", d:"Every message is classified, relevant knowledge retrieved, and a precise answer generated — in under 2 seconds."},
          {icon:"🔀", t:"Smart escalation", d:"When confidence is low or the customer requests it, the agent hands off gracefully with full context to a human agent."},
        ].map((s,i) => (
          <div key={i} style={{display:"flex", gap:"1rem", marginBottom:"1.5rem"}}>
            <div style={{minWidth:36, height:36, borderRadius:8, background:T.warm, border:`1px solid ${T.terraLight}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
              {s.Logo ? <s.Logo size={18}/> : <span style={{fontSize:"1rem"}}>{s.icon}</span>}
            </div>
            <div>
              <div style={{fontWeight:700, color:T.text, fontSize:"0.9rem", marginBottom:"0.25rem"}}>{s.t}</div>
              <div style={{color:T.muted, fontSize:"0.85rem", lineHeight:1.55}}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── FAQ CHATBOX ── */
const ChatBox = () => {
  const [msgs, setMsgs] = useState([{role:"assistant", content:"Hi! I'm JM20's AI assistant. Ask me anything about our services, pricing, security, or how GDPR compliance works."}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);
  const send = async () => {
    if (!input.trim()||loading) return;
    const msg = {role:"user", content:input.trim()};
    setMsgs(p=>[...p,msg]); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, system:FAQS, messages:[...msgs,msg].map(m=>({role:m.role,content:m.content}))})});
      const data = await res.json();
      setMsgs(p=>[...p,{role:"assistant", content:data.content?.[0]?.text||"Sorry, no response."}]);
    } catch { setMsgs(p=>[...p,{role:"assistant", content:"Connection error. Please try again."}]); }
    setLoading(false);
  };
  return (
    <div style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, overflow:"hidden", boxShadow:T.shadow, maxWidth:460, width:"100%"}}>
      <div style={{padding:"1rem 1.5rem", background:T.warm, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:"0.75rem"}}>
        <div style={{width:34, height:34, borderRadius:"50%", background:T.terra, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}>🤖</div>
        <div>
          <div style={{fontWeight:700, fontSize:"0.875rem", color:T.text}}>JM20 Assistant</div>
          <div style={{display:"flex", alignItems:"center", gap:"0.4rem"}}>
            <div style={{width:6, height:6, borderRadius:"50%", background:"#22c55e"}}/>
            <span style={{fontSize:"0.72rem", color:T.muted, fontWeight:500}}>Live — powered by RAG</span>
          </div>
        </div>
      </div>
      <div style={{height:300, overflowY:"auto", padding:"1.25rem", display:"flex", flexDirection:"column", gap:"0.875rem"}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"82%", padding:"0.7rem 1rem", borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px", background:m.role==="user"?T.terra:T.bg, color:m.role==="user"?"#fff":T.text, fontSize:"0.875rem", lineHeight:1.55, border:m.role==="user"?"none":`1px solid ${T.border}`}}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{display:"flex", gap:"0.4rem"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.terra,animation:`bounce 1s ease-in-out ${i*.15}s infinite`}}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"1rem 1.25rem", borderTop:`1px solid ${T.border}`, display:"flex", gap:"0.625rem"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about services, pricing, GDPR…" style={{flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"0.625rem 0.875rem", color:T.text, fontSize:"0.875rem", outline:"none"}} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
        <button onClick={send} disabled={loading} style={{background:T.terra, border:"none", borderRadius:8, padding:"0.625rem 1.25rem", color:"#fff", fontWeight:700, fontSize:"0.875rem", cursor:loading?"not-allowed":"pointer", opacity:loading?.6:1}}>Send</button>
      </div>
    </div>
  );
};

/* ── DEMO SECTION ── */
const TABS = [{id:"agent",label:"🤖 Support Agent"},{id:"dashboard",label:"📊 Dashboard"},{id:"nl2sql",label:"💬 NL2SQL"},{id:"faq",label:"💡 FAQ Chatbox"}];

const DemoSection = () => {
  const [tab, setTab] = useState("agent");
  return (
    <section id="demo" style={{padding:"6rem 3rem", background:T.warm}}>
      <div style={{maxWidth:1080, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:"3rem"}}>
          <span style={{fontSize:"0.75rem", color:T.terra, fontWeight:700, letterSpacing:"0.1em"}}>LIVE DEMOS</span>
          <h2 style={{fontSize:"clamp(1.75rem,4vw,2.75rem)", fontWeight:800, color:T.text, marginTop:"0.5rem", letterSpacing:"-0.025em"}}>Try it right now</h2>
          <p style={{color:T.muted, marginTop:"0.75rem", fontSize:"0.95rem"}}>These are the actual tools we build for your business</p>
        </div>
        <div style={{display:"flex", justifyContent:"center", marginBottom:"2rem"}}>
          <div style={{display:"inline-flex", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:4, gap:2, flexWrap:"wrap"}}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"0.5rem 1.1rem", borderRadius:9, border:"none", background:tab===t.id?T.terra:"transparent", color:tab===t.id?"#fff":T.muted, fontWeight:600, fontSize:"0.875rem", cursor:"pointer", transition:"all .2s"}}>{t.label}</button>
            ))}
          </div>
        </div>
        {tab==="agent" && <SupportAgentDemo/>}
        {tab==="dashboard" && <DashboardDemo/>}
        {tab==="nl2sql" && <NL2SQLDemo/>}
        {tab==="faq" && (
          <div style={{display:"flex", gap:"3rem", alignItems:"flex-start", justifyContent:"center", flexWrap:"wrap"}}>
            <ChatBox/>
            <div style={{maxWidth:300}}>
              <h3 style={{fontWeight:800, fontSize:"1.1rem", color:T.text, marginBottom:"1.25rem"}}>What you're seeing</h3>
              {[{n:"01",t:"RAG retrieval",d:"FAQs retrieved by semantic similarity to the question"},{n:"02",t:"LLM response",d:"Generates answers using only your approved content"},{n:"03",t:"Scoped access",d:"Cannot answer outside its knowledge base — no hallucinations"}].map(s => (
                <div key={s.n} style={{display:"flex", gap:"1rem", marginBottom:"1.25rem"}}>
                  <div style={{minWidth:34, height:34, borderRadius:8, background:T.warm, border:`1px solid ${T.terraLight}`, display:"flex", alignItems:"center", justifyContent:"center", color:T.terra, fontSize:"0.7rem", fontWeight:800}}>{s.n}</div>
                  <div>
                    <div style={{fontWeight:700, color:T.text, fontSize:"0.875rem", marginBottom:"0.2rem"}}>{s.t}</div>
                    <div style={{color:T.muted, fontSize:"0.825rem", lineHeight:1.55}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── PRICING ── */
const Pricing = ({onContact}) => (
  <section id="pricing" style={{padding:"6rem 3rem", maxWidth:1080, margin:"0 auto"}}>
    <div style={{textAlign:"center", marginBottom:"3rem"}}>
      <span style={{fontSize:"0.75rem", color:T.terra, fontWeight:700, letterSpacing:"0.1em"}}>PRICING</span>
      <h2 style={{fontSize:"clamp(1.75rem,4vw,2.75rem)", fontWeight:800, color:T.text, marginTop:"0.5rem", letterSpacing:"-0.025em"}}>Start with what you need</h2>
      <p style={{color:T.muted, marginTop:"0.5rem", fontSize:"0.9rem"}}>One-time setup · optional monthly retainer for monitoring & updates</p>
    </div>
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1.25rem"}}>
      {[
        {name:"Automation Core", price:"€2,000–€4,000", mo:"€300–€500/mo", features:["AI support agent (Web, Telegram, WhatsApp)","Secure 4-layer architecture","JWT + Intent validation","Monthly monitoring & maintenance"], pop:false},
        {name:"Automation + Dashboard", price:"€4,000–€7,000", mo:"€500–€800/mo", features:["Everything in Core","Owner dashboard","Real-time metrics & alerts","LLM usage & cost monitoring"], pop:true},
        {name:"Full Suite", price:"€7,000–€12,000", mo:"€800–€1,500/mo", features:["Everything in Dashboard","NL2SQL interface","RAG FAQ chatbox","Priority support & updates"], pop:false},
      ].map((t,i) => (
        <div key={i} style={{background:T.surface, borderRadius:16, padding:"2rem", border:t.pop?`2px solid ${T.terra}`:`1px solid ${T.border}`, boxShadow:t.pop?`0 8px 32px rgba(196,99,58,0.18)`:T.shadow, position:"relative"}}>
          {t.pop && <div style={{position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:T.terra, color:"#fff", fontSize:"0.72rem", padding:"0.3rem 1rem", borderRadius:100, fontWeight:700, whiteSpace:"nowrap"}}>MOST POPULAR</div>}
          <div style={{fontWeight:800, fontSize:"1rem", color:T.text, marginBottom:"0.5rem"}}>{t.name}</div>
          <div style={{fontWeight:800, fontSize:"1.6rem", color:t.pop?T.terra:T.text, letterSpacing:"-0.025em"}}>{t.price}</div>
          <div style={{fontSize:"0.8rem", color:T.muted, marginBottom:"1.75rem"}}>setup · then {t.mo}</div>
          <ul style={{listStyle:"none", display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"2rem"}}>
            {t.features.map(f => <li key={f} style={{display:"flex", gap:"0.625rem", color:T.muted, fontSize:"0.875rem", alignItems:"flex-start"}}><span style={{color:T.terra, fontWeight:700, marginTop:1}}>✓</span>{f}</li>)}
          </ul>
          <button onClick={onContact} style={{display:"block", width:"100%", textAlign:"center", padding:"0.75rem", borderRadius:9, background:t.pop?T.terra:"transparent", color:t.pop?"#fff":T.text, border:t.pop?"none":`1px solid ${T.border}`, fontWeight:700, fontSize:"0.9rem", cursor:"pointer"}}>Request a demo →</button>
        </div>
      ))}
    </div>
  </section>
);

/* ── CONTACT PAGE (Cohere-style split) ── */
const ContactPage = ({onBack}) => {
  const [form, setForm] = useState({first:"", last:"", email:"", company:"", role:"", size:"", channel:"", message:""});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (k,v) => setForm(p => ({...p, [k]:v}));
  const inputStyle = {width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"0.75rem 1rem", fontSize:"0.9rem", color:T.text, outline:"none", transition:"border-color .15s"};
  const labelStyle = {fontSize:"0.78rem", fontWeight:600, color:T.muted, marginBottom:"0.375rem", display:"block", letterSpacing:"0.03em"};

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1200);
  };

  if (submitted) return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem", background:T.bg}}>
      <div style={{textAlign:"center", animation:"popIn .4s ease both"}}>
        <div style={{fontSize:"3rem", marginBottom:"1rem"}}>🎉</div>
        <h2 style={{fontSize:"2rem", fontWeight:800, color:T.text, marginBottom:"0.75rem"}}>Request received!</h2>
        <p style={{color:T.muted, fontSize:"1rem", marginBottom:"2rem", maxWidth:400}}>We'll review your request and get back to you within one business day to schedule your demo.</p>
        <button className="btn-primary" onClick={onBack} style={{padding:"0.75rem 2rem", fontSize:"1rem", borderRadius:10}}>← Back to site</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:T.bg}}>
      {/* Mini nav */}
      <div style={{height:64, display:"flex", alignItems:"center", padding:"0 2.5rem", borderBottom:`1px solid ${T.border}`, background:T.surface}}>
        <button onClick={onBack} style={{display:"flex", alignItems:"center", gap:"0.5rem", background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:"0.875rem", fontWeight:500}}>
          <div style={{display:"flex", gap:3}}>{["#C4633A","#7c6af7","#22c55e"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}</div>
          <span style={{fontWeight:800, fontSize:"1.05rem", color:T.text, letterSpacing:"-0.025em"}}>jm20</span>
        </button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:"calc(100vh - 64px)"}}>
        {/* Left — pitch */}
        <div style={{padding:"5rem 4rem", background:T.warm, display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <span style={{fontSize:"0.75rem", color:T.terra, fontWeight:700, letterSpacing:"0.1em", marginBottom:"1rem", display:"block"}}>FREE 30-MINUTE DEMO</span>
          <h1 style={{fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:T.text, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:"1.25rem"}}>
            Ready to put AI<br/>to work?
          </h1>
          <p style={{color:T.muted, fontSize:"0.975rem", lineHeight:1.7, marginBottom:"2.5rem"}}>
            Request a demo and see how JM20 can reduce your support workload while keeping your data secure inside the EU.
          </p>
          <div style={{display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"3rem"}}>
            {[
              "See the AI support agent live on Web, Telegram & WhatsApp",
              "Understand how the 4-layer security architecture protects your data",
              "Get a GDPR compliance walkthrough for your specific setup",
              "Receive a custom pricing estimate for your business",
            ].map(t => (
              <div key={t} style={{display:"flex", alignItems:"flex-start", gap:"0.75rem"}}>
                <div style={{width:20, height:20, borderRadius:"50%", background:T.terraLight, border:`1px solid ${T.terra}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", color:T.terra, fontWeight:800, flexShrink:0, marginTop:1}}>✓</div>
                <span style={{fontSize:"0.9rem", color:T.text, lineHeight:1.5}}>{t}</span>
              </div>
            ))}
          </div>
          {/* Trust badges */}
          <div style={{display:"flex", flexWrap:"wrap", gap:"0.625rem"}}>
            {["🇪🇺 EU Data Residency","🔒 GDPR Art. 28","🛡️ Zero DB Exposure","🔑 You Own It"].map(b => (
              <span key={b} style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:100, padding:"0.3rem 0.875rem", fontSize:"0.775rem", color:T.text, fontWeight:600}}>{b}</span>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div style={{padding:"4rem 4rem", display:"flex", flexDirection:"column", justifyContent:"center", overflowY:"auto"}}>
          <h2 style={{fontSize:"1.5rem", fontWeight:800, color:T.text, marginBottom:"0.375rem", letterSpacing:"-0.02em"}}>Tell us about yourself</h2>
          <p style={{color:T.muted, fontSize:"0.875rem", marginBottom:"2rem"}}>We'll get back to you within one business day.</p>

          <form onSubmit={submit} style={{display:"flex", flexDirection:"column", gap:"1.25rem"}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
              <div>
                <label style={labelStyle}>FIRST NAME *</label>
                <input required value={form.first} onChange={e=>update("first",e.target.value)} placeholder="María" style={inputStyle} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
              <div>
                <label style={labelStyle}>LAST NAME *</label>
                <input required value={form.last} onChange={e=>update("last",e.target.value)} placeholder="García" style={inputStyle} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>BUSINESS EMAIL *</label>
              <input required type="email" value={form.email} onChange={e=>update("email",e.target.value)} placeholder="maria@company.com" style={inputStyle} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
              <div>
                <label style={labelStyle}>COMPANY</label>
                <input value={form.company} onChange={e=>update("company",e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
              <div>
                <label style={labelStyle}>YOUR ROLE</label>
                <input value={form.role} onChange={e=>update("role",e.target.value)} placeholder="CTO / Founder / Ops" style={inputStyle} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
              </div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
              <div>
                <label style={labelStyle}>COMPANY SIZE</label>
                <select value={form.size} onChange={e=>update("size",e.target.value)} style={{...inputStyle, appearance:"none", cursor:"pointer"}}>
                  <option value="">Select…</option>
                  {["1–10","11–50","51–200","201–500","500+"].map(s=><option key={s}>{s} employees</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>MAIN CHANNEL</label>
                <select value={form.channel} onChange={e=>update("channel",e.target.value)} style={{...inputStyle, appearance:"none", cursor:"pointer"}}>
                  <option value="">Select…</option>
                  {["Web Chat","Telegram","WhatsApp","Multiple"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>WHAT ARE YOU TRYING TO SOLVE?</label>
              <textarea value={form.message} onChange={e=>update("message",e.target.value)} placeholder="Tell us about your current support setup and main pain points…" rows={3} style={{...inputStyle, resize:"vertical"}} onFocus={e=>e.target.style.borderColor=T.terra} onBlur={e=>e.target.style.borderColor=T.border}/>
            </div>
            <button type="submit" disabled={sending} style={{background:T.text, color:"#fff", border:"none", borderRadius:10, padding:"0.9rem", fontSize:"1rem", fontWeight:700, cursor:sending?"not-allowed":"pointer", opacity:sending?.7:1, transition:"opacity .2s"}}>
              {sending ? "Sending…" : "Request your free demo →"}
            </button>
            <p style={{fontSize:"0.75rem", color:T.muted, textAlign:"center", lineHeight:1.5}}>
              🇪🇺 Your data stays in the EU. We never share your information with third parties.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── APP ── */
export default function App() {
  const [page, setPage] = useState("home");

  if (page === "contact") return <ContactPage onBack={() => setPage("home")}/>;

  return (
    <>
      <style>{css}</style>
      <div style={{background:T.bg, minHeight:"100vh", color:T.text}}>
        <TrustBar/>
        <Nav onContact={() => setPage("contact")}/>
        <Hero onContact={() => setPage("contact")}/>
        <Security/>
        <Services/>
        <DemoSection/>
        <Pricing onContact={() => setPage("contact")}/>
        {/* CTA */}
        <section style={{padding:"6rem 3rem", textAlign:"center", background:T.warm, borderTop:`1px solid ${T.border}`}}>
          <h2 style={{fontSize:"clamp(1.75rem,4vw,2.75rem)", fontWeight:800, color:T.text, letterSpacing:"-0.025em", marginBottom:"1rem"}}>Your data never leaves the EU.<br/><span style={{color:T.terra}}>Your competitors' data might.</span></h2>
          <p style={{color:T.muted, fontSize:"1rem", maxWidth:480, margin:"0 auto 2.5rem", lineHeight:1.7}}>Book a free 30-minute demo. We'll show you exactly how the system works — live, on your questions.</p>
          <button className="btn-primary" onClick={() => setPage("contact")} style={{padding:"1rem 2.75rem", fontSize:"1rem", borderRadius:10, boxShadow:`0 6px 24px rgba(28,25,23,0.2)`}}>Request a free demo →</button>
          <div style={{marginTop:"2.5rem", color:"#C4B8B0", fontSize:"0.8rem", fontWeight:500}}>Spain & EU · GDPR Article 28 · 20+ years experience · You own the system</div>
        </section>
      </div>
    </>
  );
}
