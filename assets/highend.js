(function(){
  'use strict';
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced||!('IntersectionObserver' in window))return;
  // Reserve compositor layers only around the reveal, then release them.
  var reveals=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      var el=entry.target;
      el.style.willChange='transform, opacity';
      var timer=setTimeout(clean,2000);
      function clean(){clearTimeout(timer);el.style.removeProperty('will-change');el.removeEventListener('transitionend',clean);}
      el.addEventListener('transitionend',clean);
      reveals.unobserve(el);
    });
  },{rootMargin:'100px 0px',threshold:0});
  document.querySelectorAll('[data-rv]').forEach(function(el){reveals.observe(el);});
  // Pause decorative CSS animations when their section leaves the viewport.
  var scenes=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      entry.target.querySelectorAll('.ly2,.dotlive,.cue i,.marq-in').forEach(function(el){
        el.style.animationPlayState=entry.isIntersecting?'running':'paused';
      });
    });
  });
  document.querySelectorAll('.hero,.lens,.marq').forEach(function(el){scenes.observe(el);});
})();
