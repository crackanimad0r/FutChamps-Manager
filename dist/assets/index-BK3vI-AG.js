(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&i(d)}).observe(document,{childList:!0,subtree:!0});function a(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(t){if(t.ep)return;t.ep=!0;const r=a(t);fetch(t.href,r)}})();const m={admin123:{role:"super",target:"all"},MarioSharks:{role:"team",target:"sharc"},RoyalCocodrilesadmin:{role:"team",target:"royal cocodriles"}};let n=null,s=JSON.parse(localStorage.getItem("futchamps_db_v2"))||{equipos:[]};function c(){localStorage.setItem("futchamps_db_v2",JSON.stringify(s)),f()}window.login=function(){const o=prompt("Usuario:");o&&(m[o]?(n={name:o,...m[o]},document.body.classList.add("is-admin"),n.role==="super"&&(document.body.classList.add("is-super-admin"),document.getElementById("superAdminPanel").style.display="block"),document.getElementById("loginBtn").classList.add("hidden"),document.getElementById("userBadge").innerText=o,f()):alert("Usuario no reconocido"))};window.logout=function(){location.reload()};window.openSyncModal=function(){document.getElementById("modalOverlay").style.display="flex"};window.closeSyncModal=function(){document.getElementById("modalOverlay").style.display="none"};window.generateBookmarklet=function(){const o=document.getElementById("syncDataInput");o.value=`INSTRUCCIONES:
1. Ve a la pestaña 'Clasificación' en CopaFacil.
2. Pulsa Ctrl+A (seleccionar todo) y Ctrl+C (copiar).
3. Borra este texto y pega lo copiado aquí.
4. Pulsa 'Procesar Sincronización'.`,alert("Sigue las instrucciones en el cuadro de texto.")};window.processSync=function(){const o=document.getElementById("syncDataInput").value;if(!o||o.startsWith("INSTRUCCIONES"))return;const e=o.split(`
`).map(t=>t.trim()).filter(t=>t.length>2),a=["INICIO","CLASIFICACIÓN","RANKINGS","FOTOS","LOUNGE","HACER LOGIN","DONE","CLOSE"];let i=0;if(e.forEach((t,r)=>{if(a.some(u=>t.toUpperCase().includes(u))||t.includes("{")||t.includes("function"))return;const d=e[r+1]&&/^\d+$/.test(e[r+1]);if(t.length<40&&(d||t.toUpperCase()===t)){let u=t;s.equipos.find(g=>g.nombre.toLowerCase()===u.toLowerCase())||(s.equipos.push({id:Date.now()+Math.random(),nombre:u,victorias:0,partidos:0,dinero:1e3,jugadores:[]}),i++)}}),i===0){const t=["SHARC","SHARK","COCODRIL","REAL","FC","CLUB"];e.forEach(r=>{t.some(d=>r.toUpperCase().includes(d))&&(s.equipos.find(l=>l.nombre.toLowerCase()===r.toLowerCase())||(s.equipos.push({id:Date.now()+Math.random(),nombre:r,victorias:0,partidos:0,dinero:1e3,jugadores:[]}),i++))})}c(),alert("Sincronización finalizada. Se han añadido/actualizado equipos basados en el texto pegado."),closeSyncModal()};function p(o){return n?n.role==="super"?!0:n.role==="team"?o.toLowerCase().includes(n.target):!1:!1}window.addTeam=function(){if((n==null?void 0:n.role)!=="super")return alert("Solo Super Admin puede crear equipos");const o=document.getElementById("newTeamName").value.trim();o&&(s.equipos.push({id:Date.now(),nombre:o,victorias:0,partidos:0,dinero:1e3,jugadores:[]}),document.getElementById("newTeamName").value="",c())};window.addPlayer=function(o){const e=s.equipos.find(t=>t.id===o);if(!p(e.nombre))return alert("No tienes permisos para este equipo");const a=prompt("Nombre del Jugador:");if(!a)return;const i=prompt("Posición (POR, DEF, CEN, DEL):").toUpperCase();if(!["POR","DEF","CEN","DEL"].includes(i))return alert("Posición inválida");e.jugadores.push({id:Date.now(),nombre:a,pos:i,grl:0,valor:0}),c()};window.editPlayerGRL=function(o,e){const a=s.equipos.find(r=>r.id===o);if(!p(a.nombre))return alert("No tienes permisos para este equipo");const i=parseInt(prompt("Nuevo GRL (0-99):"));if(isNaN(i)||i<0||i>99)return alert("GRL inválido");const t=a.jugadores.find(r=>r.id===e);t.grl=i,t.valor=(Math.pow(i,2.5)/150).toFixed(1),c()};window.editTeamMoney=function(o){const e=s.equipos.find(i=>i.id===o);if(!p(e.nombre))return alert("No tienes permisos para este equipo");const a=parseInt(prompt(`Actual: ${e.dinero}M. ¿Cuánto quieres sumar/restar?`));isNaN(a)||(e.dinero+=a,c())};window.registerMatch=function(o,e){const a=s.equipos.find(r=>r.id===o);if(!p(a.nombre))return alert("No tienes permisos para este equipo");a.partidos++;const i=a.jugadores.length>0?a.jugadores.reduce((r,d)=>r+d.grl,0)/a.jugadores.length:0;let t=50;e?(a.victorias++,t+=100):t+=20,t+=Math.round(i*.5),a.dinero+=t,alert(`${a.nombre} ha ganado ${t}M por el partido.`),c()};window.deletePlayer=function(o,e){const a=s.equipos.find(i=>i.id===o);if(!p(a.nombre))return alert("No tienes permisos para este equipo");confirm("¿Eliminar jugador?")&&(a.jugadores=a.jugadores.filter(i=>i.id!==e),c())};window.exportJSON=function(){if((n==null?void 0:n.role)!=="super")return;const o="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(s)),e=document.createElement("a");e.setAttribute("href",o),e.setAttribute("download","futchamps_data_"+new Date().toISOString().split("T")[0]+".json"),e.click()};window.importJSON=function(o){if((n==null?void 0:n.role)!=="super")return;const e=o.target.files[0];if(!e)return;const a=new FileReader;a.onload=i=>{s=JSON.parse(i.target.result),c(),alert("Datos sincronizados")},a.readAsText(e)};function f(){const o=document.getElementById("leagueGrid");o&&(o.innerHTML="",s.equipos.forEach((e,a)=>{const i=e.partidos>0?(e.victorias/e.partidos*100).toFixed(0):0,t=e.jugadores.length>0?Math.round(e.jugadores.reduce((l,u)=>l+u.grl,0)/e.jugadores.length):0,r=p(e.nombre),d=`
            <div class="glass rounded-[3rem] p-8 premium-card animate-fade ${r?"border-blue-500/30":""}" style="animation-delay: ${a*.1}s">
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <h2 class="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">${e.nombre}</h2>
                        <div class="flex gap-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-slate-500 font-black uppercase">Balance</span>
                                <span class="text-xl font-black text-emerald-500 ${r?"cursor-pointer hover:text-emerald-400":""}" 
                                      onclick="${r?`editTeamMoney(${e.id})`:""}">${e.dinero}M</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-slate-500 font-black uppercase">Win Rate</span>
                                <span class="text-xl font-black text-blue-500">${i}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center bg-white/5 border border-white/10 px-6 py-3 rounded-3xl">
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">GRL Promedio</span>
                        <span class="text-3xl font-black ${t>0?"text-white":"text-slate-600"}">${t}</span>
                    </div>
                </div>

                <div class="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                    ${e.jugadores.length===0?`
                        <div class="text-center py-10 border-2 border-dashed border-slate-800 rounded-3xl">
                            <p class="text-xs font-bold text-slate-600 uppercase tracking-widest">Sin Jugadores</p>
                        </div>
                    `:e.jugadores.map(l=>`
                        <div class="glass bg-white/5 p-4 rounded-2xl border-white/5 flex justify-between items-center group">
                            <div class="flex items-center gap-4">
                                <div class="pos-badge pos-${l.pos}">${l.pos}</div>
                                <div>
                                    <p class="text-sm font-black text-white">${l.nombre}</p>
                                    <p class="text-[9px] text-slate-500 font-bold uppercase">VALOR: ${l.valor}M</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right">
                                    <p class="text-xs font-black text-slate-200 ${r?"cursor-pointer hover:text-blue-400":""} p-1" 
                                       onclick="${r?`editPlayerGRL(${e.id}, ${l.id})`:""}">GRL ${l.grl}</p>
                                </div>
                                ${r?`<button onclick="deletePlayer(${e.id}, ${l.id})" class="opacity-20 hover:opacity-100 hover:text-red-500 transition-all font-black text-lg">×</button>`:""}
                            </div>
                        </div>
                    `).join("")}
                </div>

                ${r?`
                    <div class="mt-auto border-t border-white/10 pt-6 space-y-3">
                        <button onclick="addPlayer(${e.id})" class="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">Añadir Jugador</button>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="registerMatch(${e.id}, true)" class="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Victoria</button>
                            <button onclick="registerMatch(${e.id}, false)" class="bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Derrota</button>
                        </div>
                    </div>
                `:`
                    <div class="mt-auto border-t border-white/5 pt-4 text-center">
                        <p class="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Solo Lectura</p>
                    </div>
                `}
            </div>
        `;o.innerHTML+=d}))}document.addEventListener("DOMContentLoaded",f);
