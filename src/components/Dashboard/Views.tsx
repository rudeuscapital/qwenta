import { useState, useEffect } from "react";
import DashboardLayout from "./Layout.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Shared ──────────────────────────────────────────────────────────────────
const fB = (n:number) => n>=1e12?`$${(n/1e12).toFixed(1)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:n>=1e6?`$${(n/1e6).toFixed(0)}M`:"—";
const fV = (n:number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:`${(n/1e3).toFixed(0)}K`;

// ─── WATCHLIST ────────────────────────────────────────────────────────────────
export function WatchlistView({ wallet }:{ wallet:string }) {
  const [lists, setLists] = useState<{id:number;name:string}[]>([]);
  const [activeId, setActiveId] = useState<number|null>(null);
  const [items, setItems] = useState<{id:number;symbol:string;notes:string;quote?:{price:number;changePct:number;volume:number;marketCap:number}}[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSym, setNewSym] = useState(""), [newNotes, setNewNotes] = useState(""), [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false), [showNew, setShowNew] = useState(false);

  const loadLists = async () => { const r = await fetch("/api/watchlist"); const d = await r.json() as {id:number;name:string}[]; setLists(d); if(!activeId&&d.length>0) setActiveId(d[0].id); };
  const loadItems = async (id:number) => { setLoading(true); const r = await fetch(`/api/watchlist?id=${id}`); const d = await r.json() as {items:{id:number;symbol:string;notes:string;quote?:{price:number;changePct:number;volume:number;marketCap:number}}[]}; setItems(d.items??[]); setLoading(false); };
  const post = (body:Record<string,unknown>) => fetch("/api/watchlist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});

  useEffect(()=>{loadLists();},[]);
  useEffect(()=>{if(activeId)loadItems(activeId);},[activeId]);

  return (
    <DashboardLayout active="/dashboard/watchlist" wallet={wallet}>
      <div className="flex h-full overflow-hidden">
        {/* List sidebar */}
        <div className="w-48 border-r border-void-700 bg-void-850 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-void-700">
            <span className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">WATCHLISTS</span>
            <button onClick={()=>setShowNew(true)} className="text-void-500 hover:text-cyan-400 text-base transition-colors">+</button>
          </div>
          {showNew && <div className="px-3 py-2 border-b border-void-700 bg-void-800">
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name..." onKeyDown={async e=>{if(e.key==="Enter"&&newName.trim()){await post({action:"create_list",name:newName});setNewName("");setShowNew(false);loadLists();}}}
              className="w-full bg-void-700 border border-void-600 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-500 focus:outline-none focus:border-cyan-500/30 mb-1.5"/>
            <button onClick={async()=>{if(newName.trim()){await post({action:"create_list",name:newName});setNewName("");setShowNew(false);loadLists();}}} className="w-full px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-[9px] font-mono">CREATE</button>
          </div>}
          <div className="flex-1 overflow-y-auto py-2">
            {lists.map(l=><div key={l.id} onClick={()=>setActiveId(l.id)}
              className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${activeId===l.id?"bg-cyan-500/10 border-r-2 border-cyan-400":"hover:bg-void-800"}`}>
              <span className={`text-xs font-sans ${activeId===l.id?"text-cyan-300":"text-slate-400"}`}>{l.name}</span>
            </div>)}
          </div>
        </div>
        {/* Items */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0">
            <input value={newSym} onChange={e=>setNewSym(e.target.value.toUpperCase())} placeholder="Symbol" className="bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-void-500 w-28 focus:outline-none focus:border-cyan-500/40 uppercase"/>
            <input value={newNotes} onChange={e=>setNewNotes(e.target.value)} placeholder="Notes (optional)" className="flex-1 bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 placeholder-void-500 focus:outline-none focus:border-cyan-500/40"/>
            <button disabled={!newSym.trim()||adding} onClick={async()=>{if(!activeId||!newSym.trim())return;setAdding(true);await post({action:"add",watchlist_id:activeId,symbol:newSym,notes:newNotes});setNewSym("");setNewNotes("");setAdding(false);loadItems(activeId);}}
              className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors">{adding?"...":"ADD"}</button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading?<div className="flex items-center justify-center h-full"><p className="text-[10px] font-mono text-void-500">Loading...</p></div>:items.length===0?
              <div className="flex flex-col items-center justify-center h-full gap-2"><p className="text-void-600 font-display text-xl italic">Empty watchlist</p><p className="text-[10px] font-mono text-void-600">Add symbols above</p></div>:
              <table className="w-full text-xs font-mono">
                <thead className="sticky top-0 bg-void-850 border-b border-void-700">
                  <tr>{["SYMBOL","PRICE","CHANGE","VOLUME","MKT CAP","NOTES",""].map(h=><th key={h} className="text-left px-4 py-2 text-[9px] text-void-500 tracking-widest font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map((item,i)=>{const q=item.quote,pos=(q?.changePct??0)>=0;return(
                    <tr key={item.id} className={`border-b border-void-800 hover:bg-void-800/50 transition-colors ${i%2===0?"":"bg-void-900/20"}`}>
                      <td className="px-4 py-2.5"><a href={`/dashboard?sym=${item.symbol}`} className="text-cyan-400 font-semibold hover:text-cyan-300">{item.symbol}</a></td>
                      <td className="px-4 py-2.5 text-slate-200">{q?.price?`$${q.price.toFixed(2)}`:"—"}</td>
                      <td className={`px-4 py-2.5 ${pos?"text-bull":"text-bear"}`}>{q?.changePct!=null?`${pos?"+":""}${q.changePct.toFixed(2)}%`:"—"}</td>
                      <td className="px-4 py-2.5 text-slate-400">{q?.volume?fV(q.volume):"—"}</td>
                      <td className="px-4 py-2.5 text-slate-400">{q?.marketCap?fB(q.marketCap):"—"}</td>
                      <td className="px-4 py-2.5 text-void-500 text-[9px] max-w-[120px] truncate">{item.notes}</td>
                      <td className="px-4 py-2.5"><button onClick={async()=>{await post({action:"remove",item_id:item.id});if(activeId)loadItems(activeId);}} className="text-void-600 hover:text-bear transition-colors">✕</button></td>
                    </tr>);})}
                </tbody>
              </table>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
export function PortfolioView({ wallet }:{ wallet:string }) {
  const [portfolios, setPortfolios] = useState<{id:number;name:string}[]>([]);
  const [activeId, setActiveId] = useState<number|null>(null);
  const [positions, setPositions] = useState<{id:number;symbol:string;shares:number;avg_cost:number;currentPrice:number;changePct:number;marketValue:number;costBasis:number;unrealizedPnl:number;unrealizedPct:number}[]>([]);
  const [transactions, setTransactions] = useState<{id:number;symbol:string;type:string;shares:number;price:number;fee:number;executed_at:string;notes:string}[]>([]);
  const [summary, setSummary] = useState<{totalValue:number;totalCost:number;totalPnl:number;totalPnlPct:number;positionCount:number}|null>(null);
  const [view, setView] = useState<"positions"|"transactions">("positions");
  const [showTrade, setShowTrade] = useState(false);
  const [tf, setTf] = useState({symbol:"",shares:"",price:"",fee:"0",notes:"",type:"buy"});
  const [submitting, setSubmitting] = useState(false);

  const loadPortfolios = async () => { const r=await fetch("/api/portfolio"); const d=await r.json() as {id:number;name:string}[]; setPortfolios(d); if(d.length>0&&!activeId) setActiveId(d[0].id); };
  const loadPortfolio = async (id:number) => { const r=await fetch(`/api/portfolio?id=${id}`); const d=await r.json() as {positions:typeof positions;transactions:typeof transactions;summary:typeof summary}; setPositions(d.positions??[]); setTransactions(d.transactions??[]); setSummary(d.summary??null); };
  const post = (body:Record<string,unknown>) => fetch("/api/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});

  useEffect(()=>{loadPortfolios();},[]);
  useEffect(()=>{if(activeId)loadPortfolio(activeId);},[activeId]);

  const submitTrade = async () => {
    if(!tf.symbol||!tf.shares||!tf.price||!activeId)return;
    setSubmitting(true);
    await post({action:tf.type,portfolio_id:activeId,symbol:tf.symbol.toUpperCase(),shares:+tf.shares,price:+tf.price,fee:+tf.fee,notes:tf.notes});
    setSubmitting(false); setShowTrade(false); setTf({symbol:"",shares:"",price:"",fee:"0",notes:"",type:"buy"});
    loadPortfolio(activeId);
  };

  return (
    <DashboardLayout active="/dashboard/portfolio" wallet={wallet}>
      <header className="flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0">
        <span className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">PORTFOLIO</span>
        <div className="flex gap-1.5 overflow-x-auto">
          {portfolios.map(p=><button key={p.id} onClick={()=>setActiveId(p.id)} className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors border ${activeId===p.id?"bg-cyan-500/15 text-cyan-400 border-cyan-500/30":"text-void-500 border-void-700 hover:text-slate-400"}`}>{p.name}</button>)}
          <button onClick={async()=>{const n=prompt("Portfolio name:");if(!n)return;await post({action:"create",name:n});loadPortfolios();}} className="px-2 py-1 text-[10px] font-mono text-void-500 border border-void-700 rounded hover:text-cyan-400 transition-colors">+ NEW</button>
        </div>
        <div className="ml-auto"><button onClick={()=>setShowTrade(true)} className="px-3 py-1.5 bg-bull/10 border border-bull/30 rounded-lg text-bull text-[10px] font-mono hover:bg-bull/20 transition-colors">+ TRADE</button></div>
      </header>
      {summary && <div className="flex gap-3 px-5 py-2.5 border-b border-void-700 bg-void-900/50 shrink-0 overflow-x-auto">
        {[["Total Value",`$${summary.totalValue.toFixed(2)}`,"text-white"],["Total Cost",`$${summary.totalCost.toFixed(2)}`,"text-slate-400"],
          ["Unrealized P&L",`${summary.totalPnl>=0?"+":""}$${Math.abs(summary.totalPnl).toFixed(2)}`,summary.totalPnl>=0?"text-bull":"text-bear"],
          ["Return",`${summary.totalPnlPct>=0?"+":""}${summary.totalPnlPct.toFixed(2)}%`,summary.totalPnlPct>=0?"text-bull":"text-bear"],
          ["Positions",String(summary.positionCount),"text-cyan-400"]
        ].map(([l,v,c])=><div key={l} className="bg-void-800 border border-void-700 rounded-lg px-4 py-2 shrink-0"><p className="text-[9px] font-mono text-void-500 uppercase tracking-widest">{l}</p><p className={`text-sm font-mono font-semibold mt-0.5 ${c}`}>{v}</p></div>)}
      </div>}
      <div className="flex gap-1 px-5 py-2 border-b border-void-700 bg-void-850 shrink-0">
        {(["positions","transactions"] as const).map(t=><button key={t} onClick={()=>setView(t)} className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest rounded transition-colors ${view===t?"bg-cyan-500/10 text-cyan-400 border border-cyan-500/20":"text-void-500 hover:text-slate-400"}`}>{t}</button>)}
      </div>
      <div className="flex-1 overflow-auto">
        {view==="positions"?<table className="w-full text-xs font-mono"><thead className="sticky top-0 bg-void-850 border-b border-void-700"><tr>{["SYMBOL","SHARES","AVG COST","CURRENT","MKT VALUE","COST BASIS","P&L","RETURN","DAY %"].map(h=><th key={h} className="text-left px-4 py-2 text-[9px] text-void-500 tracking-widest">{h}</th>)}</tr></thead>
          <tbody>{positions.length===0?<tr><td colSpan={9} className="px-4 py-8 text-center text-void-600 text-sm">No positions. Record a trade to start.</td></tr>:positions.map((p,i)=>(
            <tr key={p.id} className={`border-b border-void-800 hover:bg-void-800/40 transition-colors ${i%2===0?"":"bg-void-900/20"}`}>
              <td className="px-4 py-2.5 text-cyan-400 font-semibold">{p.symbol}</td>
              <td className="px-4 py-2.5 text-slate-300">{Number(p.shares).toFixed(4)}</td>
              <td className="px-4 py-2.5 text-slate-400">${Number(p.avg_cost).toFixed(2)}</td>
              <td className="px-4 py-2.5 text-slate-200">${p.currentPrice.toFixed(2)}</td>
              <td className="px-4 py-2.5 text-slate-200 font-medium">${p.marketValue.toFixed(2)}</td>
              <td className="px-4 py-2.5 text-slate-400">${p.costBasis.toFixed(2)}</td>
              <td className={`px-4 py-2.5 font-medium ${p.unrealizedPnl>=0?"text-bull":"text-bear"}`}>{p.unrealizedPnl>=0?"+":""}${Math.abs(p.unrealizedPnl).toFixed(2)}</td>
              <td className={`px-4 py-2.5 ${p.unrealizedPct>=0?"text-bull":"text-bear"}`}>{p.unrealizedPct>=0?"+":""}{p.unrealizedPct.toFixed(2)}%</td>
              <td className={`px-4 py-2.5 ${p.changePct>=0?"text-bull":"text-bear"}`}>{p.changePct>=0?"+":""}{p.changePct.toFixed(2)}%</td>
            </tr>))}</tbody></table>:
          <table className="w-full text-xs font-mono"><thead className="sticky top-0 bg-void-850 border-b border-void-700"><tr>{["DATE","SYMBOL","TYPE","SHARES","PRICE","FEE","TOTAL","NOTES"].map(h=><th key={h} className="text-left px-4 py-2 text-[9px] text-void-500 tracking-widest">{h}</th>)}</tr></thead>
            <tbody>{transactions.length===0?<tr><td colSpan={8} className="px-4 py-8 text-center text-void-600 text-sm">No transactions yet.</td></tr>:transactions.map((tx,i)=>(
              <tr key={tx.id} className={`border-b border-void-800 hover:bg-void-800/40 transition-colors ${i%2===0?"":"bg-void-900/20"}`}>
                <td className="px-4 py-2.5 text-slate-400">{new Date(tx.executed_at).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-cyan-400 font-semibold">{tx.symbol}</td>
                <td className={`px-4 py-2.5 font-semibold ${tx.type==="BUY"?"text-bull":"text-bear"}`}>{tx.type}</td>
                <td className="px-4 py-2.5 text-slate-300">{Number(tx.shares).toFixed(4)}</td>
                <td className="px-4 py-2.5 text-slate-300">${Number(tx.price).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-slate-500">${Number(tx.fee).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-slate-200 font-medium">${(Number(tx.shares)*Number(tx.price)).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-void-500 text-[9px]">{tx.notes}</td>
              </tr>))}</tbody></table>}
      </div>
      {showTrade && <div className="fixed inset-0 bg-void-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-void-850 border border-void-600 rounded-2xl p-6 w-96 shadow-panel">
          <div className="flex justify-between items-center mb-5"><h2 className="text-white font-display italic text-xl">Record Trade</h2><button onClick={()=>setShowTrade(false)} className="text-void-500 hover:text-slate-400">✕</button></div>
          <div className="flex gap-2 mb-4">{(["buy","sell"] as const).map(t=><button key={t} onClick={()=>setTf(p=>({...p,type:t}))} className={`flex-1 py-1.5 text-xs font-mono uppercase rounded border transition-colors ${tf.type===t?t==="buy"?"bg-bull/10 border-bull/40 text-bull":"bg-bear/10 border-bear/40 text-bear":"bg-void-800 border-void-700 text-void-500 hover:text-slate-400"}`}>{t}</button>)}</div>
          <div className="space-y-3">
            {[["symbol","Symbol","AAPL"],[" shares","Shares","100"],["price","Price ($)","150.00"],["fee","Fee ($)","0"],["notes","Notes","Optional"]].map(([k,l,ph])=>(
              <div key={k}><label className="text-[9px] font-mono text-void-500 uppercase tracking-widest block mb-1">{l}</label>
                <input value={(tf as Record<string,string>)[k]} onChange={e=>setTf(p=>({...p,[k]:k==="symbol"?e.target.value.toUpperCase():e.target.value}))} placeholder={ph}
                  className="w-full bg-void-800 border border-void-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-void-500 focus:outline-none focus:border-cyan-500/30 transition-colors"/></div>))}
          </div>
          <button onClick={submitTrade} disabled={submitting||!tf.symbol||!tf.shares||!tf.price}
            className={`w-full mt-5 py-2.5 rounded-xl font-mono text-sm font-semibold border transition-all disabled:opacity-40 ${tf.type==="buy"?"bg-bull/10 border-bull/40 text-bull hover:bg-bull/20":"bg-bear/10 border-bear/40 text-bear hover:bg-bear/20"}`}>
            {submitting?"Recording...":` Record ${tf.type.toUpperCase()}`}
          </button>
        </div>
      </div>}
    </DashboardLayout>
  );
}

// ─── SCREENER ─────────────────────────────────────────────────────────────────
const PRESETS = [
  {label:"Oversold RSI",filters:{rsiMin:0,rsiMax:30}},{label:"Overbought RSI",filters:{rsiMin:70,rsiMax:100}},
  {label:"MACD Bullish",filters:{macdBullish:true}},{label:"Golden Cross",filters:{smaCross:true,priceAboveSma50:true}},
  {label:"Strong Uptrend",filters:{macdBullish:true,priceAboveSma20:true,priceAboveSma50:true}},
];

export function ScreenerView({ wallet }:{ wallet:string }) {
  const [filters, setFilters] = useState<Record<string,unknown>>({});
  const [results, setResults] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(false), [ran, setRan] = useState(false);
  const [sortBy, setSortBy] = useState("changePct"), [sortDir, setSortDir] = useState<1|-1>(-1);

  const run = async (f?:Record<string,unknown>) => {
    setLoading(true); setRan(false);
    const r = await fetch("/api/screener",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filters:f??filters})});
    const d = await r.json() as {results:Record<string,unknown>[]};
    setResults(d.results??[]); setLoading(false); setRan(true);
  };
  const setF = (k:string, v:unknown) => setFilters(p => { const n={...p}; v===undefined?delete n[k]:n[k]=v; return n; });
  const sort = (k:string) => { if(sortBy===k)setSortDir(d=>d===1?-1:1); else {setSortBy(k);setSortDir(-1);} };
  const sorted = [...results].sort((a,b)=>((a[sortBy] as number)-(b[sortBy] as number))*sortDir);
  const Th = ({k,l}:{k:string;l:string}) => <th onClick={()=>sort(k)} className={`text-left px-3 py-2 text-[9px] tracking-widest cursor-pointer hover:text-cyan-400 transition-colors ${sortBy===k?"text-cyan-400":"text-void-500"}`}>{l}{sortBy===k?(sortDir===-1?" ↓":" ↑"):""}</th>;

  return (
    <DashboardLayout active="/dashboard/screener" wallet={wallet}>
      <div className="flex h-full overflow-hidden">
        <div className="w-60 border-r border-void-700 bg-void-850 flex flex-col shrink-0 overflow-y-auto">
          <div className="px-4 py-3 border-b border-void-700"><p className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">FILTERS</p></div>
          <div className="px-4 py-3 space-y-4">
            <div><p className="text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2">Quick Presets</p>
              {PRESETS.map(p=><button key={p.label} onClick={()=>{setFilters(p.filters);run(p.filters);}} className="w-full text-left px-2.5 py-1.5 text-[10px] font-sans text-slate-400 hover:text-cyan-300 hover:bg-void-800 rounded transition-colors">{p.label}</button>)}
            </div>
            <div className="h-px bg-void-700"/>
            <div><p className="text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2">RSI (14)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={(filters.rsiMin as number)??""} onChange={e=>setF("rsiMin",e.target.value?+e.target.value:undefined)} className="w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"/>
                <input type="number" placeholder="Max" value={(filters.rsiMax as number)??""} onChange={e=>setF("rsiMax",e.target.value?+e.target.value:undefined)} className="w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"/>
              </div>
            </div>
            <div><p className="text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2">Daily Change %</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={(filters.changePctMin as number)??""} onChange={e=>setF("changePctMin",e.target.value?+e.target.value:undefined)} className="w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"/>
                <input type="number" placeholder="Max" value={(filters.changePctMax as number)??""} onChange={e=>setF("changePctMax",e.target.value?+e.target.value:undefined)} className="w-full bg-void-800 border border-void-700 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder-void-600 focus:outline-none focus:border-cyan-500/30"/>
              </div>
            </div>
            <div className="space-y-2"><p className="text-[9px] font-mono text-void-500 uppercase tracking-widest">Conditions</p>
              {[{k:"macdBullish",l:"MACD Bullish"},{k:"smaCross",l:"Golden Cross (SMA20>50)"},{k:"priceAboveSma20",l:"Price > SMA20"},{k:"priceAboveSma50",l:"Price > SMA50"}].map(({k,l})=>(
                <label key={k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!filters[k]} onChange={e=>setF(k,e.target.checked?true:undefined)} className="accent-cyan-500 w-3 h-3"/><span className="text-[10px] font-sans text-slate-400">{l}</span></label>))}
            </div>
          </div>
          <div className="mt-auto px-4 pb-4">
            <button onClick={()=>run()} disabled={loading} className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors">{loading?"SCANNING...":"RUN SCREENER"}</button>
            <button onClick={()=>setFilters({})} className="w-full mt-1.5 py-1.5 text-[9px] font-mono text-void-500 hover:text-slate-400 transition-colors">RESET</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex items-center gap-3">
            <p className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">SCREENER RESULTS</p>
            {ran && <span className="text-[9px] font-mono text-void-500">{results.length} matches</span>}
          </div>
          <div className="flex-1 overflow-auto">
            {loading?<div className="flex flex-col items-center justify-center h-full gap-3"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" style={{animationDelay:`${i*0.16}s`}}/>)}</div><p className="text-[10px] font-mono text-void-500">Scanning universe...</p></div>:
            !ran?<div className="flex flex-col items-center justify-center h-full gap-2"><p className="text-void-600 font-display text-xl italic">Run the screener</p><p className="text-[10px] font-mono text-void-600">Set filters, then click RUN SCREENER</p></div>:
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-void-850 border-b border-void-700"><tr><Th k="symbol" l="SYMBOL"/><Th k="price" l="PRICE"/><Th k="changePct" l="CHANGE %"/><Th k="rsi" l="RSI"/><Th k="macd" l="MACD"/><Th k="volume" l="VOL"/><Th k="marketCap" l="MKT CAP"/><th className="text-left px-3 py-2 text-[9px] text-void-500">SIGNALS</th></tr></thead>
              <tbody>{sorted.map((r,i)=>(
                <tr key={r.symbol as string} className={`border-b border-void-800 hover:bg-void-800/40 transition-colors ${i%2===0?"":"bg-void-900/20"}`}>
                  <td className="px-3 py-2.5"><a href={`/dashboard?sym=${r.symbol}`} className="text-cyan-400 font-semibold hover:text-cyan-300">{r.symbol as string}</a></td>
                  <td className="px-3 py-2.5 text-slate-200">${(r.price as number)?.toFixed(2)}</td>
                  <td className={`px-3 py-2.5 ${(r.changePct as number)>=0?"text-bull":"text-bear"}`}>{(r.changePct as number)>=0?"+":""}{(r.changePct as number)?.toFixed(2)}%</td>
                  <td className={`px-3 py-2.5 ${(r.rsi as number)>70?"text-bear":(r.rsi as number)<30?"text-bull":"text-cyan-400"}`}>{(r.rsi as number)?.toFixed(1)}</td>
                  <td className={`px-3 py-2.5 ${r.macdBullish?"text-bull":"text-bear"}`}>{(r.macd as number)?.toFixed(4)}</td>
                  <td className="px-3 py-2.5 text-slate-400">{fV(r.volume as number)}</td>
                  <td className="px-3 py-2.5 text-slate-400">{fB(r.marketCap as number)}</td>
                  <td className="px-3 py-2.5"><div className="flex gap-1">{r.macdBullish&&<span className="px-1.5 py-0.5 bg-bull/10 text-bull text-[8px] rounded">MACD↑</span>}{r.smaCross&&<span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] rounded">GC</span>}{(r.rsi as number)<30&&<span className="px-1.5 py-0.5 bg-bull/10 text-bull text-[8px] rounded">OS</span>}{(r.rsi as number)>70&&<span className="px-1.5 py-0.5 bg-bear/10 text-bear text-[8px] rounded">OB</span>}</div></td>
                </tr>))}</tbody>
            </table>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── NEWS & SENTIMENT ────────────────────────────────────────────────────────
interface NewsItem { title: string; link: string; source: string; pubDate: string }
interface SentimentResult { sentiment: "bullish"|"bearish"|"neutral"; score: number; summary: string }

export function NewsView({ wallet }:{ wallet:string }) {
  const [symbol, setSymbol] = useState("AAPL");
  const [input, setInput] = useState("AAPL");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentResult|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const loadNews = async (sym: string) => {
    setLoading(true); setError(null); setSentiment(null);
    try {
      const r = await fetch(`/api/news?symbol=${sym}`);
      const d = await r.json() as { news: NewsItem[]; sentiment: SentimentResult|null; error?: string };
      if (!r.ok) throw new Error(d.error ?? "Failed to fetch news");
      setNews(d.news ?? []);
      setSentiment(d.sentiment);
    } catch (e) { setError((e as Error).message); setNews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNews(symbol); }, [symbol]);

  const POPULAR = ["AAPL","NVDA","TSLA","MSFT","GOOGL","AMZN","BTC-USD","META"];
  const scoreColor = (s: number) => s > 20 ? "text-bull" : s < -20 ? "text-bear" : "text-cyan-400";
  const sentimentBg = (s: string) => s === "bullish" ? "bg-bull/10 border-bull/30" : s === "bearish" ? "bg-bear/10 border-bear/30" : "bg-cyan-500/10 border-cyan-500/30";
  const sentimentText = (s: string) => s === "bullish" ? "text-bull" : s === "bearish" ? "text-bear" : "text-cyan-400";
  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    } catch { return ""; }
  };

  return (
    <DashboardLayout active="/dashboard/news" wallet={wallet}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 overflow-x-auto">
        <span className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold shrink-0">NEWS & SENTIMENT</span>
        <form onSubmit={e=>{e.preventDefault();const s=input.trim().toUpperCase();if(s){setSymbol(s);}}} className="flex gap-2 shrink-0">
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} placeholder="Symbol"
            className="bg-void-800 border border-void-600 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-void-500 w-24 focus:outline-none focus:border-cyan-500/40 uppercase" />
          <button type="submit" className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 transition-colors">GO</button>
        </form>
        <div className="flex gap-1 overflow-x-auto">
          {POPULAR.map(s => <button key={s} onClick={()=>{setSymbol(s);setInput(s);}}
            className={`px-2 py-1 text-[10px] font-mono rounded whitespace-nowrap transition-colors ${symbol===s?"bg-cyan-500/15 text-cyan-400 border border-cyan-500/25":"text-void-500 hover:text-slate-400"}`}>{s}</button>)}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sentiment panel */}
        <div className="w-72 border-r border-void-700 bg-void-850 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-void-700">
            <p className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">AI SENTIMENT</p>
            <p className="text-[9px] font-mono text-void-500 mt-0.5">Powered by QwenAI</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {loading && <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" style={{ animationDelay: `${i * 0.16}s` }} />)}</div>
              <p className="text-[10px] font-mono text-void-500">Analyzing sentiment...</p>
            </div>}
            {!loading && sentiment && <>
              {/* Score gauge */}
              <div className={`rounded-xl border p-4 mb-4 ${sentimentBg(sentiment.sentiment)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold uppercase tracking-widest ${sentimentText(sentiment.sentiment)}`}>{sentiment.sentiment}</span>
                  <span className={`text-2xl font-mono font-bold ${scoreColor(sentiment.score)}`}>{sentiment.score > 0 ? "+" : ""}{sentiment.score}</span>
                </div>
                {/* Score bar */}
                <div className="relative h-2 bg-void-900/50 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-void-600" />
                  <div className={`absolute inset-y-0 rounded-full transition-all ${sentiment.score >= 0 ? "bg-bull" : "bg-bear"}`}
                    style={sentiment.score >= 0 ? { left: "50%", width: `${sentiment.score / 2}%` } : { right: "50%", width: `${Math.abs(sentiment.score) / 2}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] font-mono text-bear">-100</span>
                  <span className="text-[8px] font-mono text-void-500">0</span>
                  <span className="text-[8px] font-mono text-bull">+100</span>
                </div>
              </div>
              {/* AI Summary */}
              <div className="bg-void-800 border border-void-700 rounded-xl p-3">
                <p className="text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2">AI Analysis</p>
                <p className="text-[11px] font-mono text-slate-300 leading-relaxed">{sentiment.summary}</p>
              </div>
            </>}
            {!loading && !sentiment && !error && <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-void-600 font-mono text-xs">No sentiment data</p>
              <p className="text-[9px] font-mono text-void-600">Requires Ollama running</p>
            </div>}
          </div>
        </div>

        {/* News feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex items-center gap-3">
            <p className="text-[10px] font-mono text-void-500 tracking-widest">
              <span className="text-white font-semibold">{symbol}</span> — {news.length} articles
            </p>
            <button onClick={() => loadNews(symbol)} className="ml-auto text-[9px] font-mono text-void-500 hover:text-cyan-400 transition-colors">REFRESH</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="flex items-center justify-center h-full"><div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" style={{ animationDelay: `${i * 0.16}s` }} />)}</div></div>}
            {error && !loading && <div className="flex items-center justify-center h-full"><div className="bg-bear-dim border border-bear/20 rounded-xl px-6 py-4 text-bear font-mono text-sm">{error}</div></div>}
            {!loading && !error && news.length === 0 && <div className="flex flex-col items-center justify-center h-full gap-2"><p className="text-void-600 font-display text-xl italic">No news found</p><p className="text-[10px] font-mono text-void-600">Try a different symbol</p></div>}
            {!loading && !error && news.length > 0 && <div className="divide-y divide-void-800">
              {news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="block px-5 py-3.5 hover:bg-void-800/50 transition-colors group">
                  <p className="text-sm text-slate-200 font-sans leading-snug group-hover:text-cyan-300 transition-colors mb-1.5">{item.title}</p>
                  <div className="flex items-center gap-3">
                    {item.source && <span className="text-[10px] font-mono text-cyan-400/70">{item.source}</span>}
                    {item.pubDate && <span className="text-[10px] font-mono text-void-500">{timeAgo(item.pubDate)}</span>}
                  </div>
                </a>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── COMPARE ──────────────────────────────────────────────────────────────────
const COLORS = ["#06b6d4","#22c55e","#3b82f6","#f43f5e","#a3e635","#f59e0b"];
type Period = "1mo"|"3mo"|"6mo"|"1y"|"2y";

export function CompareView({ wallet }:{ wallet:string }) {
  const [symbols, setSymbols] = useState(["AAPL","NVDA","MSFT"]);
  const [input, setInput] = useState(""), [period, setPeriod] = useState<Period>("6mo");
  const [data, setData] = useState<{symbol:string;quote:{shortName:string;regularMarketPrice:number;regularMarketChangePercent:number};normalized:{date:string;value:number}[];error?:string}[]>([]);
  const [chartData, setChartData] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    if(symbols.length<2)return; setLoading(true);
    const r = await fetch(`/api/compare?symbols=${symbols.join(",")}&period=${period}`);
    const d = await r.json() as {data:typeof data};
    setData(d.data??[]); setLoading(false);
    const dm = new Map<string,Record<string,unknown>>();
    for(const item of d.data??[]) { if(item.error)continue; for(const pt of item.normalized) { if(!dm.has(pt.date))dm.set(pt.date,{date:pt.date}); dm.get(pt.date)![item.symbol]=pt.value; } }
    setChartData(Array.from(dm.values()).sort((a,b)=>(a.date as string).localeCompare(b.date as string)));
  };

  function CTip2({ active, payload, label }: Record<string,unknown>) {
    if (!active || !Array.isArray(payload) || !payload.length) return null;
    return <div className="bg-void-900 border border-void-600 rounded p-2 text-[10px] font-mono shadow-panel"><p className="text-cyan-400 mb-1">{String(label)}</p>{(payload as Array<{name:string;value:number;color:string}>).map(p=><p key={p.name} style={{color:p.color}}>{p.name}: {p.value>=0?"+":""}{p.value.toFixed(2)}%</p>)}</div>;
  }

  const ok = data.filter(d=>!d.error);

  return (
    <DashboardLayout active="/dashboard/compare" wallet={wallet}>
      <header className="flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 flex-wrap">
        <span className="text-[10px] font-mono text-cyan-400 tracking-widest font-semibold">COMPARE</span>
        <div className="flex gap-1.5 flex-wrap">
          {symbols.map((s,i)=><div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono" style={{borderColor:COLORS[i]+"60",backgroundColor:COLORS[i]+"12",color:COLORS[i]}}>{s}<button onClick={()=>setSymbols(symbols.filter(x=>x!==s))} className="opacity-50 hover:opacity-100">✕</button></div>)}
        </div>
        {symbols.length<6&&<div className="flex gap-1.5">
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} placeholder="Add..." onKeyDown={e=>{if(e.key==="Enter"&&input.trim()&&!symbols.includes(input.trim())){setSymbols([...symbols,input.trim()]);setInput("");}}} className="bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 text-[10px] font-mono text-cyan-300 placeholder-void-500 w-24 focus:outline-none focus:border-cyan-500/40 uppercase"/>
          <button onClick={()=>{if(input.trim()&&!symbols.includes(input)){setSymbols([...symbols,input]);setInput("");}}} className="px-2 py-1.5 bg-void-800 border border-void-700 rounded-lg text-[9px] font-mono text-void-500 hover:text-slate-400 transition-colors">ADD</button>
        </div>}
        <div className="flex gap-1">{(["1mo","3mo","6mo","1y","2y"] as Period[]).map(p=><button key={p} onClick={()=>setPeriod(p)} className={`px-2 py-1 text-[9px] font-mono rounded transition-colors ${period===p?"bg-void-700 text-cyan-400":"text-void-500 hover:text-slate-400"}`}>{p.toUpperCase()}</button>)}</div>
        <button onClick={compare} disabled={symbols.length<2||loading} className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 disabled:opacity-40 transition-colors">{loading?"LOADING...":"COMPARE"}</button>
      </header>
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0">
        {loading&&<div className="flex-1 flex items-center justify-center"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" style={{animationDelay:`${i*0.16}s`}}/>)}</div></div>}
        {!loading&&chartData.length>0&&<>
          <div className="flex-1 min-h-0">
            <p className="text-[9px] font-mono text-void-500 uppercase tracking-widest mb-2">Normalized Return (% from period start)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0d1120" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fontFamily:"JetBrains Mono",fill:"#1a2238"}} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} interval={Math.floor(chartData.length/7)}/>
                <YAxis tick={{fontSize:9,fontFamily:"JetBrains Mono",fill:"#1a2238"}} tickLine={false} axisLine={false} width={44} tickFormatter={v=>`${v>=0?"+":""}${v.toFixed(0)}%`}/>
                <Tooltip content={<CTip2/>}/>
                <Legend wrapperStyle={{fontSize:10,fontFamily:"JetBrains Mono"}}/>
                {ok.map((d,i)=><Line key={d.symbol} dataKey={d.symbol} stroke={COLORS[i]} strokeWidth={1.5} dot={false} connectNulls/>)}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {ok.length>0&&<div className="shrink-0">
            <table className="w-full text-xs font-mono"><thead><tr className="border-b border-void-700">{["SYMBOL","NAME","CURRENT","PERIOD RETURN","DAY %"].map(h=><th key={h} className="text-left px-4 py-2 text-[9px] text-void-500 tracking-widest">{h}</th>)}</tr></thead>
              <tbody>{ok.map((d,i)=>{const ret=d.normalized.at(-1)?.value??0,day=(d.quote?.regularMarketChangePercent??0)*100;return(
                <tr key={d.symbol} className="border-b border-void-800 hover:bg-void-800/30 transition-colors">
                  <td className="px-4 py-2" style={{color:COLORS[i]}}><span className="font-semibold">{d.symbol}</span></td>
                  <td className="px-4 py-2 text-slate-400 text-[10px] max-w-[160px] truncate">{d.quote?.shortName}</td>
                  <td className="px-4 py-2 text-slate-200">${d.quote?.regularMarketPrice?.toFixed(2)}</td>
                  <td className={`px-4 py-2 font-semibold ${ret>=0?"text-bull":"text-bear"}`}>{ret>=0?"+":""}{ret.toFixed(2)}%</td>
                  <td className={`px-4 py-2 ${day>=0?"text-bull":"text-bear"}`}>{day>=0?"+":""}{day.toFixed(2)}%</td>
                </tr>);})}</tbody>
            </table>
          </div>}
        </>}
        {!loading&&chartData.length===0&&<div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-void-600 font-display text-2xl italic">Multi-Symbol Comparison</p>
          <p className="text-[10px] font-mono text-void-600">Add symbols above and click COMPARE</p>
          <div className="flex gap-2 mt-2">{[["AAPL","NVDA","MSFT"],["BTC-USD","ETH-USD","SOL-USD"],["SPY","QQQ","IWM"]].map(g=><button key={g.join()} onClick={()=>setSymbols(g)} className="px-3 py-1.5 bg-void-800 border border-void-700 rounded text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors">{g.join(" vs ")}</button>)}</div>
        </div>}
      </div>
    </DashboardLayout>
  );
}
