import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Activity, Users, Clock, CalendarDays, Dumbbell, LogIn, LogOut, Plus, Trash2, Menu, X, TrendingUp, Target, UserRound, BarChart3, CheckCircle2, Timer, QrCode, Camera, Copy, Settings, ChevronRight } from 'lucide-react';

type Workout = { id:string; date:string; time:string; exercise:string; sets:number; reps:number; weight:number; notes:string };
type Visit = { id:string; name:string; action:'in'|'out'; at:string };
const today = () => new Date().toLocaleDateString('en-CA');
const timeNow = () => new Date().toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit',hour12:false});
function read<T,>(key:string, fallback:T):T { try { const raw=localStorage.getItem(key); return raw?JSON.parse(raw) as T:fallback; } catch { return fallback; } }
const initialGuests = () => Array.from({length:90},(_,i)=>'demo-client-'+(i+1));
const hours = [{h:'06–08',v:12},{h:'08–10',v:24},{h:'10–12',v:18},{h:'12–14',v:9},{h:'14–16',v:17},{h:'16–18',v:31},{h:'18–20',v:45},{h:'20–22',v:26}];
const days = [{d:'Hën',v:31},{d:'Mar',v:37},{d:'Mër',v:29},{d:'Enj',v:42},{d:'Pre',v:35},{d:'Sht',v:24},{d:'Die',v:14}];

export default function App() {
 const [memberId] = useState(()=>localStorage.getItem('fb-member-id')||('FB-'+Math.random().toString(36).slice(2,9).toUpperCase()));
 const [name,setName] = useState(()=>localStorage.getItem('fb-member-name')||'');
 const [nameDraft,setNameDraft] = useState(name);
 const [tab,setTab] = useState('dashboard');
 const [inside,setInside] = useState<string[]>(()=>read('fb-inside',initialGuests()));
 const [capacity,setCapacity] = useState<number>(()=>read('fb-capacity',200));
 const [visits,setVisits] = useState<Visit[]>(()=>read('fb-visits',[]));
 const [workouts,setWorkouts] = useState<Workout[]>(()=>read('fb-workouts',[]));
 const [scanOpen,setScanOpen] = useState(false);
 const [scanMessage,setScanMessage] = useState('');
 const [menu,setMenu] = useState(false);
 const [admin,setAdmin] = useState(false);
 const [demoCount,setDemoCount] = useState('90');
 const [showForm,setShowForm] = useState(false);
 const [exercise,setExercise] = useState('Bench press');
 const [date,setDate] = useState(today());
 const [time,setTime] = useState(timeNow());
 const [sets,setSets] = useState('3');
 const [reps,setReps] = useState('10');
 const [weight,setWeight] = useState('40');
 const [notes,setNotes] = useState('');
 const scanHandler = useRef<(value:string)=>void>(()=>{});
 const myInside = inside.includes(memberId);
 const count = inside.length;
 const percent = Math.min(100,Math.round(count/Math.max(1,capacity)*100));
 const myWorkouts = useMemo(()=>workouts.filter(w=>w.id.startsWith(memberId+'|')).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)),[workouts,memberId]);

 useEffect(()=>localStorage.setItem('fb-member-id',memberId),[memberId]);
 useEffect(()=>localStorage.setItem('fb-inside',JSON.stringify(inside)),[inside]);
 useEffect(()=>localStorage.setItem('fb-capacity',String(capacity)),[capacity]);
 useEffect(()=>localStorage.setItem('fb-visits',JSON.stringify(visits)),[visits]);
 useEffect(()=>localStorage.setItem('fb-workouts',JSON.stringify(workouts)),[workouts]);
 useEffect(()=>{ if(!scanOpen)return; const scanner=new Html5QrcodeScanner('fb-qr-reader',{fps:10,qrbox:{width:230,height:230},aspectRatio:1},false); scanner.render((decoded)=>scanHandler.current(decoded),()=>{}); return ()=>{void scanner.clear().catch(()=>{});}; },[scanOpen]);
 scanHandler.current=(raw)=>{const id=raw.startsWith('FITNESS-BLENDI:')?raw.slice('FITNESS-BLENDI:'.length):''; if(!id){setScanMessage('QR kodi nuk i përket Fitness Blendi.');return;} const entering=!inside.includes(id); setInside(prev=>entering?[...prev,id]:prev.filter(x=>x!==id)); setVisits(prev=>[{id,name:id===memberId?(name||'Unë'):'Klient demo',action: entering ? ('in' as const) : ('out' as const),at:timeNow()},...prev].slice(0,30)); setScanMessage(entering?'Hyrja u regjistrua në demo.':'Dalja u regjistrua në demo.'); };
 const toggleMyVisit=()=>{if(!name){setTab('profile');return;} const entering=!myInside; setInside(prev=>entering?[...prev,memberId]:prev.filter(x=>x!==memberId)); setVisits(prev=>[{id:memberId,name,action: entering ? ('in' as const) : ('out' as const),at:timeNow()},...prev].slice(0,30));};
 const saveName=()=>{const clean=nameDraft.trim();if(clean){setName(clean);localStorage.setItem('fb-member-name',clean);}};
 const addWorkout=(e:React.FormEvent)=>{e.preventDefault();if(!name){setTab('profile');return;}setWorkouts(prev=>[{id:memberId+'|'+Date.now(),date,time,exercise,sets:Number(sets),reps:Number(reps),weight:Number(weight),notes},...prev]);setShowForm(false);setNotes('');setTab('history');};
 const setDemoOccupancy=()=>{const n=Math.max(0,Math.min(capacity,Number(demoCount)||0));setInside(Array.from({length:n},(_,i)=>'demo-client-'+(i+1)));setVisits(prev=>[{id:'demo',name:'Administratori',action:'in',at:timeNow()},...prev].slice(0,30));};
 const qrValue='FITNESS-BLENDI:'+memberId;
 const nav=(key:string)=>{setTab(key);setMenu(false);};
 const maxHour=Math.max(...hours.map(x=>x.v)), maxDay=Math.max(...days.map(x=>x.v));
 return <div className="gymApp">
  <aside className={menu?'sidebar open':'sidebar'}>
   <div className="brand"><div className="brandMark">B<span>.</span></div><div><b>FITNESS BLENDI</b><small>TRAIN WITH PURPOSE</small></div><button className="closeMenu" onClick={()=>setMenu(false)}><X/></button></div>
   <div className="sideLabel">MENYJA KRYESORE</div>
   <button className={tab==='dashboard'?'sideLink active':'sideLink'} onClick={()=>nav('dashboard')}><BarChart3/> Dashboard <ChevronRight/></button>
   <button className={tab==='qr'?'sideLink active':'sideLink'} onClick={()=>nav('qr')}><QrCode/> QR & skanimi <ChevronRight/></button>
   <button className={tab==='history'?'sideLink active':'sideLink'} onClick={()=>nav('history')}><CalendarDays/> Stërvitjet e mia <ChevronRight/></button>
   <button className={tab==='profile'?'sideLink active':'sideLink'} onClick={()=>nav('profile')}><UserRound/> Profili <ChevronRight/></button>
   <div className="sideBottom"><div className="sideTip"><Activity/><b>Qëndro konstant.</b><p>Progresi ndërtohet me çdo seancë.</p></div><div className="sideUser"><div className="avatar">{name?name[0].toUpperCase():'?'}</div><div><b>{name||'Vizitor'}</b><small>{myInside?'Brenda palestrës':'Fitness Blendi'}</small></div></div></div>
  </aside>
  <main className="mainArea">
   <header className="gymHeader"><button className="hamb" onClick={()=>setMenu(true)}><Menu/></button><div className="breadcrumb">FITNESS BLENDI <span>/</span> {tab.toUpperCase()}</div><div className="headerRight"><span className="openStatus"><i/> DEMO AKTIVE</span><div className="avatar smallAvatar">{name?name[0].toUpperCase():'?'}</div></div></header>
   <div className="content">
    {tab==='dashboard'&&<>
     <div className="welcome"><div><span className="overline">FITNESS BLENDI · DASHBOARD</span><h1>Mirë se erdhe{name?', '+name:''}.</h1><p>Shiko sa e mbushur është palestra para se të nisesh.</p></div><button className="primaryBtn" onClick={()=>setShowForm(true)}><Plus/> Regjistro stërvitjen</button></div>
     <section className="liveCard"><div className="liveMain"><div className="liveEyebrow"><span className="liveDot"/> NUMRI I KLIENTËVE <span className="demoTag">DEMO · JO TË DHËNA REALE</span></div><div className="liveNumbers"><strong>{count}</strong><div><b>klientë brenda</b><small>nga {capacity} vende gjithsej</small></div></div><div className="progressTrack"><span style={{width:percent+'%'}}/></div><div className="liveFoot"><span>{percent}% e kapacitetit</span><span>{Math.max(0,capacity-count)} vende të lira</span></div></div><div className="liveAction"><div className="peopleIcon"><Users/></div><h3>{myInside?'Je brenda palestrës':'Po planifikon të shkosh?'}</h3><p>{myInside?'Regjistro daljen kur të përfundosh.':'Shiko QR-në tënde ose simulo hyrjen në palestër.'}</p><button className={myInside?'leaveBtn':'enterBtn'} onClick={toggleMyVisit}>{myInside?<><LogOut/> Regjistro daljen</>:<><LogIn/> Simulo hyrjen</>}</button>{!name&&<small>Plotëso profilin për të përdorur hyrjen personale.</small>}</div></section>
     <div className="sectionHead"><div><span className="overline">ANALIZA E AKTIVITETIT</span><h2>Kur është palestra më e mbushur?</h2></div><span className="periodPill"><CalendarDays/> 7 ditët e fundit · shembull</span></div>
     <div className="analyticsGrid"><section className="panel hourly"><div className="panelTitle"><div><h3>Ngarkesa sipas orarit</h3><p>Numër mesatar demonstrues i klientëve</p></div><Clock/></div><div className="bars">{hours.map(x=><div className="barCol" key={x.h}><b>{x.v}</b><div className="barTrack"><i style={{height:(x.v/maxHour*100)+'%'}}/></div><small>{x.h}</small></div>)}</div><div className="insight"><TrendingUp/><span><b>Më i ngarkuar:</b> 18:00–20:00</span><span className="quiet">Më i qetë: 12:00–14:00</span></div></section>
      <section className="panel weekly"><div className="panelTitle"><div><h3>Aktiviteti gjatë javës</h3><p>Vizita sipas ditëve · shembull</p></div><Activity/></div><div className="dayBars">{days.map(x=><div className="dayCol" key={x.d}><b>{x.v}</b><div className="dayTrack"><i style={{height:(x.v/maxDay*100)+'%'}}/></div><small>{x.d}</small></div>)}</div><div className="weekSummary"><div><span>Stërvitjet e tua</span><b>{myWorkouts.length}</b></div><div><span>Vizita demo të regjistruara</span><b>{visits.length}</b></div></div></section></div>
     <div className="sectionHead lowerHead"><div><span className="overline">PROGRESI PERSONAL</span><h2>Stërvitjet e fundit</h2></div><button className="textBtn" onClick={()=>nav('history')}>Shiko historikun <ChevronRight/></button></div>
     <section className="recentList">{myWorkouts.length?myWorkouts.slice(0,4).map(w=><div className="recentRow" key={w.id}><div className="exerciseIcon"><Dumbbell/></div><div className="recentName"><b>{w.exercise}</b><small>{w.date} · {w.time}</small></div><span>{w.sets} seri × {w.reps}</span><b>{w.weight} kg</b></div>):<div className="emptyState"><Target/><b>Ende nuk ke regjistruar stërvitje.</b><span>Shto ushtrimin e parë për të filluar historikun.</span><button className="textBtn" onClick={()=>setShowForm(true)}>Shto stërvitjen <ChevronRight/></button></div>}</section>
    </>}
    {tab==='qr'&&<><div className="welcome"><div><span className="overline">IDENTIFIKIMI I KLIENTIT</span><h1>QR Code & skanimi.</h1><p>QR demonstrues për profilin tënd dhe kamerë për testimin e hyrjeve/daljeve.</p></div><button className="primaryBtn" onClick={()=>setScanOpen(v=>!v)}><Camera/> {scanOpen?'Mbyll kamerën':'Hap skanerin'}</button></div>
      <div className="qrGrid"><section className="panel myQr"><span className="overline">QR KODI PERSONAL</span><h2>{name||'Klienti i Fitness Blendi'}</h2><p>Ky kod identifikon profilin tënd në demonstrim.</p><div className="qrPaper"><QRCodeSVG value={qrValue} size={220} level="H" includeMargin/></div><div className="memberCode">{memberId}</div><button className="secondaryBtn" onClick={()=>{void navigator.clipboard?.writeText(qrValue);setScanMessage('Kodi u kopjua.')}}><Copy/> Kopjo kodin</button></section>
      <section className="panel scannerPanel"><div className="panelTitle"><div><h3>Skaneri i QR-së</h3><p>Lejo qasjen në kamerë për testim.</p></div><Camera/></div>{scanOpen?<div id="fb-qr-reader"/>:<div className="scannerPlaceholder"><QrCode/><b>Skaneri është i mbyllur</b><span>Hape kamerën dhe skano QR-në e një profili demo.</span><button className="primaryBtn" onClick={()=>setScanOpen(true)}><Camera/> Aktivizo kamerën</button></div>}{scanMessage&&<div className="scanMessage">{scanMessage}</div>}<div className="scanInfo"><b>Si funksionon demo?</b><p>Kur skanohet QR-ja, sistemi e ndërron gjendjen e atij profili: jashtë → brenda ose brenda → jashtë. Kamera kërkon HTTPS dhe leje për qasje.</p></div></section></div>
      <section className="panel recentScans"><div className="panelTitle"><div><h3>Aktiviteti i fundit</h3><p>Veprimet e regjistruara në këtë pajisje</p></div><Timer/></div>{visits.length?visits.slice(0,8).map((v,i)=><div className="historyRow" key={v.id+'-'+i}><div className="exerciseIcon">{v.action==='in'?<LogIn/>:<LogOut/>}</div><div className="historyName"><b>{v.name}</b><small>{v.at}</small></div><span className={v.action==='in'?'statusInside':'statusOutside'}>{v.action==='in'?'Hyrje':'Dalje'}</span></div>):<div className="emptyState"><QrCode/><b>Nuk ka skanime ende.</b></div>}</section>
     </>}
    {tab==='history'&&<><div className="welcome"><div><span className="overline">ARKIVA JOTE</span><h1>Historiku i stërvitjeve.</h1><p>Regjistro ushtrimet me datë, orë dhe ngarkesë.</p></div><button className="primaryBtn" onClick={()=>setShowForm(true)}><Plus/> Shto stërvitje</button></div><div className="historyStats"><div><Dumbbell/><span>Stërvitje totale</span><b>{myWorkouts.length}</b></div><div><Activity/><span>Pesha më e lartë</span><b>{myWorkouts.length?Math.max(...myWorkouts.map(w=>w.weight))+' kg':'—'}</b></div><div><CalendarDays/><span>Ditë aktive</span><b>{new Set(myWorkouts.map(w=>w.date)).size}</b></div></div><section className="panel historyPanel"><div className="panelTitle"><div><h3>Regjistrimet e tua</h3><p>Renditur nga data më e re</p></div><CalendarDays/></div>{myWorkouts.length?myWorkouts.map(w=><div className="historyRow" key={w.id}><div className="exerciseIcon"><Dumbbell/></div><div className="historyName"><b>{w.exercise}</b><small>{w.date} · {w.time}</small>{w.notes&&<p>{w.notes}</p>}</div><div className="workoutMetrics"><b>{w.sets} × {w.reps}</b><small>seri × përsëritje</small></div><div className="workoutWeight"><b>{w.weight} kg</b><small>pesha</small></div><button className="iconDelete" onClick={()=>setWorkouts(prev=>prev.filter(x=>x.id!==w.id))} aria-label="Fshij"><Trash2/></button></div>):<div className="emptyState"><Dumbbell/><b>Nuk ka ende regjistrime.</b><span>Shto ushtrimin e parë.</span></div>}</section></>}
    {tab==='profile'&&<><div className="welcome"><div><span className="overline">LLOGARIA JOTE</span><h1>Profili i klientit.</h1><p>Emri dhe identifikimi yt për demonstrimin.</p></div></div><section className="panel profilePanel"><div className="profileAvatar">{name?name[0].toUpperCase():'?'}</div><div className="profileForm"><label>Emri dhe mbiemri</label><div className="profileInput"><input value={nameDraft} onChange={e=>setNameDraft(e.target.value)} placeholder="Shkruaj emrin tënd"/><button className="primaryBtn" onClick={saveName}>Ruaj profilin</button></div><p>ID e klientit: {memberId}. Të dhënat ruhen vetëm në këtë shfletues.</p><div className="profileStatus"><span>Gjendja demonstrative</span><b className={myInside?'statusInside':'statusOutside'}>{myInside?'Brenda palestrës':'Jashtë palestrës'}</b></div><button className="secondaryBtn" onClick={toggleMyVisit}>{myInside?'Regjistro daljen':'Simulo hyrjen'}</button></div></section>
      <section className="panel adminPanel"><div className="panelTitle"><div><h3><Settings/> Paneli i demonstrimit</h3><p>Ndrysho kapacitetin dhe numrin e klientëve për testim.</p></div><button className="textBtn" onClick={()=>setAdmin(v=>!v)}>{admin?'Mbyll':'Hap panelin'}</button></div>{admin&&<div className="adminControls"><label>Kapaciteti maksimal<input type="number" min="1" max="1000" value={capacity} onChange={e=>setCapacity(Math.max(1,Number(e.target.value)||1))}/></label><label>Klientë aktualisht brenda<input type="number" min="0" max={capacity} value={demoCount} onChange={e=>setDemoCount(e.target.value)}/></label><button className="primaryBtn" onClick={setDemoOccupancy}>Përditëso numrin demo</button></div>}</section></>}
    <footer className="gymFooter"><span>© 2026 FITNESS BLENDI</span><span>DISCIPLINË · FORCË · PROGRES</span><span>VERSION DEMONSTRUES</span></footer>
   </div>
  </main>
  {showForm&&<div className="modalBackdrop" onClick={()=>setShowForm(false)}><form className="workoutModal" onClick={e=>e.stopPropagation()} onSubmit={addWorkout}><div className="modalHead"><div><span className="overline">REGJISTRO AKTIVITETIN</span><h2>Stërvitja jote</h2></div><button type="button" onClick={()=>setShowForm(false)}><X/></button></div>{!name&&<div className="formWarning">Së pari vendos emrin te Profili.</div>}<label>Ushtrimi<select value={exercise} onChange={e=>setExercise(e.target.value)}>{['Bench press','Squat','Deadlift','Shoulder press','Lat pulldown','Pull-ups','Biceps curl','Triceps pushdown','Leg press','Running / Cardio','Plank','Tjetër'].map(x=><option key={x}>{x}</option>)}</select></label><div className="formTwo"><label>Data<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Ora<input type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label></div><div className="formThree"><label>Seri<input type="number" min="1" value={sets} onChange={e=>setSets(e.target.value)} required/></label><label>Përsëritje<input type="number" min="1" value={reps} onChange={e=>setReps(e.target.value)} required/></label><label>Pesha kg<input type="number" min="0" step=".5" value={weight} onChange={e=>setWeight(e.target.value)} required/></label></div><label>Shënime<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Shënime (opsionale)"/></label><button className="primaryBtn fullBtn" type="submit" disabled={!name}><CheckCircle2/> Ruaj stërvitjen</button></form></div>}
 </div>;
}
