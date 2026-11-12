(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MilMillas=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const BONUS={viajeCompleto:400,tk:300,seguridades:100,bonus4seguridades:300,viajeSeguro:300,bloqueo:500,accionDemorada:300,alargue:200};
const BOOL=['viajeCompleto','tk','bonus4seguridades','viajeSeguro','bloqueo','accionDemorada','alargue'];
function bool(v){return v===true||v===1||v==='true'||v==='on';}
function int(v){if(v===undefined||v===null||v==='')return 0;const n=Number(v);if(!Number.isInteger(n))throw Error('Se requiere un número entero');return n;}
function score(name,raw,strict){const out={};const miles=int(raw[name+'_recorrido']);const safeties=int(raw[name+'_seguridades']);if(miles<0||miles>1000||miles%25!==0)throw Error(name+': recorrido inválido');if(safeties<0||safeties>4)throw Error(name+': seguridades inválidas');out[name+'_recorrido']=miles;out[name+'_seguridades']=safeties;for(const key of BOOL)out[name+'_'+key]=bool(raw[name+'_'+key]);if(strict&&out[name+'_bonus4seguridades']&&safeties!==4)throw Error(name+': el bonus de cuatro seguridades requiere cuatro seguridades');if(strict&&out[name+'_viajeCompleto']&&miles!==1000)throw Error(name+': viaje completo requiere 1000 millas');let points=miles+safeties*100;for(const key of BOOL)if(out[name+'_'+key])points+=BONUS[key];out[name+'_puntos']=points;return out;}
function hand(players,raw,strict){const out={};for(const name of players)Object.assign(out,score(name,raw,strict));return out;}
function totals(game){const t=Object.fromEntries(game.participantes.map(n=>[n,0]));for(const h of game.manos||[])for(const n of game.participantes)t[n]+=Number(h[n+'_puntos']||0);return t;}
function winner(game){const t=totals(game),max=Math.max(0,...Object.values(t));return max>=5000?Object.keys(t).filter(n=>t[n]===max):[];}
return {BONUS,BOOL,bool,int,score,hand,totals,winner};
});