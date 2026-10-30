/* Draws the app icons (PNG) from the SVG drawings below. Runs on GitHub (workflow «Εικονίδια») when this file changes. */
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const BASE={"vctips": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"512\" height=\"512\" viewBox=\"0 0 512 512\"><defs><linearGradient id=\"yl\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffd24a\"/><stop offset=\"1\" stop-color=\"#f2a900\"/></linearGradient><linearGradient id=\"og\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ff9a3c\"/><stop offset=\"1\" stop-color=\"#ea6a0c\"/></linearGradient><filter id=\"sh\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\"><feDropShadow dx=\"0\" dy=\"1.2\" stdDeviation=\"1.1\" flood-color=\"#0b1a33\" flood-opacity=\".28\"/></filter><linearGradient id=\"bgg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffffff\"/><stop offset=\"1\" stop-color=\"#eef3fa\"/></linearGradient><linearGradient id=\"nv\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#22345c\"/><stop offset=\"1\" stop-color=\"#101a30\"/></linearGradient></defs><rect width=\"512\" height=\"512\" rx=\"112.64\" fill=\"url(#nv)\"/><g transform=\"translate(44.79999999999998 38.79999999999998) scale(8.8)\"><g filter=\"url(#sh)\"><rect x=\"6\" y=\"15\" width=\"27\" height=\"20\" rx=\"5\" fill=\"#fff\"/><path d=\"M33 21.5 L41.5 17 Q42.5 16.5 42.5 17.6 V32.4 Q42.5 33.5 41.5 33 L33 28.5 Z\" fill=\"#fff\"/></g><circle cx=\"18\" cy=\"25\" r=\"6.4\" fill=\"#14213a\"/><circle cx=\"18\" cy=\"25\" r=\"3.4\" fill=\"url(#yl)\"/><path d=\"M33 40 L39 46 L49 32\" fill=\"none\" stroke=\"#fff\" stroke-width=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#sh)\"/><path d=\"M33 40 L39 46 L49 32\" fill=\"none\" stroke=\"url(#og)\" stroke-width=\"5.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g></svg>"};
/* full = square corners (iPhone); mask = square, drawing at 80% (Android round/maskable icons) */
const full = svg => svg.replace('rx="112.64"','rx="0"');
const mask = svg => full(svg).replace(/<g transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)">/, (m,tx,ty,s)=>`<g transform="translate(${(256-(256-tx)*0.8).toFixed(2)} ${(256-(256-ty)*0.8).toFixed(2)}) scale(${(s*0.8).toFixed(4)})">`);
const SVG={}; for(const [k,v] of Object.entries(BASE)){ SVG[k]=v; SVG[k+'-full']=full(v); SVG[k+'-mask']=mask(v); }
const JOBS=[["vctips", "icons/icon-192.png", 192], ["vctips", "icons/icon-512.png", 512], ["vctips-full", "icons/apple-touch-icon.png", 180], ["vctips-mask", "icons/maskable-512.png", 512], ["vctips", "icons/favicon-32.png", 32]];
(async()=>{ const b=await chromium.launch(); const p=await b.newPage();
  for(const [svgKey,out,size] of JOBS){
    const svg=SVG[svgKey];
    if(out.endsWith('.svg')){ fs.writeFileSync(out, svg); continue; }
    await p.setViewportSize({width:size,height:size});
    await p.setContent(`<html><body style="margin:0;background:transparent"><img id="i" width="${size}" height="${size}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
    await p.waitForFunction(()=>document.getElementById('i').complete);
    fs.mkdirSync(path.dirname(out)||'.',{recursive:true});
    await p.screenshot({path:out, omitBackground:true, clip:{x:0,y:0,width:size,height:size}});
    console.log('wrote', out);
  }
  await b.close(); })();
