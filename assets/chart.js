// MOLiR chart renderer — shared by the intro page (example) and the builder.
window.MOLIR = (function(){
  var LEVELS = [
    {v: 3, key:"flourished",  label:"Flourished",  color:"#2EAD5B", emoji:"🌳"},
    {v: 2, key:"energised",   label:"Energised",   color:"#6DBE45", emoji:"⚡"},
    {v: 1, key:"connected",   label:"Connected",   color:"#1FA2DC", emoji:"🤝"},
    {v: 0, key:"neutral",     label:"Neutral",     color:"#9AA0AE", emoji:"😐"},
    {v:-1, key:"stretched",   label:"Stretched",   color:"#FFB020", emoji:"🧗"},
    {v:-2, key:"overwhelmed", label:"Overwhelmed", color:"#F57A2B", emoji:"🌊"},
    {v:-3, key:"drained",     label:"Drained",     color:"#E5484D", emoji:"🪫"}
  ];
  var CHAPTERS = [
    {key:"foundations", label:"Foundations", years:"10+ years ago", soft:"#ECE5F7", strong:"#8A6BC1"},
    {key:"growth",      label:"Growth Years", years:"4–10 years ago", soft:"#FFF4D1", strong:"#E0A100"},
    {key:"recent",      label:"Recent Years", years:"last 1–3 years", soft:"#FCE3EC", strong:"#EE5E8F"}
  ];
  function level(v){ for(var i=0;i<LEVELS.length;i++) if(LEVELS[i].v===Number(v)) return LEVELS[i]; return LEVELS[3]; }
  function chapter(k){ for(var i=0;i<CHAPTERS.length;i++) if(CHAPTERS[i].key===k) return CHAPTERS[i]; return CHAPTERS[0]; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function wrap(text, max, maxLines){
    var words = String(text||"").trim().split(/\s+/), lines=[], cur="";
    words.forEach(function(w){
      if(!w) return;
      if((cur+" "+w).trim().length > max && cur){ lines.push(cur); cur=w; } else cur=(cur+" "+w).trim();
    });
    if(cur) lines.push(cur);
    if(lines.length>maxLines){ lines=lines.slice(0,maxLines); lines[maxLines-1]=lines[maxLines-1].replace(/.{0,2}$/,"")+"…"; }
    return lines;
  }
  function yearOf(m){ var n=parseInt(String(m.when||"").match(/\d{4}|\d+/),10); return isNaN(n)?null:n; }

  // Returns moments in plotting order, each with ._n (1-based number)
  function ordered(moments){
    var out=[];
    CHAPTERS.forEach(function(c){
      var list = moments.filter(function(m){return m.chapter===c.key;})
        .map(function(m,i){return {m:m,i:i,y:yearOf(m)};});
      list.sort(function(a,b){
        if(a.y!=null && b.y!=null && a.y!==b.y) return a.y-b.y;
        return a.i-b.i;
      });
      list.forEach(function(x){ out.push(x.m); });
    });
    out.forEach(function(m,i){ m._n=i+1; });
    return out;
  }

  function render(moments, opts){
    opts = opts||{};
    var W=opts.width||1120, H=opts.height||620, padL=150, padR=36, padT=opts.title?104:60, padB=86;
    var plotW=W-padL-padR, plotH=H-padT-padB, step=plotH/6;
    var Y=function(v){ return padT+(3-v)*step; };
    var font='font-family="Nunito, Segoe UI, Arial, sans-serif"';
    var s=[];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Moments of Life in Review energy chart" '+font+'>');
    s.push('<rect width="'+W+'" height="'+H+'" fill="#ffffff"/>');
    if(opts.title) s.push('<text x="'+padL+'" y="34" font-size="20" font-weight="800" fill="#2B2A33" font-family="Baloo 2, Nunito, sans-serif">'+esc(opts.title)+'</text>');

    // chapter columns
    var bandW=plotW/3;
    CHAPTERS.forEach(function(c,i){
      var x=padL+i*bandW;
      s.push('<rect x="'+x+'" y="'+padT+'" width="'+bandW+'" height="'+plotH+'" fill="'+c.soft+'" opacity="'+(i%2?0.55:0.4)+'"/>');
      s.push('<text x="'+(x+bandW/2)+'" y="'+(H-padB+38)+'" text-anchor="middle" font-size="16" font-weight="800" fill="'+c.strong+'">'+esc(c.label)+'</text>');
      s.push('<text x="'+(x+bandW/2)+'" y="'+(H-padB+58)+'" text-anchor="middle" font-size="12.5" fill="#6B6878">'+esc(c.years)+'</text>');
    });
    // gridlines + y labels
    LEVELS.forEach(function(L){
      var y=Y(L.v);
      s.push('<line x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y+'" y2="'+y+'" stroke="'+(L.v===0?"#8A6BC1":"#E7E3EE")+'" stroke-width="'+(L.v===0?2.5:1)+'" '+(L.v===0?'':'stroke-dasharray="4 6"')+'/>');
      s.push('<circle cx="'+(padL-22)+'" cy="'+y+'" r="5" fill="'+L.color+'"/>');
      s.push('<text x="'+(padL-34)+'" y="'+(y+4.5)+'" text-anchor="end" font-size="13.5" font-weight="700" fill="#4A4757">'+L.label+'</text>');
    });
    // y axis arrow
    var ax=padL-8;
    s.push('<line x1="'+ax+'" x2="'+ax+'" y1="'+(padT-18)+'" y2="'+(H-padB+8)+'" stroke="#8A6BC1" stroke-width="2.5"/>');
    s.push('<path d="M'+(ax-6)+' '+(padT-12)+' L'+ax+' '+(padT-24)+' L'+(ax+6)+' '+(padT-12)+'Z" fill="#8A6BC1"/>');
    s.push('<text x="'+(ax-12)+'" y="'+(padT-26)+'" text-anchor="end" font-size="12" font-weight="800" fill="#8A6BC1">HIGHS</text>');
    s.push('<text x="'+(ax-12)+'" y="'+(H-padB+20)+'" text-anchor="end" font-size="12" font-weight="800" fill="#8A6BC1">LOWS</text>');

    var list=ordered(moments.slice());
    if(!list.length){
      s.push('<text x="'+(padL+plotW/2)+'" y="'+(Y(0)-18)+'" text-anchor="middle" font-size="17" fill="#6B6878" font-weight="700">Add your first moment to start plotting your journey ✨</text>');
      s.push('</svg>'); return s.join("");
    }
    // positions
    var pts=[];
    CHAPTERS.forEach(function(c,ci){
      var inC=list.filter(function(m){return m.chapter===c.key;});
      inC.forEach(function(m,j){
        pts.push({m:m, x:padL+ci*bandW+bandW*(j+1)/(inC.length+1), y:Y(level(m.energy).v)});
      });
    });
    // line
    if(pts.length>1){
      var d=pts.map(function(p,i){return (i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1);}).join(" ");
      s.push('<path d="'+d+'" fill="none" stroke="#8A6BC1" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".75"/>');
    }
    // labels
    // labels: try positions above/below each dot, pick the first that doesn't collide
    var labels=[], boxes=pts.map(function(p){ return {x1:p.x-15,x2:p.x+15,y1:p.y-15,y2:p.y+15}; });
    var minY=opts.title?46:8, maxY=H-padB+4;
    function hit(b){ for(var i=0;i<boxes.length;i++){ var o=boxes[i]; if(b.x1<o.x2&&b.x2>o.x1&&b.y1<o.y2&&b.y2>o.y1) return true; } return false; }
    pts.forEach(function(p){
      var v=level(p.m.energy).v, lh=15;
      var lines=wrap(p.m.title, opts.wrap||20, 3);
      if(!lines.length) return;
      var wid=Math.max.apply(null, lines.map(function(t){return t.length;}))*6.9+8, bh=lines.length*lh;
      var sides = v>=0 ? ["up","down"] : ["down","up"], cands=[];
      sides.forEach(function(sd){ for(var k=0;k<5;k++){
        var y1 = sd==="up" ? p.y-17-bh-k*14 : p.y+17+k*14;
        [0,-wid*0.35,wid*0.35].forEach(function(dx){ cands.push({x:p.x+dx, y1:y1}); });
      }});
      var pick=null;
      for(var i=0;i<cands.length;i++){
        var c=cands[i], b={x1:c.x-wid/2,x2:c.x+wid/2,y1:c.y1,y2:c.y1+bh};
        if(b.y1<minY||b.y2>maxY||b.x1<padL-4||b.x2>W-4) continue;
        if(!hit(b)){ pick={c:c,b:b}; break; }
      }
      if(!pick){ var c0=cands[0]; pick={c:c0,b:{x1:c0.x-wid/2,x2:c0.x+wid/2,y1:c0.y1,y2:c0.y1+bh}}; }
      boxes.push(pick.b);
      labels.push({p:{x:pick.c.x},lines:lines,top:pick.c.y1+11,lh:lh});
    });
    labels.forEach(function(L){
      L.lines.forEach(function(t,i){
        s.push('<text x="'+L.p.x.toFixed(1)+'" y="'+(L.top+i*L.lh).toFixed(1)+'" text-anchor="middle" font-size="12.5" font-weight="700" fill="#2B2A33" paint-order="stroke" stroke="#ffffff" stroke-width="4" stroke-linejoin="round">'+esc(t)+'</text>');
      });
    });
    pts.forEach(function(p){
      var L=level(p.m.energy);
      s.push('<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="13" fill="'+L.color+'" stroke="#fff" stroke-width="3"/>');
      s.push('<text x="'+p.x.toFixed(1)+'" y="'+(p.y+4.5).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">'+p.m._n+'</text>');
    });
    s.push('</svg>');
    return s.join("");
  }

  var SAMPLE = [
    {title:"Worked my first part-time job", chapter:"foundations", energy:1, when:"", remarks:"Learnt the value of showing up."},
    {title:"Sold handmade products at a community fair", chapter:"foundations", energy:2, when:"", remarks:""},
    {title:"Started my career!", chapter:"foundations", energy:3, when:"", remarks:""},
    {title:"Bought my first home", chapter:"growth", energy:3, when:"", remarks:""},
    {title:"Completed a Master's while working and raising a family", chapter:"growth", energy:-1, when:"", remarks:"Stretched, but proud."},
    {title:"Lost a loved one during COVID", chapter:"growth", energy:-2, when:"", remarks:""},
    {title:"Rediscovered my love for baking", chapter:"recent", energy:2, when:"", remarks:"Creating with my hands restores me."},
    {title:"Caring for an ageing parent", chapter:"recent", energy:-2, when:"", remarks:""},
    {title:"Started giving back to the community", chapter:"recent", energy:1, when:"", remarks:"Contribution energises me."}
  ];

  return {LEVELS:LEVELS, CHAPTERS:CHAPTERS, level:level, chapter:chapter, render:render, ordered:ordered, esc:esc, SAMPLE:SAMPLE};
})();
