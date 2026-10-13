const p=require('puppeteer');
const out='C:/Users/07kav/AppData/Local/Temp/claude/d--project/d87487c0-1b2d-45e2-aa4f-c37f6a4ef5d2/scratchpad/';
(async()=>{const b=await p.launch();
let bad=0;
for(const w of [320,360,375,390,412,430,540,600,768,820,1024]){const pg=await b.newPage();await pg.setViewport({width:w,height:800,isMobile:w<700,hasTouch:true,deviceScaleFactor:2});
 for(const path of ['/','/vision-mission','/works','/register','/get-certificate','/get-involved']){await pg.goto('http://localhost:3055'+path,{waitUntil:'networkidle0'});
  const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0){bad++;console.log('OVERFLOW',w,path,o)}}
 await pg.close();}
console.log('overflow pages:',bad);
const pg=await b.newPage();await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await pg.goto('http://localhost:3055/',{waitUntil:'networkidle0'});
await pg.screenshot({path:out+'top.png'});
await pg.tap('.cbe-burger');await pg.screenshot({path:out+'open.png'});
await pg.mouse.click(200,700);await new Promise(r=>setTimeout(r,200));
console.log('menu closed after outside tap:',await pg.evaluate(()=>!document.querySelector('#cbe-links').classList.contains('open')));
await pg.evaluate(()=>window.scrollTo(0,1500));await pg.screenshot({path:out+'mid.png'});
await b.close();})();
