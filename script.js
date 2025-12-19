/* =======================
   SUNJET FULL WEBSITE JS
   (CodePen + iPad safe)
   ======================= */

const $ = (id) => document.getElementById(id);
const exists = (id) => !!$(id);

function show(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const el = $(pageId);
  if (el) el.classList.remove("hidden");
}

function setText(id, txt) { const el = $(id); if (el) el.textContent = txt; }
function setHTML(id, html) { const el = $(id); if (el) el.innerHTML = html; }

const airports = {
  MIA:{name:"Miami", x:250, y:190},
  JFK:{name:"New York (JFK)", x:360, y:120},
  BOS:{name:"Boston", x:380, y:105},
  ORD:{name:"Chicago", x:290, y:130},
  SJU:{name:"San Juan", x:420, y:260},
  SDQ:{name:"Santo Domingo", x:390, y:250},
  PUJ:{name:"Punta Cana", x:404, y:258},
  AUA:{name:"Aruba", x:370, y:300},
  PTY:{name:"Panama City", x:315, y:330},
  SJO:{name:"San José", x:280, y:355},
  BOG:{name:"Bogotá", x:330, y:380},
  MDE:{name:"Medellín", x:320, y:370},
  LIM:{name:"Lima", x:315, y:455}
};

const routesFromMIA = ["SJU","SDQ","PUJ","AUA","PTY","SJO","BOG","MDE","LIM","JFK","BOS","ORD"];

const deals = [
  {from:"MIA", to:"SJU", price:39, promo:"SUNNY", label:"Caribbean quick escape"},
  {from:"MIA", to:"SDQ", price:49, promo:"ISLAND", label:"Weekend island vibes"},
  {from:"MIA", to:"BOG", price:69, promo:"LATAM", label:"Big city, low fare"},
  {from:"MIA", to:"PTY", price:59, promo:"CANAL", label:"Gateway to Central America"}
];

const destinations = [
  {code:"SJU", region:"Caribbean"},
  {code:"SDQ", region:"Caribbean"},
  {code:"PUJ", region:"Caribbean"},
  {code:"AUA", region:"Caribbean"},
  {code:"PTY", region:"Central America"},
  {code:"SJO", region:"Central America"},
  {code:"BOG", region:"South America"},
  {code:"MDE", region:"South America"},
  {code:"LIM", region:"South America"},
  {code:"JFK", region:"North-to-Florida"},
  {code:"BOS", region:"North-to-Florida"},
  {code:"ORD", region:"North-to-Florida"}
];

const fleet = [
  {type:"A320ceo", use:"High-frequency routes", seats:"~180", note:"Proven workhorse"},
  {type:"A320neo", use:"Better fuel burn", seats:"~180", note:"Quiet + efficient"},
  {type:"A321ceo", use:"More seats on peaks", seats:"~220", note:"Perfect for MIA hub"},
  {type:"A321neo", use:"Longest + most efficient", seats:"~220", note:"Best economics"}
];

const state = {
  tripType: "round",
  search: null,
  booking: null
};

function money(n){ return "$" + Number(n).toFixed(0); }

function fmtDate(s){
  if(!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString(undefined, {weekday:"short", month:"short", day:"numeric"});
}

function randInt(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }

function genFlights(to){
  const baseDur = ({
    SJU:160, SDQ:140, PUJ:150, AUA:170, PTY:185, SJO:170, BOG:210, MDE:195, LIM:300,
    JFK:190, BOS:205, ORD:190
  }[to] || 160);

  const times = [
    {dep:"07:10", arr:"09:50"},
    {dep:"11:45", arr:"14:25"},
    {dep:"16:10", arr:"18:55"},
    {dep:"20:15", arr:"23:05"}
  ];

  const basePrice = (to==="SJU"?39 : to==="SDQ"?49 : to==="BOG"?69 : 59);
  const equipPool = ["A320","A320neo","A321","A321neo"];

  return times.map((t,i)=>{
    const fn = "SJ " + String(200 + randInt(0,79));
    const stops = (Math.random()<0.14) ? "1 stop" : "Nonstop";
    const equip = equipPool[randInt(0,equipPool.length-1)];
    const dur = baseDur + i*8 + randInt(-5,12);
    const price = basePrice + i*10 + randInt(0,6);
    return {...t, fn, stops, equip, dur, price};
  });
}

/* ---------- BOOKING FLOW ---------- */

function doSearch(){
  const from = (($("from")?.value || "MIA").trim().toUpperCase());
  const to   = ($("to")?.value || "SJU");
  const depart = $("depart")?.value || "";
  const ret    = $("ret")?.value || "";
  const pax    = $("pax")?.value || "1 Adult";
  const promo  = $("promo")?.value || "";

  state.search = {from,to,depart,ret,pax,promo, flights: genFlights(to)};
  state.booking = null;

  renderResults();
  renderMapSvg();
  renderMapInfo();
  show("results");
}

function renderResults(){
  const s = state.search;
  if(!s || !exists("summary") || !exists("flightList")) return;

  const fromName = airports[s.from]?.name || s.from;
  const toName   = airports[s.to]?.name || s.to;

  setHTML("summary",
    `<b>${s.from}</b> (${fromName}) → <b>${s.to}</b> (${toName}) • Depart ${fmtDate(s.depart)}` +
    (state.tripType==="round" && s.ret ? ` • Return ${fmtDate(s.ret)}` : ``) +
    ` • ${s.pax}` + (s.promo ? ` • Promo: <b>${s.promo}</b>` : ``)
  );

  const host = $("flightList");
  host.innerHTML = "";

  s.flights.forEach((f, idx)=>{
    const basic = f.price;
    const plus  = f.price + 38;
    const maxx  = f.price + 78;

    const row = document.createElement("div");
    row.className = "flightRow";
    row.innerHTML = `
      <div>
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
          <div style="font-weight:1100">${f.fn} <span class="muted" style="font-weight:950">• ${f.equip}</span></div>
          <span class="badge" style="background:rgba(255,106,0,.10)"><span class="dot2"></span>${f.stops}</span>
        </div>
        <div class="kv">
          <span><b>${f.dep}</b> depart</span>
          <span><b>${f.arr}</b> arrive</span>
          <span>Duration <b>${Math.floor(f.dur/60)}h ${String(f.dur%60).padStart(2,"0")}m</b></span>
        </div>
      </div>

      <div class="cols">
        <div class="fareCol">
          <h3>BASIC</h3><div class="sub">Base fare</div>
          <div style="font-size:22px;font-weight:1100">${basic} <span class="muted">USD</span></div>
          <ul><li>Personal item</li><li>Seat fee applies</li></ul>
          <button class="btn ghost cta" data-pick="${idx}|BASIC|${basic}">Select BASIC</button>
        </div>

        <div class="fareCol">
          <h3>PLUS</h3><div class="sub">Most popular</div>
          <div style="font-size:22px;font-weight:1100">${plus} <span class="muted">USD</span></div>
          <ul><li>Carry-on included</li><li>Standard seats included</li></ul>
          <button class="btn sun cta" data-pick="${idx}|PLUS|${plus}">Select PLUS</button>
        </div>

        <div class="fareCol">
          <h3>MAX</h3><div class="sub">Most flexible</div>
          <div style="font-size:22px;font-weight:1100">${maxx} <span class="muted">USD</span></div>
          <ul><li>Carry-on + 1 checked</li><li>Any seat included</li></ul>
          <button class="btn ghost cta" data-pick="${idx}|MAX|${maxx}">Select MAX</button>
        </div>
      </div>
    `;
    host.appendChild(row);
  });
}

// Event delegation: fare selection always works
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-pick]");
  if(!btn) return;

  const parts = (btn.dataset.pick||"").split("|");
  const idx = Number(parts[0]);
  const bundle = parts[1];
  const total = Number(parts[2]);

  if(!state.search || !state.search.flights || !state.search.flights[idx]) {
    alert("Demo error: search again.");
    return;
  }

  const f = state.search.flights[idx];
  state.booking = {
    bundle,
    bundleTotal: total,
    flight: f,
    seat: null,
    seatType: null,
    seatFee: 0,
    bags: {carryOn:false, checked1:false, fee:0}
  };

  renderSeats();        // <-- this will STOP "Loading..."
  show("seats");
});

function renderSeats(){
  const s = state.search;
  const b = state.booking;

  if(!exists("seatSummary") || !exists("tripBox") || !exists("seatPick") || !exists("seatMap") || !exists("btnToBags")) return;

  const seatSummary = $("seatSummary");
  const tripBox = $("tripBox");
  const seatPick = $("seatPick");
  const seatMap = $("seatMap");
  const btnToBags = $("btnToBags");

  if(!s || !b){
    seatSummary.textContent = "Select a flight first.";
    tripBox.innerHTML = "Go back and choose BASIC / PLUS / MAX.";
    seatPick.textContent = "Selected seat: none";
    seatMap.innerHTML = "";
    btnToBags.disabled = true;
    return;
  }

  seatSummary.textContent = `Seat selection for ${s.from} → ${s.to}. Bundle: ${b.bundle}.`;

  tripBox.innerHTML =
    `<b>${s.from}</b> (${airports[s.from]?.name || s.from}) → <b>${s.to}</b> (${airports[s.to]?.name || s.to})<br>` +
    `Flight <b>${b.flight.fn}</b> • ${fmtDate(s.depart)} • ${b.flight.dep}–${b.flight.arr}<br>` +
    `Bundle total: <b>${money(b.bundleTotal)}</b>`;

  seatPick.textContent = "Selected seat: none";
  btnToBags.disabled = true;

  // Build grid headers
  seatMap.innerHTML = `
    <div class="hdr">Row</div>
    <div class="hdr">A</div><div class="hdr">B</div><div class="hdr">C</div>
    <div class="hdr" style="text-align:center">AISLE</div>
    <div class="hdr">D</div><div class="hdr">E</div><div class="hdr">F</div>
  `;

  const seatType = (row)=> (row<=3) ? "upfront" : (row>=12 && row<=16) ? "stretch" : "standard";

  const seatFee = (type)=>{
    if(b.bundle==="MAX") return 0;
    if(b.bundle==="PLUS" && type==="standard") return 0;
    if(type==="stretch") return 39;
    if(type==="upfront") return 29;
    return 15;
  };

  // deterministic-ish unavailable seats per flight
  const seed = (b.flight.fn || "").split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const pseudo = (i)=>{ const x = Math.sin(seed*999 + i*97)*10000; return x - Math.floor(x); };
  let i = 0;

  function makeSeat(r, letter){
    const seat = `${r}${letter}`;
    const type = seatType(r);
    const btn = document.createElement("button");
    btn.className = `seatBtn ${type}`;
    btn.textContent = seat;

    const unavail = pseudo(i++) < 0.18;
    if(unavail){
      btn.classList.add("unavail");
      btn.disabled = true;
      return btn;
    }

    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".seatBtn").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");

      b.seat = seat;
      b.seatType = type;
      b.seatFee = seatFee(type);

      seatPick.innerHTML =
        `Selected seat: <b>${b.seat}</b> • Type: <b>${type.toUpperCase()}</b> • Fee: <b>${money(b.seatFee)}</b>`;
      btnToBags.disabled = false;
    });

    return btn;
  }

  for(let r=1;r<=30;r++){
    const rl = document.createElement("div");
    rl.className = "hdr";
    rl.textContent = r;
    seatMap.appendChild(rl);

    ["A","B","C"].forEach(L=>seatMap.appendChild(makeSeat(r,L)));

    const aisle = document.createElement("div");
    aisle.className = "hdr";
    aisle.style.textAlign="center";
    aisle.textContent="—";
    seatMap.appendChild(aisle);

    ["D","E","F"].forEach(L=>seatMap.appendChild(makeSeat(r,L)));
  }
}

function renderBags(){
  const s = state.search;
  const b = state.booking;
  if(!s || !b) return;
  if(!exists("bagTripBox") || !exists("carryOn") || !exists("checked1") || !exists("grandTotal")) return;

  setHTML("bagTripBox",
    `<b>${s.from}</b> → <b>${s.to}</b> • Flight <b>${b.flight.fn}</b> • Bundle <b>${b.bundle}</b><br>` +
    `Bundle: <b>${money(b.bundleTotal)}</b> • Seat fee: <b>${money(b.seatFee||0)}</b>`
  );

  const carry = $("carryOn");
  const checked = $("checked1");

  // reset enabled/disabled then apply rules
  carry.disabled = false; checked.disabled = false;

  if(b.bundle==="PLUS"){
    carry.checked = true; carry.disabled = true;
    checked.checked = false; checked.disabled = false;
  } else if(b.bundle==="MAX"){
    carry.checked = true; carry.disabled = true;
    checked.checked = true; checked.disabled = true;
  } else {
    // BASIC
    // keep current toggles
  }

  const recalc = ()=>{
    let fee = 0;
    if(!carry.disabled && carry.checked) fee += 49;
    if(!checked.disabled && checked.checked) fee += 45;
    b.bags = { carryOn: carry.checked, checked1: checked.checked, fee };
    setText("grandTotal", money(b.bundleTotal + (b.seatFee||0) + fee));
  };

  carry.onchange = recalc;
  checked.onchange = recalc;
  recalc();
}

function renderCheckout(){
  const s = state.search;
  const b = state.booking;
  if(!s || !b || !exists("checkoutBox")) return;

  const seatFee = b.seatFee||0;
  const bagFee = b.bags?.fee||0;
  const total = b.bundleTotal + seatFee + bagFee;

  setHTML("checkoutBox", `
    <div class="badge"><span class="dot2"></span> Demo checkout</div>
    <h2 style="margin-top:10px">Trip summary</h2>
    <div class="note">
      <b>Route:</b> ${s.from} → ${s.to}<br>
      <b>Flight:</b> ${b.flight.fn} • ${fmtDate(s.depart)} • ${b.flight.dep}–${b.flight.arr}<br>
      <b>Bundle:</b> ${b.bundle} (${money(b.bundleTotal)})<br>
      <b>Seat:</b> ${b.seat || "—"} (${money(seatFee)})<br>
      <b>Bags:</b> Carry-on ${b.bags.carryOn?"Yes":"No"} • Checked ${b.bags.checked1?"Yes":"No"} (${money(bagFee)})<br><br>
      <b>Total:</b> ${money(total)} USD
    </div>
    <div class="fine">Fictional airline demo — no real tickets are sold.</div>
  `);
}

/* ---------- PAGES: Deals / Dest / Fleet / Status / Check-in / Manage ---------- */

function renderDeals(){
  if(!exists("dealGrid")) return;
  setHTML("dealGrid", deals.map((d,i)=>`
    <div class="addon">
      <div>
        <b>${d.from} → ${d.to}</b>
        <div class="muted">${airports[d.to].name} • ${d.label} • Promo: <b>${d.promo}</b></div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:1100;font-size:18px">${money(d.price)}</div>
        <button class="btn sun" data-deal="${i}">Use</button>
      </div>
    </div>
  `).join(""));
}

function renderDest(){
  if(!exists("destGrid")) return;
  setHTML("destGrid", destinations.map(d=>`
    <div class="addon">
      <div>
        <b>${d.code}</b> — ${airports[d.code].name}
        <div class="muted">${d.region}</div>
      </div>
      <button class="btn sun" data-dest="${d.code}">Book</button>
    </div>
  `).join(""));
}

function renderFleet(){
  if(!exists("fleetCards")) return;
  setHTML("fleetCards", fleet.map(f=>`
    <div class="addon">
      <div>
        <b>${f.type}</b>
        <div class="muted">${f.use}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:1100">${f.seats}</div>
        <div class="muted">${f.note}</div>
      </div>
    </div>
  `).join(""));
}

function renderStatus(){
  if(!exists("statusResults")) return;
  const q = (($("stFlight")?.value || "").replace(/\s+/g," ").trim().toUpperCase());
  if(!q){ setText("statusResults","Enter a flight number (example: SJ 215)."); return; }

  const statusPick = ["On time","Delayed 32 min","Boarding","Departed","Arrived"][randInt(0,4)];
  const gate = ["D4","E7","F12","G3"][randInt(0,3)];
  const eta = ["09:52","14:41","19:07","23:18"][randInt(0,3)];

  setHTML("statusResults", `
    <b>${q}</b><br>
    Status: <b>${statusPick}</b><br>
    Gate: <b>${gate}</b><br>
    ETA: <b>${eta}</b>
  `);
}

function renderCheckin(){
  if(!exists("bp")) return;
  const code = ($("ciCode")?.value || "").trim().toUpperCase();
  const last = ($("ciLast")?.value || "").trim().toUpperCase();

  if(code==="ABC123" && last==="SUNJET"){
    const seat = state.booking?.seat || "12A";
    setHTML("bp", `
      <b>BOARDING PASS</b><br>
      Name: <b>SUNJET / GUEST</b><br>
      Flight: <b>SJ 215</b><br>
      From: <b>MIA</b> → To: <b>SJU</b><br>
      Seat: <b>${seat}</b><br>
      Group: <b>${["1","2","3","4"][randInt(0,3)]}</b>
    `);
  } else {
    setText("bp","Booking not found (demo). Try ABC123 + SUNJET.");
  }
}

function renderManage(){
  if(!exists("mbBox")) return;
  const code = ($("mbCode")?.value || "").trim().toUpperCase();
  const last = ($("mbLast")?.value || "").trim().toUpperCase();

  if(code==="ABC123" && last==="SUNJET"){
    const s = state.search;
    const b = state.booking;
    if(s && b){
      setHTML("mbBox", `
        <b>Booking found</b><br>
        Confirmation: <b>ABC123</b><br>
        Route: <b>${s.from} → ${s.to}</b><br>
        Flight: <b>${b.flight.fn}</b><br>
        Seat: <b>${b.seat || "—"}</b><br>
        Bundle: <b>${b.bundle}</b>
      `);
    } else {
      setHTML("mbBox", `
        <b>Booking found</b><br>
        Tip: Book a flight first so your selections show up here.
      `);
    }
  } else {
    setText("mbBox","Booking not found (demo). Try ABC123 + SUNJET.");
  }
}

/* ---------- ROUTE MAP ---------- */

function renderMapInfo(){
  if(!exists("mapInfo")) return;
  if(state.search){
    const to = state.search.to;
    setHTML("mapInfo", `Selected route: <b>MIA → ${to}</b> (${airports[to].name})`);
  } else {
    setText("mapInfo","No route selected yet. Book a flight and come back.");
  }
}

function renderMapSvg(){
  const svg = $("routeSvg");
  if(!svg) return;
  const nodesG = svg.querySelector("#nodes");
  const routesG = svg.querySelector("#routes");
  if(!nodesG || !routesG) return;

  nodesG.innerHTML = "";
  routesG.innerHTML = "";

  const mia = airports.MIA;

  routesFromMIA.forEach(code=>{
    const c = airports[code];
    if(!c) return;
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d", `M ${mia.x} ${mia.y} Q ${(mia.x+c.x)/2} ${(mia.y+c.y)/2 - 35} ${c.x} ${c.y}`);
    path.setAttribute("class","route");
    path.setAttribute("data-to", code);
    routesG.appendChild(path);
  });

  Object.entries(airports).forEach(([code,a])=>{
    const cir = document.createElementNS("http://www.w3.org/2000/svg","circle");
    cir.setAttribute("cx", a.x);
    cir.setAttribute("cy", a.y);
    cir.setAttribute("r", code==="MIA" ? 9 : 7);
    cir.setAttribute("class", code==="MIA" ? "node mia" : "node");
    nodesG.appendChild(cir);

    const label = document.createElementNS("http://www.w3.org/2000/svg","text");
    label.setAttribute("x", a.x + 10);
    label.setAttribute("y", a.y + 4);
    label.setAttribute("class","cityLabel");
    label.textContent = code;
    nodesG.appendChild(label);
  });

  highlightSelectedRoute();
}

function highlightSelectedRoute(){
  document.querySelectorAll(".route").forEach(r=>r.classList.remove("active"));
  if(!state.search) return;
  const to = state.search.to;
  const match = document.querySelector(`.route[data-to="${to}"]`);
  if(match) match.classList.add("active");
}

/* ---------- GLOBAL CLICK HANDLERS (Deals/Dest) ---------- */

document.addEventListener("click", (e)=>{
  const dBtn = e.target.closest("button[data-deal]");
  if(dBtn){
    const d = deals[Number(dBtn.dataset.deal)];
    if($("from")) $("from").value = d.from;
    if($("to")) $("to").value = d.to;
    if($("promo")) $("promo").value = d.promo;
    show("home");
    return;
  }

  const destBtn = e.target.closest("button[data-dest]");
  if(destBtn){
    if($("from")) $("from").value = "MIA";
    if($("to")) $("to").value = destBtn.dataset.dest;
    show("home");
    return;
  }
});

/* ---------- WIRE NAV + BUTTONS ---------- */

function wire(){
  // Nav
  const nav = (id, page, before)=>{
    const el = $(id);
    if(!el) return;
    el.addEventListener("click",(e)=>{
      e.preventDefault();
      if(before) before();
      show(page);
    });
  };

  nav("navHome","home");
  nav("navBook","home");
  nav("navDeals","deals", renderDeals);
  nav("navStatus","status");
  nav("navCheckin","checkin");
  nav("navManage","manage");
  nav("navDest","dest", renderDest);
  nav("navFleet","fleet", renderFleet);
  nav("navMap","map", ()=>{ renderMapSvg(); renderMapInfo(); });
  nav("navHelp","help");
  nav("navSeats","seats", renderSeats);
  nav("navFlights","results", renderResults);

  // Header buttons
  if($("btnSignin")) $("btnSignin").addEventListener("click", ()=>alert("Demo sign-in"));
  if($("btnReset")) $("btnReset").addEventListener("click", ()=>{
    state.search = null;
    state.booking = null;
    alert("Demo reset.");
    renderMapSvg();
    renderMapInfo();
    show("home");
  });

  // Trip type
  if($("tripRound")) $("tripRound").addEventListener("click", ()=>{
    state.tripType = "round";
    $("tripRound")?.classList.add("active");
    $("tripOne")?.classList.remove("active");
    if($("returnWrap")) $("returnWrap").style.display = "block";
  });

  if($("tripOne")) $("tripOne").addEventListener("click", ()=>{
    state.tripType = "one";
    $("tripOne")?.classList.add("active");
    $("tripRound")?.classList.remove("active");
    if($("returnWrap")) $("returnWrap").style.display = "none";
  });

  // Book/search buttons
  if($("btnSearch")) $("btnSearch").addEventListener("click", doSearch);
  if($("btnDealsQuick")) $("btnDealsQuick").addEventListener("click", ()=>{ renderDeals(); show("deals"); });

  // Booking flow buttons
  if($("btnBackToResults")) $("btnBackToResults").addEventListener("click", ()=>{
    renderResults();
    show("results");
  });

  if($("btnToBags")) $("btnToBags").addEventListener("click", ()=>{
    if($("btnToBags").disabled) return;
    renderBags();
    show("bags");
  });

  if($("btnBackToSeats")) $("btnBackToSeats").addEventListener("click", ()=>{
    renderSeats();
    show("seats");
  });

  if($("btnToCheckout")) $("btnToCheckout").addEventListener("click", ()=>{
    renderCheckout();
    show("checkout");
  });

  if($("btnBackToBags")) $("btnBackToBags").addEventListener("click", ()=>{
    renderBags();
    show("bags");
  });

  if($("btnFinish")) $("btnFinish").addEventListener("click", ()=>alert("Demo complete!"));

  // Map buttons
  if($("btnGoBook")) $("btnGoBook").addEventListener("click", ()=>show("home"));
  if($("btnHighlight")) $("btnHighlight").addEventListener("click", ()=>{
    highlightSelectedRoute();
    renderMapInfo();
  });

  // Status / checkin / manage
  if($("btnStatusSearch")) $("btnStatusSearch").addEventListener("click", renderStatus);
  if($("btnCheckin")) $("btnCheckin").addEventListener("click", renderCheckin);
  if($("btnManageFind")) $("btnManageFind").addEventListener("click", renderManage);
}

function init(){
  // Fill destination dropdown
  const toSel = $("to");
  if(toSel && toSel.options.length === 0){
    ["SJU","SDQ","PUJ","AUA","PTY","SJO","BOG","MDE","LIM","JFK","BOS","ORD"].forEach(c=>{
      const o=document.createElement("option");
      o.value=c;
      o.textContent=`${c} — ${airports[c].name}`;
      toSel.appendChild(o);
    });
    toSel.value="SJU";
  }

  // Default dates
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate()+14);
  const r = new Date(today.getFullYear(), today.getMonth(), today.getDate()+18);
  if($("depart")) $("depart").valueAsDate = d;
  if($("ret")) $("ret").valueAsDate = r;
  if($("stDate")) $("stDate").valueAsDate = d;

  if($("y")) $("y").textContent = new Date().getFullYear();

  wire();
  renderMapSvg();
  renderMapInfo();
  show("home");
}

document.addEventListener("DOMContentLoaded", init);
// ===== SUNJET ADD-ON: SunMiles + extra pages (paste at bottom) =====
(function(){
  // Add nav links (only if your nav exists)
  const nav = document.querySelector("nav");
  function addNav(id, label, page){
    if(!nav || document.getElementById(id)) return;
    const a = document.createElement("a");
    a.href="#";
    a.id=id;
    a.textContent=label;
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      if(typeof show === "function") show(page);
      if(page==="sunmiles") renderSunMiles();
      if(page==="fees") renderFees();
      if(page==="beforefly") renderBeforeFly();
      if(page==="futureroutes") renderFutureRoutes();
      if(page==="careers") renderCareers();
    });
    nav.appendChild(a);
  }

  addNav("navSunMiles","SunMiles","sunmiles");
  addNav("navFees2","Fees","fees");
  addNav("navBeforeFly","Before You Fly","beforefly");
  addNav("navFutureRoutes","Future Routes","futureroutes");
  addNav("navCareers","Careers","careers");

  // Content renderers
  function renderSunMiles(){
    const box = document.getElementById("sunmilesBox");
    if(!box) return;
    box.innerHTML = `
      <div class="sjGrid">
        <div class="sjCard">
          <div class="sjPill">SUNJET • SUNMILES</div>
          <h2 style="margin:10px 0 6px">Every flight earns more sun.</h2>
          <div class="sjMuted">Earn points, unlock perks, and redeem for flights, seats, and bags.</div>
        </div>

        <div class="sjCard">
          <h3>Earn SunMiles</h3>
          <table class="sjTable">
            <tr><th>Fare</th><th>Earn Rate</th></tr>
            <tr><td><b>BASIC</b></td><td>5 SunMiles per $1</td></tr>
            <tr><td><b>PLUS</b></td><td>7 SunMiles per $1</td></tr>
            <tr><td><b>MAX</b></td><td>9 SunMiles per $1</td></tr>
          </table>
        </div>

        <div class="sjCard">
          <h3>Elite Status</h3>
          <ul>
            <li><b>☀️ Bronze</b> — 10,000 SunMiles/year</li>
            <li><b>☀️☀️ Silver</b> — 25,000 SunMiles/year</li>
            <li><b>☀️☀️☀️ Gold</b> — 50,000 SunMiles/year</li>
          </ul>
          <div class="sjMuted">Gold includes priority boarding + free seat upgrades (demo rules).</div>
        </div>

        <div class="sjCard">
          <h3>Redeem</h3>
          <ul>
            <li>Short one-way: <b>5,000</b> SunMiles</li>
            <li>Caribbean one-way: <b>7,500–10,000</b> SunMiles</li>
            <li>Stretch seat: <b>1,500</b> SunMiles</li>
            <li>Carry-on bag: <b>2,000</b> SunMiles</li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderFees(){
    const box = document.getElementById("feesBox");
    if(!box) return;
    box.innerHTML = `
      <div class="sjGrid">
        <div class="sjCard">
          <div class="sjPill">BASIC</div>
          <ul>
            <li>Personal item included</li>
            <li>Seat selection from <b>$15</b></li>
            <li>Carry-on +<b>$49</b></li>
          </ul>
        </div>
        <div class="sjCard">
          <div class="sjPill">PLUS</div>
          <ul>
            <li>Carry-on included</li>
            <li>Standard seats included</li>
            <li>Stretch/Upfront extra</li>
          </ul>
        </div>
        <div class="sjCard">
          <div class="sjPill">MAX</div>
          <ul>
            <li>Carry-on + 1 checked included</li>
            <li>Any seat included</li>
            <li>Most flexible</li>
          </ul>
        </div>
        <div class="sjCard">
          <h3>Common fees (demo)</h3>
          <ul>
            <li>Standard seat: <b>$15</b></li>
            <li>Upfront: <b>$29</b></li>
            <li>Stretch: <b>$39</b></li>
            <li>Checked bag: <b>$45</b></li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderBeforeFly(){
    const box = document.getElementById("beforeflyBox");
    if(!box) return;
    box.innerHTML = `
      <div class="sjGrid">
        <div class="sjCard">
          <h3>Bags</h3>
          <ul>
            <li>Personal item: included</li>
            <li>Carry-on: included on PLUS/MAX</li>
            <li>Checked bag: included on MAX</li>
          </ul>
        </div>
        <div class="sjCard">
          <h3>Documents</h3>
          <div class="sjMuted">Many routes require a passport (international travel). Arrive early during holiday weeks.</div>
        </div>
        <div class="sjCard">
          <h3>Holiday travel tips</h3>
          <ul>
            <li>Pack light</li>
            <li>Check flight status before leaving</li>
            <li>PLUS/MAX = smoothest experience</li>
          </ul>
        </div>
        <div class="sjCard">
          <h3>Weather</h3>
          <div class="sjMuted">Florida storms + Northeast winter weather can cause delays. SunJet will rebook when possible (demo).</div>
        </div>
      </div>
    `;
  }

  function renderFutureRoutes(){
    const box = document.getElementById("futureroutesBox");
    if(!box) return;
    box.innerHTML = `
      <div class="sjCard">
        <h3>Next launches (fictional)</h3>
        <ul>
          <li><b>MIA → CUR</b> (Seasonal)</li>
          <li><b>MIA → GUA</b> (New)</li>
          <li><b>FLL → SJO</b> (Winter focus)</li>
          <li><b>MCO → SDQ</b> (Holiday peak)</li>
        </ul>
        <div class="sjMuted">Designed for SunJet’s Florida hub strategy.</div>
      </div>
    `;
  }

  function renderCareers(){
    const box = document.getElementById("careersBox");
    if(!box) return;
    box.innerHTML = `
      <div class="sjGrid">
        <div class="sjCard"><div class="sjPill">Pilots</div><ul><li>A320 family</li><li>MIA/FLL bases</li><li>Growth opportunities</li></ul></div>
        <div class="sjCard"><div class="sjPill">Cabin Crew</div><ul><li>Bilingual a plus</li><li>Customer-first</li><li>Flexible schedules</li></ul></div>
        <div class="sjCard"><div class="sjPill">Maintenance</div><ul><li>A320 family focus</li><li>Line maintenance</li><li>Night shifts available</li></ul></div>
        <div class="sjCard"><div class="sjPill">Ops / Dispatch</div><ul><li>Weather-focused</li><li>IRROPS handling</li><li>LATAM network support</li></ul></div>
      </div>
    `;
  }

  // Render once so pages aren’t blank
  renderSunMiles(); renderFees(); renderBeforeFly(); renderFutureRoutes(); renderCareers();

  // OPTIONAL: show SunMiles earning inside checkout if your checkoutBox exists
  const oldCheckout = window.renderCheckout;
  if(typeof oldCheckout === "function"){
    window.renderCheckout = function(){
      oldCheckout();
      const box = document.getElementById("checkoutBox");
      if(!box || document.getElementById("smCheckoutCard")) return;

      const bundle = window.state?.booking?.bundle || "PLUS";
      const total  = window.state?.booking?.bundleTotal || 100;
      const rate   = bundle==="MAX"?9:bundle==="PLUS"?7:5;
      const miles  = Math.floor(rate * total);

      const card = document.createElement("div");
      card.className="sjCard";
      card.id="smCheckoutCard";
      card.style.marginTop="12px";
      card.innerHTML = `<div class="sjPill">SUNMILES</div>
        <div style="margin-top:8px">This trip earns <b>${miles}</b> SunMiles (demo).</div>
        <div class="sjMuted">Bundle ${bundle} • ${rate} miles per $1</div>`;
      box.appendChild(card);
    };
  }
})();