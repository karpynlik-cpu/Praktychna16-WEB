(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

  // Тема
  var root=document.documentElement,tb=$('#themeBtn');
  function setTheme(t){root.dataset.theme=t;tb.textContent=t==='dark'?'☀️':'🌙';store('theme',t)}
  var saved=store('theme')||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  setTheme(saved);
  tb.addEventListener('click',function(){setTheme(root.dataset.theme==='dark'?'light':'dark')});

  // Меню
  $('#burger').addEventListener('click',function(){$('#nav').classList.toggle('open')});

  // Прогрес прокручування і кнопка «нагору»
  var prog=$('#progress'),top=$('#toTop');
  window.addEventListener('scroll',function(){
    var h=document.documentElement,max=h.scrollHeight-h.clientHeight;
    prog.style.width=(max>0?h.scrollTop/max*100:0)+'%';
    top.classList.toggle('show',h.scrollTop>400);
  },{passive:true});
  top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

  // Поява блоків
  var rv=$$('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});
    rv.forEach(function(el){io.observe(el)});
  }else rv.forEach(function(el){el.classList.add('in')});

  // Лічильники
  $$('[data-count]').forEach(function(el){
    var end=+el.dataset.count,n=0,step=Math.max(1,Math.ceil(end/30));
    var t=setInterval(function(){n=Math.min(end,n+step);el.textContent=n;if(n>=end)clearInterval(t)},40);
  });

  // Випадковий рецепт (головна)
  var rb=$('#randomBtn');
  if(rb)rb.addEventListener('click',function(){
    var cs=$$('.card');cs.forEach(function(c){c.classList.remove('pick')});
    var c=cs[Math.floor(Math.random()*cs.length)];c.classList.add('pick');
    c.scrollIntoView({behavior:'smooth',block:'center'});
    $('#randomOut').textContent='Сьогодні готуємо: '+$('h3',c).textContent+'!';
  });

  // Сторінка рецептів
  var list=$('#list');if(!list)return;
  var recs=$$('.recipe');
  var favs=[];try{favs=JSON.parse(store('favs')||'[]')}catch(e){}
  function fmt(x){x=Math.round(x*10)/10;return String(x).replace('.',',')}

  // Кількість порцій
  recs.forEach(function(r){
    var base=+r.dataset.base,cur=base,out=$('.srv',r);
    function upd(){
      out.textContent=cur;
      $$('li[data-amount]',r).forEach(function(li){
        $('.amt',li).textContent=fmt(li.dataset.amount*cur/base)+' '+li.dataset.unit+' '+li.dataset.name;
      });
    }
    $('.plus',r).addEventListener('click',function(){if(cur<24){cur++;upd()}});
    $('.minus',r).addEventListener('click',function(){if(cur>1){cur--;upd()}});
    upd();

    // Улюблене
    var fb=$('.fav',r);
    function showFav(){var on=favs.indexOf(r.id)>-1;fb.classList.toggle('on',on);fb.textContent=on?'♥':'♡';fb.setAttribute('aria-pressed',on)}
    fb.addEventListener('click',function(){
      var i=favs.indexOf(r.id);i>-1?favs.splice(i,1):favs.push(r.id);store('favs',JSON.stringify(favs));showFav();apply();
    });
    showFav();

    // Таймер
    var tbn=$('.timer-btn',r),to=$('.timer-out',r),iv=null;
    if(tbn)tbn.addEventListener('click',function(){
      if(iv){clearInterval(iv);iv=null;to.textContent='';tbn.textContent='⏱ Таймер на '+tbn.dataset.min+' хв';return}
      var s=tbn.dataset.min*60;tbn.textContent='⏹ Зупинити';
      function tick(){
        var m=Math.floor(s/60),sec=s%60;to.textContent='⏱ '+m+':'+(sec<10?'0':'')+sec;
        if(s--<=0){clearInterval(iv);iv=null;to.textContent='✅ Готово!';tbn.textContent='⏱ Таймер на '+tbn.dataset.min+' хв';beep()}
      }
      tick();iv=setInterval(tick,1000);
    });

    // Друк
    $('.print-btn',r).addEventListener('click',function(){
      r.classList.add('printing');window.print();r.classList.remove('printing');
    });
  });
  function beep(){try{var a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(function(){o.stop()},700)}catch(e){}}

  // Пошук, фільтр, сортування
  var filter='Усі',q='',sort='';
  function apply(){
    var shown=0;
    recs.forEach(function(r){
      var ok=(filter==='Усі')||(filter==='❤ Улюблені'?favs.indexOf(r.id)>-1:r.dataset.cat===filter);
      if(q&&r.dataset.title.indexOf(q)<0)ok=false;
      r.hidden=!ok;if(ok)shown++;
    });
    $('#empty').hidden=shown>0;
  }
  $('#chips').addEventListener('click',function(e){
    if(!e.target.dataset.f)return;filter=e.target.dataset.f;
    $$('.chip-btn').forEach(function(b){b.classList.toggle('on',b===e.target)});apply();
  });
  $('#search').addEventListener('input',function(){q=this.value.trim().toLowerCase();apply()});
  $('#sort').addEventListener('change',function(){
    sort=this.value;var arr=recs.slice();
    if(sort==='time')arr.sort(function(a,b){return a.dataset.time-b.dataset.time});
    if(sort==='name')arr.sort(function(a,b){return a.dataset.title.localeCompare(b.dataset.title,'uk')});
    if(!sort)arr=$$('.recipe',list).sort(function(a,b){return 0});
    arr.forEach(function(r){list.appendChild(r)});
  });
})();
