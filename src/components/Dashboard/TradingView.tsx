import { useState, useEffect, useRef, useCallback } from "react";
import { ComposedChart, LineChart, BarChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DashboardLayout from "./Layout.js";

type ChartTab = "price"|"rsi"|"macd"|"volume";
type Period = "1d"|"5d"|"1mo"|"3mo"|"6mo"|"1y"|"2y";
type Interval = "1h"|"4h"|"1d"|"1wk";

const PERIODS: Period[] = ["1d","5d","1mo","3mo","6mo","1y","2y"];
const INTERVALS: {val:Interval;label:string}[] = [{val:"1h",label:"1H"},{val:"4h",label:"4H"},{val:"1d",label:"D"},{val:"1wk",label:"W"}];
const POPULAR = ["AAPL","NVDA","TSLA","MSFT","GOOGL","AMZN","BTC-USD","ETH-USD","SPY"];
const TICK = { fontSize:9, fontFamily:"JetBrains Mono", fill:"#1a2238" };
const GRID = { strokeDasharray:"3 3", stroke:"#0d1120", vertical:false };

const f2 = (n?:number|null, d=2) => n!=null ? n.toFixed(d) : "—";
const fB = (n?:number|null) => !n?"—":n>=1e12?`$${(n/1e12).toFixed(1)}T`:n>=1e9?`$${(n/1e9).toFixed(1)}B`:`$${(n/1e6).toFixed(0)}M`;
const fV = (n?:number|null) => !n?"—":n>=1e9?`${(n/1e9).toFixed(1)}B`:n>=1e6?`${(n/1e6).toFixed(1)}M`:`${(n/1e3).toFixed(0)}K`;

function CTip({ active, payload, label }: Record<string,unknown>) {
  if (!active || !Array.isArray(payload) || !payload.length) return null;
  return (
    <div className="bg-void-900 border border-void-600 rounded-lg p-2 shadow-panel text-[10px] font-mono">
      <p className="text-cyan-400 mb-1">{String(label)}</p>
      {(payload as Array<{name:string;value:number;color:string}>).map(p => <p key={p.name} style={{color:p.color}}>{p.name}: {typeof p.value==="number"?p.value.toFixed(3):p.value}</p>)}
    </div>
  );
}

interface Msg { id:string; role:"user"|"assistant"; content:string }

export default function TradingView({ wallet }:{ wallet:string }) {
  const [sym, setSym] = useState("AAPL");
  const [inputSym, setInputSym] = useState("AAPL");
  const [period, setPeriod] = useState<Period>("6mo");
  const [interval, setInterval] = useState<Interval>("1d");
  const [chartTab, setChartTab] = useState<ChartTab>("price");
  const [showBB, setShowBB] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [chartData, setChartData] = useState<Record<string,unknown>[]>([]);
  const [quote, setQuote] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController|null>(null);
  const chatBottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async (s:string, p:Period, iv:Interval) => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/stock?symbol=${s}&period=${p}&interval=${iv}`);
      const d = await r.json() as Record<string,unknown>;
      if (!r.ok) throw new Error(d.error as string);
      setChartData(d.chartData as Record<string,unknown>[]);
      setQuote(d.quote as Record<string,unknown>);
    } catch(e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(sym, period, interval); }, [sym, period, interval, load]);
  useEffect(() => { chatBottom.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, streaming]);

  const sendChat = useCallback(async (text:string) => {
    if (!text.trim() || streaming) return;
    const um:Msg = { id:crypto.randomUUID(), role:"user", content:text };
    setMsgs(p => [...p, um]); setChatInput(""); setStreaming(true);
    const aid = crypto.randomUUID();
    setMsgs(p => [...p, { id:aid, role:"assistant", content:"" }]);
    try {
      abortRef.current = new AbortController();
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[...msgs,um].map(({role,content})=>({role,content})), symbol:sym, chartData:chartData.slice(-90), quote }),
        signal: abortRef.current.signal });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader(), dec = new TextDecoder();
      let acc = "";
      while(true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of dec.decode(value,{stream:true}).split("\n").filter(Boolean)) {
          try { const j = JSON.parse(line); if (j.message?.content) { acc += j.message.content; setMsgs(p => p.map(m => m.id===aid?{...m,content:acc}:m)); } } catch {}
        }
      }
    } catch(e) { if ((e as Error).name!=="AbortError") setMsgs(p => p.map(m => m.id===aid?{...m,content:"⚠️ Ollama not running. Start with: `ollama run qwen2.5`"}:m)); }
    finally { setStreaming(false); }
  }, [msgs, streaming, sym, chartData, quote]);

  const q = quote, latest = chartData.at(-1) as Record<string,unknown>|undefined;
  const isPos = ((q?.regularMarketChangePercent as number)??0) >= 0;
  const priceRange = chartData.length > 0 ? { min:Math.min(...chartData.map(d=>(d as Record<string,number>).low))*0.995, max:Math.max(...chartData.map(d=>(d as Record<string,number>).high))*1.005 } : null;

  return (
    <DashboardLayout active="/dashboard" wallet={wallet}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-2.5 border-b border-void-700 bg-void-850 shrink-0 overflow-x-auto">
        <form onSubmit={e=>{e.preventDefault();const s=inputSym.trim().toUpperCase();if(s)setSym(s);}} className="flex gap-2 shrink-0">
          <input value={inputSym} onChange={e=>setInputSym(e.target.value.toUpperCase())} placeholder="Symbol"
            className="bg-void-800 border border-void-600 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 placeholder-void-500 w-24 focus:outline-none focus:border-cyan-500/40 uppercase" />
          <button type="submit" className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 transition-colors">GO</button>
        </form>
        <div className="flex gap-1 overflow-x-auto">
          {POPULAR.map(s => <button key={s} onClick={()=>{setSym(s);setInputSym(s);}}
            className={`px-2 py-1 text-[10px] font-mono rounded whitespace-nowrap transition-colors ${sym===s?"bg-cyan-500/15 text-cyan-400 border border-cyan-500/25":"text-void-500 hover:text-slate-400"}`}>{s}</button>)}
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {sym && <>
            <a href={`/api/export?symbol=${sym}&period=${period}&format=csv`} className="px-2 py-1 text-[9px] font-mono text-void-500 hover:text-cyan-400 border border-void-700 rounded transition-colors">CSV</a>
            <a href={`/api/export?symbol=${sym}&period=${period}&format=xlsx`} className="px-2 py-1 text-[9px] font-mono text-void-500 hover:text-cyan-400 border border-void-700 rounded transition-colors">XLSX</a>
          </>}
          <div className="flex gap-1">{INTERVALS.map(iv=><button key={iv.val} onClick={()=>setInterval(iv.val)} className={`px-2 py-1 text-[9px] font-mono rounded ${interval===iv.val?"bg-void-700 text-cyan-400":"text-void-500 hover:text-slate-400"}`}>{iv.label}</button>)}</div>
          <div className="flex gap-1">{PERIODS.map(p=><button key={p} onClick={()=>setPeriod(p)} className={`px-2 py-1 text-[9px] font-mono rounded ${period===p?"bg-void-700 text-cyan-400":"text-void-500 hover:text-slate-400"}`}>{p.toUpperCase()}</button>)}</div>
        </div>
      </header>

      {/* Quote strip */}
      {q && <div className="flex items-center gap-3 px-5 py-2 border-b border-void-700 bg-void-900/50 shrink-0 overflow-x-auto">
        <div className="shrink-0">
          <span className="text-white font-display text-xl italic">{sym}</span>
          <span className="text-void-500 font-mono text-[10px] ml-2">{q.shortName as string}</span>
        </div>
        <div className="shrink-0">
          <span className={`text-2xl font-mono font-semibold ${isPos?"text-bull":"text-bear"}`}>${f2(q.regularMarketPrice as number)}</span>
          <span className={`ml-2 text-xs font-mono ${isPos?"text-bull":"text-bear"}`}>{isPos?"+":""}{f2(q.regularMarketChange as number)} ({isPos?"+":""}{((q.regularMarketChangePercent as number)*100).toFixed(2)}%)</span>
        </div>
        <div className="h-5 w-px bg-void-700 shrink-0" />
        <div className="flex gap-2 overflow-x-auto">
          {[["Mkt Cap",fB(q.marketCap as number),""],["P/E",f2(q.trailingPE as number),""],["Beta",f2(q.beta as number),""],["Vol",fV(q.regularMarketVolume as number),""],
            ["52W H",`$${f2(q.fiftyTwoWeekHigh as number)}`,"text-bull"],["52W L",`$${f2(q.fiftyTwoWeekLow as number)}`,"text-bear"],
            ["RSI",f2(latest?.rsi as number),(latest?.rsi as number)>70?"text-bear":(latest?.rsi as number)<30?"text-bull":"text-cyan-400"],
          ].map(([l,v,c])=>(
            <div key={l} className="bg-void-800 border border-void-700 rounded-lg px-3 py-1.5 shrink-0">
              <p className="text-[9px] font-mono text-void-500 uppercase tracking-widest">{l}</p>
              <p className={`text-xs font-mono font-medium ${c||"text-slate-200"}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>}

      {/* Chart + Chat */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chart panel */}
        <div className="flex-1 flex flex-col p-3 gap-2 min-w-0 overflow-hidden">
          {loading && <div className="flex-1 flex items-center justify-center"><div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-dot" style={{animationDelay:`${i*0.16}s`}}/>)}</div></div>}
          {error && !loading && <div className="flex-1 flex items-center justify-center"><div className="bg-bear-dim border border-bear/20 rounded-xl px-6 py-4 text-bear font-mono text-sm">⚠ {error}</div></div>}
          {!loading && !error && chartData.length > 0 && <>
            <div className="flex items-center gap-3 shrink-0">
              {(["price","rsi","macd","volume"] as ChartTab[]).map(t=>(
                <button key={t} onClick={()=>setChartTab(t)} className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded transition-colors ${chartTab===t?"bg-cyan-500/10 text-cyan-400 border border-cyan-500/20":"text-void-500 hover:text-slate-400"}`}>{t}</button>
              ))}
              {chartTab==="price" && <>
                <div className="h-3 w-px bg-void-700"/>
                <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono text-void-500 hover:text-slate-400"><input type="checkbox" checked={showSMA} onChange={e=>setShowSMA(e.target.checked)} className="accent-cyan-500 w-3 h-3"/>SMA</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono text-void-500 hover:text-slate-400"><input type="checkbox" checked={showBB} onChange={e=>setShowBB(e.target.checked)} className="accent-cyan-500 w-3 h-3"/>BB</label>
              </>}
              <span className="ml-auto text-[9px] font-mono text-void-600">{chartData.length} bars · {chartData.at(0)?.date as string} → {chartData.at(-1)?.date as string}</span>
            </div>
            <div className="flex-1 min-h-0">
              {chartTab==="price" && priceRange && <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                  <CartesianGrid {...GRID}/><XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} interval={Math.floor(chartData.length/7)}/>
                  <YAxis domain={[priceRange.min,priceRange.max]} tick={TICK} tickLine={false} axisLine={false} width={58} tickFormatter={v=>`$${v.toFixed(0)}`}/>
                  <Tooltip content={<CTip/>}/>
                  {showBB && <><Area dataKey="bbUpper" stroke="#06b6d415" strokeWidth={1} fill="#06b6d406" dot={false} connectNulls name="BB↑"/><Line dataKey="bbLower" stroke="#06b6d415" strokeWidth={1} dot={false} connectNulls name="BB↓"/><Line dataKey="bbMid" stroke="#06b6d425" strokeWidth={0.5} strokeDasharray="4 3" dot={false} connectNulls name="BB Mid"/></>}
                  {showSMA && <><Line dataKey="sma20" stroke="#06b6d4" strokeWidth={1} dot={false} connectNulls name="SMA20"/><Line dataKey="sma50" stroke="#a3e635" strokeWidth={1} dot={false} connectNulls name="SMA50"/></>}
                  <Line dataKey="close" stroke={isPos?"#22c55e":"#f43f5e"} strokeWidth={1.5} dot={false} name="Close"/>
                </ComposedChart>
              </ResponsiveContainer>}
              {chartTab==="rsi" && <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                  <CartesianGrid {...GRID}/><XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} interval={Math.floor(chartData.length/7)}/>
                  <YAxis domain={[0,100]} tick={TICK} tickLine={false} axisLine={false} width={28}/>
                  <Tooltip content={<CTip/>}/>
                  <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 2" strokeWidth={0.8}/>
                  <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 2" strokeWidth={0.8}/>
                  <Line dataKey="rsi" stroke="#06b6d4" strokeWidth={1.5} dot={false} connectNulls name="RSI(14)"/>
                </LineChart>
              </ResponsiveContainer>}
              {chartTab==="macd" && <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                  <CartesianGrid {...GRID}/><XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} interval={Math.floor(chartData.length/7)}/>
                  <YAxis tick={TICK} tickLine={false} axisLine={false} width={44}/>
                  <Tooltip content={<CTip/>}/>
                  <ReferenceLine y={0} stroke="#232f4b" strokeWidth={1}/>
                  <Bar dataKey="macdHist" name="Histogram" fill="#06b6d440" stroke="#06b6d460"/>
                  <Line dataKey="macd" stroke="#22c55e" strokeWidth={1.5} dot={false} connectNulls name="MACD"/>
                  <Line dataKey="macdSignal" stroke="#f43f5e" strokeWidth={1.5} dot={false} connectNulls name="Signal"/>
                </ComposedChart>
              </ResponsiveContainer>}
              {chartTab==="volume" && <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                  <CartesianGrid {...GRID}/><XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} tickFormatter={v=>v.slice(5)} interval={Math.floor(chartData.length/7)}/>
                  <YAxis tick={TICK} tickLine={false} axisLine={false} width={50} tickFormatter={v=>v>=1e6?`${(v/1e6).toFixed(0)}M`:`${(v/1e3).toFixed(0)}K`}/>
                  <Tooltip content={<CTip/>}/>
                  <Bar dataKey="volume" name="Volume" fill="#06b6d420" stroke="#06b6d440"/>
                </BarChart>
              </ResponsiveContainer>}
            </div>
          </>}
        </div>

        {/* AI Chat */}
        <div className="w-72 xl:w-80 border-l border-void-700 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-void-700 shrink-0">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/><span className="text-[10px] font-mono font-semibold text-cyan-400 tracking-widest">NEXAI</span></div>
            {msgs.length>0 && <button onClick={()=>setMsgs([])} className="text-[9px] font-mono text-void-500 hover:text-bear transition-colors">CLEAR</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {msgs.length===0 && <div className="space-y-2">
              <p className="text-[10px] font-mono text-void-500">Ask QwenAI about <span className="text-cyan-400">{sym}</span> — with live market context.</p>
              {["Analyze current trend","RSI & MACD signals?","Support & resistance?","Best entry strategy?"].map(q=>(
                <button key={q} onClick={()=>sendChat(q)} className="w-full text-left text-[10px] font-mono px-3 py-1.5 bg-void-800 border border-void-700 rounded hover:border-cyan-500/30 text-slate-500 hover:text-cyan-300 transition-all">› {q}</button>
              ))}
            </div>}
            {msgs.map(m=>(
              <div key={m.id} className={`flex gap-2 animate-fade-in ${m.role==="user"?"flex-row-reverse":""}`}>
                <div className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[8px] font-mono font-bold ${m.role==="user"?"bg-cyan-500 text-void-900":"bg-void-700 text-cyan-400 border border-void-600"}`}>{m.role==="user"?"U":"AI"}</div>
                <div className={`max-w-[88%] rounded-lg px-2.5 py-2 text-[11px] font-mono leading-relaxed whitespace-pre-wrap ${m.role==="user"?"bg-cyan-500/10 border border-cyan-500/20 text-cyan-100":"bg-void-800 border border-void-700 text-slate-300"}`}>
                  {m.content || (streaming && m.role==="assistant" && <span className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse-dot" style={{animationDelay:`${i*0.16}s`}}/>)}</span>)}
                </div>
              </div>
            ))}
            <div ref={chatBottom}/>
          </div>
          <div className="p-2.5 border-t border-void-700 shrink-0">
            <div className="flex gap-2">
              <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat(chatInput);}}}
                placeholder="Ask QwenAI..." rows={2} disabled={streaming}
                className="flex-1 bg-void-800 border border-void-700 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-200 placeholder-void-500 resize-none focus:outline-none focus:border-cyan-500/30 transition-colors disabled:opacity-50"/>
              {streaming
                ? <button onClick={()=>{abortRef.current?.abort();setStreaming(false);}} className="px-2 self-end py-2 bg-bear-dim border border-bear/30 rounded-lg text-bear text-[10px] hover:bg-bear/20 transition-colors">■</button>
                : <button onClick={()=>sendChat(chatInput)} disabled={!chatInput.trim()} className="px-2 self-end py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-[10px] hover:bg-cyan-500/20 transition-colors disabled:opacity-30">▶</button>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
