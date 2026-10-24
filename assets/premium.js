/* Keyboard access for the mobile overlay; original script owns opening/closing. */
(function(){
  'use strict';
  var menu=document.getElementById('menu'), toggle=document.getElementById('burger');
  var wasOpen=false;
  function sync(){
    var open=toggle.getAttribute('aria-expanded')==='true';
    menu.inert=!open;
    menu.setAttribute('aria-hidden',String(!open));
    toggle.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');
    if(open&&!wasOpen){var a=menu.querySelector('a');if(a)a.focus();}
    if(!open&&wasOpen&&menu.contains(document.activeElement))toggle.focus();
    wasOpen=open;
  }
  new MutationObserver(sync).observe(toggle,{attributes:true,attributeFilter:['aria-expanded']});sync();
  document.addEventListener('keydown',function(e){
    if(!wasOpen||e.key!=='Tab')return;
    var items=[toggle].concat(Array.from(menu.querySelectorAll('a,button')));
    var first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  var preference=matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change',function(){location.reload();});
})();
