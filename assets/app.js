(function(){
  var M = window.MOLIR, $ = function(id){ return document.getElementById(id); };
  var KEY = "molir-v1";
  var PROMPTS = {
    foundations:["Which experiences most shaped who you are?","Which values have guided your decisions?","What themes keep repeating?"],
    growth:["What big transitions did you navigate?","What new skills or perspectives did you build?","Which challenges grew you most?"],
    recent:["Which achievement are you proudest of?","What felt most fulfilling?","What do you want more of?"]
  };
  var REFL_LABELS = {themes:"Recurring themes", strengths:"Strengths I relied on", values:"Values that guided me", fulfil:"What energises / drains me", more:"I want more of", poss:"Possibilities for my next chapter", next:"One small next step", notes:"Other remarks"};

  var state = load() || blank();
  var draft = {chapter:"foundations", energy:null};
  var editingId = null;

  function blank(){ return {name:"", title:"", date:new Date().toISOString().slice(0,10), moments:[], refl:{}}; }
  function load(){ try{ var s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.moments) ? s : null; }catch(e){ return null; } }
  var saveT;
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); $("saved").textContent = "Saved in this browser · " + new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
    catch(e){ $("saved").textContent = "Couldn't autosave here. Use Save file."; }
  }
  function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(save, 300); }
  function uid(){ return Math.random().toString(36).slice(2,10); }

  /* ---------- form widgets ---------- */
  function buildSeg(){
    $("seg").innerHTML = M.CHAPTERS.map(function(c){
      return '<button type="button" data-c="'+c.key+'" style="--c:'+c.strong+';--cs:'+c.soft+'">'+c.label+'<small>'+c.years+'</small></button>';
    }).join("");
    $("seg").onclick = function(e){ var b=e.target.closest("button"); if(!b) return; draft.chapter=b.dataset.c; paintSeg(); };
  }
  function paintSeg(){
    [].forEach.call($("seg").children, function(b){ b.classList.toggle("on", b.dataset.c===draft.chapter); });
    var c = M.chapter(draft.chapter);
    $("hint").innerHTML = '<b>💡 Think about ('+c.label+')</b><ul>'+PROMPTS[c.key].map(function(p){return "<li>"+p+"</li>";}).join("")+"</ul>";
  }
  function buildEnergy(){
    $("epick").innerHTML = M.LEVELS.map(function(L){
      return '<button type="button" data-v="'+L.v+'"><span class="dot" style="background:'+L.color+'"></span>'+L.emoji+' '+L.label+'<span class="vv">'+(L.v>0?"+"+L.v:L.v)+'</span></button>';
    }).join("");
    $("epick").onclick = function(e){ var b=e.target.closest("button"); if(!b) return; draft.energy=Number(b.dataset.v); paintEnergy(); };
  }
  function paintEnergy(){
    [].forEach.call($("epick").children, function(b){
      var on = draft.energy!==null && Number(b.dataset.v)===draft.energy;
      b.classList.toggle("on", on);
      b.style.background = on ? M.level(b.dataset.v).color : "";
    });
  }
  function resetForm(){
    editingId=null; $("mTitle").value=""; $("mWhen").value=""; $("mRem").value="";
    draft.energy=null; paintEnergy();
    $("formTitle").textContent="Add a moment"; $("bAdd").textContent="＋ Add moment"; $("bCancel").style.display="none";
    $("err").style.display="none";
  }
  function submit(){
    var t=$("mTitle").value.trim();
    var msg = !t ? "Give the moment a short title." : (draft.energy===null ? "Pick an energy level." : "");
    if(msg){ $("err").textContent=msg; $("err").style.display="block"; return; }
    var data={title:t, chapter:draft.chapter, energy:draft.energy, when:$("mWhen").value.trim(), remarks:$("mRem").value.trim()};
    if(editingId){
      var m=state.moments.find(function(x){return x.id===editingId;}); if(m) Object.assign(m,data);
    } else { data.id=uid(); state.moments.push(data); }
    resetForm(); renderAll(); save(); $("mTitle").focus();
  }
  function edit(id){
    var m=state.moments.find(function(x){return x.id===id;}); if(!m) return;
    editingId=id; $("mTitle").value=m.title; $("mWhen").value=m.when||""; $("mRem").value=m.remarks||"";
    draft.chapter=m.chapter; draft.energy=Number(m.energy); paintSeg(); paintEnergy();
    $("formTitle").textContent="Edit moment #"+(m._n||""); $("bAdd").textContent="✓ Update moment"; $("bCancel").style.display="";
    renderList();
    if(window.innerWidth<980) $("mTitle").scrollIntoView({behavior:"smooth",block:"center"});
    $("mTitle").focus();
  }
  function del(id){
    var m=state.moments.find(function(x){return x.id===id;});
    if(!m || !confirm('Delete "'+m.title+'"?')) return;
    state.moments=state.moments.filter(function(x){return x.id!==id;});
    if(editingId===id) resetForm();
    renderAll(); save();
  }
  function move(id, dir){
    var arr=state.moments, i=arr.findIndex(function(x){return x.id===id;}); if(i<0) return;
    var ch=arr[i].chapter, j=i+dir;
    while(j>=0 && j<arr.length && arr[j].chapter!==ch) j+=dir;
    if(j<0 || j>=arr.length) return;
    var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
    renderAll(); save();
  }

  /* ---------- rendering ---------- */
  function renderChart(){
    var title = state.title || (state.name ? state.name+"'s Moments of Life in Review" : "My Moments of Life in Review");
    $("chart").innerHTML = M.render(state.moments, {title:title});
  }
  function renderList(){
    var ord = M.ordered(state.moments.slice());
    var hasYear = state.moments.some(function(m){return /\d/.test(m.when||"");});
    $("list").innerHTML = M.CHAPTERS.map(function(c){
      var items = ord.filter(function(m){return m.chapter===c.key;});
      return '<div class="chapter-block"><h3><span class="sw" style="background:'+c.strong+'"></span>'+c.label+' <small style="color:var(--muted);font-weight:600;font-size:.8rem">'+c.years+'</small></h3>'+
        (items.length ? items.map(function(m){
          var L=M.level(m.energy);
          return '<div class="mom'+(m.id===editingId?" editing":"")+'"><div class="badge" style="background:'+L.color+'">'+m._n+'</div>'+
            '<div><div class="t">'+M.esc(m.title)+'</div><div class="meta">'+L.emoji+' '+L.label+(m.when?' · '+M.esc(m.when):'')+'</div>'+
            (m.remarks?'<div class="rm">'+M.esc(m.remarks)+'</div>':'')+'</div>'+
            '<div class="acts"><button class="ib" title="Move earlier" data-a="up" data-id="'+m.id+'">↑</button><button class="ib" title="Move later" data-a="down" data-id="'+m.id+'">↓</button><button class="ib" title="Edit" data-a="edit" data-id="'+m.id+'">✏️</button><button class="ib" title="Delete" data-a="del" data-id="'+m.id+'">🗑️</button></div></div>';
        }).join("") : '<div class="empty">No moments yet. Try one of the prompts.</div>')+'</div>';
    }).join("") + (hasYear ? '<p class="privacy">Moments with a year or age are sorted by it within their chapter.</p>' : '');
  }
  function insightsData(){
    var ms=state.moments;
    if(!ms.length) return null;
    var ord=M.ordered(ms.slice());
    var top=ord.filter(function(m){return m.energy>=2;}).slice(0,5);
    var low=ord.filter(function(m){return m.energy<=-2;}).slice(0,5);
    var avg=M.CHAPTERS.map(function(c){
      var xs=ms.filter(function(m){return m.chapter===c.key;});
      return {c:c, n:xs.length, a: xs.length ? xs.reduce(function(s,m){return s+Number(m.energy);},0)/xs.length : null};
    });
    return {top:top, low:low, avg:avg};
  }
  function renderInsights(){
    var d=insightsData();
    if(!d){ $("insights").innerHTML='<div class="ins" style="background:var(--bg);grid-column:1/-1">Add a few moments and your energisers, drainers and chapter averages will appear here.</div>'; $("pIns").innerHTML=""; return; }
    function li(arr){ return arr.length ? "<ul>"+arr.map(function(m){return "<li>#"+m._n+" "+M.esc(m.title)+"</li>";}).join("")+"</ul>" : '<div style="font-size:.9rem;color:var(--muted)">None yet</div>'; }
    var bars=d.avg.map(function(x){
      if(x.a===null) return '<div class="bar">'+x.c.label+': <span style="color:var(--muted)">no moments</span></div>';
      var L=M.level(Math.round(x.a)), w=Math.round((x.a+3)/6*100);
      return '<div class="bar"><span style="width:96px">'+x.c.label+'</span><i style="width:'+w+'px;background:'+L.color+'"></i>'+(x.a>0?"+":"")+x.a.toFixed(1)+'</div>';
    }).join("");
    $("insights").innerHTML =
      '<div class="ins" style="background:var(--green-soft)"><h4>⚡ My energisers</h4>'+li(d.top)+'</div>'+
      '<div class="ins" style="background:var(--pink-soft)"><h4>🪫 My drainers</h4>'+li(d.low)+'</div>'+
      '<div class="ins" style="background:var(--blue-soft)"><h4>📊 Average energy by chapter</h4>'+bars+'<div style="font-size:.78rem;color:var(--muted)">Scale −3 (Drained) to +3 (Flourished)</div></div>';
    $("pIns").innerHTML = "<b>Energisers:</b> "+(d.top.map(function(m){return M.esc(m.title);}).join("; ")||"–")+
      " &nbsp;|&nbsp; <b>Drainers:</b> "+(d.low.map(function(m){return M.esc(m.title);}).join("; ")||"–")+
      " &nbsp;|&nbsp; <b>Average energy:</b> "+d.avg.map(function(x){return x.c.label+" "+(x.a===null?"–":(x.a>0?"+":"")+x.a.toFixed(1));}).join(", ");
  }
  function renderPrint(){
    $("pName").textContent = state.name || "";
    $("pTitle").textContent = state.title || "";
    $("pDate").textContent = state.date ? new Date(state.date+"T00:00").toLocaleDateString("en-SG",{day:"numeric",month:"long",year:"numeric"}) : "";
    var ord=M.ordered(state.moments.slice());
    $("pRows").innerHTML = ord.map(function(m){
      var L=M.level(m.energy);
      return "<tr><td>"+m._n+"</td><td>"+M.esc(m.title)+"</td><td>"+M.chapter(m.chapter).label+"</td><td>"+M.esc(m.when||"")+'</td><td><span style="color:'+L.color+';font-weight:800">●</span> '+L.label+"</td><td>"+M.esc(m.remarks||"")+"</td></tr>";
    }).join("") || '<tr><td colspan="6">No moments yet</td></tr>';
    var r=state.refl||{};
    $("pRefl").innerHTML = Object.keys(REFL_LABELS).filter(function(k){return (r[k]||"").trim();}).map(function(k){
      return "<div><h4>"+REFL_LABELS[k]+"</h4><p>"+M.esc(r[k])+"</p></div>";
    }).join("");
  }
  function renderAll(){ renderChart(); renderList(); renderInsights(); renderPrint(); }

  /* ---------- export ---------- */
  function download(name, blob){
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name;
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function fileBase(){ return "MOLiR"+(state.name?"-"+state.name.replace(/[^\w-]+/g,"_"):"")+"-"+(state.date||"draft"); }
  function exportPng(){
    var svg=$("chart").querySelector("svg"); if(!svg) return;
    var xml=new XMLSerializer().serializeToString(svg);
    var vb=svg.viewBox.baseVal, scale=2;
    var img=new Image();
    img.onload=function(){
      var c=document.createElement("canvas"); c.width=vb.width*scale; c.height=vb.height*scale;
      var ctx=c.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height);
      c.toBlob(function(b){ download(fileBase()+".png", b); }, "image/png");
    };
    img.onerror=function(){ alert("Couldn't create the image in this browser. Use Print / Save as PDF instead."); };
    img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(xml.replace('width="100%"','width="'+vb.width+'" height="'+vb.height+'"'));
  }
  function exportJson(){
    var clean=JSON.parse(JSON.stringify(state)); clean.moments.forEach(function(m){ delete m._n; });
    download(fileBase()+".json", new Blob([JSON.stringify(clean,null,2)],{type:"application/json"}));
  }
  function importJson(file){
    var rd=new FileReader();
    rd.onload=function(){
      try{
        var s=JSON.parse(rd.result);
        if(!s || !Array.isArray(s.moments)) throw 0;
        s.moments=s.moments.filter(function(m){return m && m.title;}).map(function(m){
          return {id:m.id||uid(), title:String(m.title).slice(0,90), chapter:M.CHAPTERS.some(function(c){return c.key===m.chapter;})?m.chapter:"foundations",
                  energy:Math.max(-3,Math.min(3,Math.round(Number(m.energy)||0))), when:String(m.when||"").slice(0,30), remarks:String(m.remarks||"").slice(0,600)};
        });
        state={name:String(s.name||""), title:String(s.title||""), date:String(s.date||""), moments:s.moments, refl:(s.refl&&typeof s.refl==="object")?s.refl:{}};
        hydrate(); resetForm(); renderAll(); save();
      }catch(e){ alert("That file isn't a MOLiR save file."); }
    };
    rd.readAsText(file);
  }

  /* ---------- wiring ---------- */
  function hydrate(){
    $("name").value=state.name||""; $("rtitle").value=state.title||""; $("rdate").value=state.date||"";
    document.querySelectorAll("[data-r]").forEach(function(t){ t.value=(state.refl||{})[t.dataset.r]||""; });
  }
  $("name").oninput=function(){ state.name=this.value; renderChart(); renderPrint(); saveSoon(); };
  $("rtitle").oninput=function(){ state.title=this.value; renderChart(); renderPrint(); saveSoon(); };
  $("rdate").oninput=function(){ state.date=this.value; renderPrint(); saveSoon(); };
  document.querySelectorAll("[data-r]").forEach(function(t){
    t.oninput=function(){ state.refl=state.refl||{}; state.refl[t.dataset.r]=t.value; renderPrint(); saveSoon(); };
  });
  $("bAdd").onclick=submit;
  $("bCancel").onclick=function(){ resetForm(); renderList(); };
  $("mTitle").onkeydown=function(e){ if(e.key==="Enter"){ e.preventDefault(); submit(); } };
  $("list").onclick=function(e){
    var b=e.target.closest("button[data-a]"); if(!b) return;
    var id=b.dataset.id, a=b.dataset.a;
    if(a==="edit") edit(id); else if(a==="del") del(id); else move(id, a==="up"?-1:1);
  };
  $("bPrint").onclick=function(){ renderPrint(); window.print(); };
  $("bPng").onclick=exportPng;
  $("bSave").onclick=exportJson;
  $("bOpen").onclick=function(){ $("fileIn").click(); };
  $("fileIn").onchange=function(){ if(this.files[0]) importJson(this.files[0]); this.value=""; };
  $("bSample").onclick=function(){
    if(state.moments.length && !confirm("Replace your current moments with the example?")) return;
    state.moments=M.SAMPLE.map(function(m){ return Object.assign({id:uid()}, m); });
    if(!state.title) state.title="Example life review";
    hydrate(); resetForm(); renderAll(); save();
  };
  $("bClear").onclick=function(){
    if(!confirm("Clear everything and start over? Save a file first if you want to keep this.")) return;
    state=blank(); hydrate(); resetForm(); renderAll(); save();
  };
  window.addEventListener("beforeprint", renderPrint);

  buildSeg(); buildEnergy(); paintSeg(); paintEnergy(); hydrate(); renderAll();
  if(load()) $("saved").textContent="Restored from this browser";
})();
