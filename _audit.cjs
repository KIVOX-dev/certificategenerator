const p=require('D:/project/node_modules/puppeteer');
(async()=>{const b=await p.launch();
const paths=['/','/vision-mission','/works','/register','/get-certificate','/get-involved','/faq'];
const widths=[320,360,390,430,600,768,1024,1280,1920];
for(const w of widths){const pg=await b.newPage();await pg.setViewport({width:w,height:800,isMobile:w<600,hasTouch:w<1024});
 for(const path of paths){await pg.goto('http://localhost:3055'+path,{waitUntil:'networkidle0'});
  const r=await pg.evaluate(()=>{const de=document.documentElement;const over=de.scrollWidth-de.clientWidth;
   const bad=[];document.querySelectorAll('a,button,summary,input').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.height&&(r.height<40||r.width<40)&&getComputedStyle(e).display!=='none'&&r.height>0&&!e.closest('.cbe-foot-links')&&e.className!=='cbe-link'&&!e.classList.contains('cbe-link'))bad.push((e.className||e.tagName)+':'+Math.round(r.width)+'x'+Math.round(r.height))});
   const wide=[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>de.clientWidth+1).slice(0,3).map(e=>e.tagName+'.'+e.className);
   return {over,bad:bad.slice(0,4),wide}});
  if(r.over>0||r.bad.length||r.wide.length)console.log(w,path,JSON.stringify(r));}
 await pg.close();}
await b.close();})();
