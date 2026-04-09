import './style.css';

// Roles Configuration
const USERS = {
    "admin123": { role: "super", target: "all" },
    "MarioSharks": { role: "team", target: "sharc" },
    "RoyalCocodrilesadmin": { role: "team", target: "royal cocodriles" }
};

let currentUser = null;

// Database Initialization
let db = JSON.parse(localStorage.getItem('futchamps_db_v2')) || {
    equipos: []
};

function save() {
    localStorage.setItem('futchamps_db_v2', JSON.stringify(db));
    render();
}

// --- AUTH ---
window.login = function () {
    const user = prompt("Usuario:");
    if (!user) return;

    if (USERS[user]) {
        currentUser = { name: user, ...USERS[user] };
        document.body.classList.add('is-admin');
        if (currentUser.role === 'super') {
            document.body.classList.add('is-super-admin');
            document.getElementById('superAdminPanel').style.display = 'block';
        }
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('userBadge').innerText = user;
        render();
    } else {
        alert("Usuario no reconocido");
    }
};

window.logout = function () { location.reload(); };

// --- SYNC MODAL ---
window.openSyncModal = function () { document.getElementById('modalOverlay').style.display = 'flex'; };
window.closeSyncModal = function () { document.getElementById('modalOverlay').style.display = 'none'; };

window.generateBookmarklet = function () {
    // Simplificado a instrucciones
    const textArea = document.getElementById('syncDataInput');
    textArea.value = "INSTRUCCIONES:\n1. Ve a la pestaña 'Clasificación' en CopaFacil.\n2. Pulsa Ctrl+A (seleccionar todo) y Ctrl+C (copiar).\n3. Borra este texto y pega lo copiado aquí.\n4. Pulsa 'Procesar Sincronización'.";
    alert("Sigue las instrucciones en el cuadro de texto.");
};

window.processSync = function () {
    const input = document.getElementById('syncDataInput').value;
    if (!input || input.startsWith("INSTRUCCIONES")) return;

    // Heurística de detección de equipos
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const forbidden = ["INICIO", "CLASIFICACIÓN", "RANKINGS", "FOTOS", "LOUNGE", "HACER LOGIN", "DONE", "CLOSE"];

    let squadsFound = 0;

    lines.forEach((line, i) => {
        if (forbidden.some(f => line.toUpperCase().includes(f))) return;
        if (line.includes("{") || line.includes("function")) return;

        const nextLineIsStats = lines[i + 1] && /^\d+$/.test(lines[i + 1]);
        const isLikelyTeam = line.length < 40 && (nextLineIsStats || line.toUpperCase() === line);

        if (isLikelyTeam) {
            let name = line;
            let existing = db.equipos.find(e => e.nombre.toLowerCase() === name.toLowerCase());
            if (!existing) {
                db.equipos.push({
                    id: Date.now() + Math.random(),
                    nombre: name,
                    victorias: 0,
                    partidos: 0,
                    dinero: 1000,
                    jugadores: []
                });
                squadsFound++;
            }
        }
    });

    if (squadsFound === 0) {
        const keywords = ["SHARC", "SHARK", "COCODRIL", "REAL", "FC", "CLUB"];
        lines.forEach(line => {
            if (keywords.some(k => line.toUpperCase().includes(k))) {
                let existing = db.equipos.find(e => e.nombre.toLowerCase() === line.toLowerCase());
                if (!existing) {
                    db.equipos.push({
                        id: Date.now() + Math.random(),
                        nombre: line,
                        victorias: 0,
                        partidos: 0,
                        dinero: 1000,
                        jugadores: []
                    });
                    squadsFound++;
                }
            }
        });
    }

    save();
    alert(`Sincronización finalizada. Se han añadido/actualizado equipos basados en el texto pegado.`);
    closeSyncModal();
};

// --- PERMISSION CHECK ---
function canManage(teamName) {
    if (!currentUser) return false;
    if (currentUser.role === 'super') return true;
    if (currentUser.role === 'team') {
        return teamName.toLowerCase().includes(currentUser.target);
    }
    return false;
}

// --- LOGIC ---
window.addTeam = function () {
    if (currentUser?.role !== 'super') return alert("Solo Super Admin puede crear equipos");
    const name = document.getElementById('newTeamName').value.trim();
    if (!name) return;
    db.equipos.push({ id: Date.now(), nombre: name, victorias: 0, partidos: 0, dinero: 1000, jugadores: [] });
    document.getElementById('newTeamName').value = '';
    save();
};

window.addPlayer = function (teamId) {
    const team = db.equipos.find(e => e.id === teamId);
    if (!canManage(team.nombre)) return alert("No tienes permisos para este equipo");
    const nombre = prompt("Nombre del Jugador:");
    if (!nombre) return;
    const pos = prompt("Posición (POR, DEF, CEN, DEL):").toUpperCase();
    if (!['POR', 'DEF', 'CEN', 'DEL'].includes(pos)) return alert("Posición inválida");
    team.jugadores.push({ id: Date.now(), nombre, pos, grl: 0, valor: 0 });
    save();
};

window.editPlayerGRL = function (teamId, playerId) {
    const team = db.equipos.find(e => e.id === teamId);
    if (!canManage(team.nombre)) return alert("No tienes permisos para este equipo");
    const newGrl = parseInt(prompt("Nuevo GRL (0-99):"));
    if (isNaN(newGrl) || newGrl < 0 || newGrl > 99) return alert("GRL inválido");
    const player = team.jugadores.find(p => p.id === playerId);
    player.grl = newGrl;
    player.valor = (Math.pow(newGrl, 2.5) / 150).toFixed(1);
    save();
};

window.editTeamMoney = function (teamId) {
    const team = db.equipos.find(e => e.id === teamId);
    if (!canManage(team.nombre)) return alert("No tienes permisos para este equipo");
    const extra = parseInt(prompt(`Actual: ${team.dinero}M. ¿Cuánto quieres sumar/restar?`));
    if (isNaN(extra)) return;
    team.dinero += extra;
    save();
};

window.registerMatch = function (teamId, win) {
    const team = db.equipos.find(e => e.id === teamId);
    if (!canManage(team.nombre)) return alert("No tienes permisos para este equipo");
    team.partidos++;
    const avgGrl = team.jugadores.length > 0 ? (team.jugadores.reduce((a, b) => a + b.grl, 0) / team.jugadores.length) : 0;
    let earnings = 50;
    if (win) { team.victorias++; earnings += 100; } else { earnings += 20; }
    earnings += Math.round(avgGrl * 0.5);
    team.dinero += earnings;
    alert(`${team.nombre} ha ganado ${earnings}M por el partido.`);
    save();
};

window.deletePlayer = function (tId, pId) {
    const t = db.equipos.find(e => e.id === tId);
    if (!canManage(t.nombre)) return alert("No tienes permisos para este equipo");
    if (!confirm("¿Eliminar jugador?")) return;
    t.jugadores = t.jugadores.filter(p => p.id !== pId);
    save();
};

window.exportJSON = function () {
    if (currentUser?.role !== 'super') return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "futchamps_data_" + new Date().toISOString().split('T')[0] + ".json");
    dl.click();
};

window.importJSON = function (event) {
    if (currentUser?.role !== 'super') return;
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        db = JSON.parse(e.target.result);
        save();
        alert("Datos sincronizados");
    };
    reader.readAsText(file);
};

// --- RENDER ---
function render() {
    const grid = document.getElementById('leagueGrid');
    if (!grid) return;
    grid.innerHTML = '';

    db.equipos.forEach((eq, idx) => {
        const ratio = eq.partidos > 0 ? ((eq.victorias / eq.partidos) * 100).toFixed(0) : 0;
        const totalGrl = eq.jugadores.length > 0 ? Math.round(eq.jugadores.reduce((a, b) => a + b.grl, 0) / eq.jugadores.length) : 0;
        const isManageable = canManage(eq.nombre);

        const teamCard = `
            <div class="glass rounded-[3rem] p-8 premium-card animate-fade ${isManageable ? 'border-blue-500/30' : ''}" style="animation-delay: ${idx * 0.1}s">
                <div class="flex justify-between items-start mb-8">
                    <div>
                        <h2 class="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">${eq.nombre}</h2>
                        <div class="flex gap-4">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-slate-500 font-black uppercase">Balance</span>
                                <span class="text-xl font-black text-emerald-500 ${isManageable ? 'cursor-pointer hover:text-emerald-400' : ''}" 
                                      onclick="${isManageable ? `editTeamMoney(${eq.id})` : ''}">${eq.dinero}M</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-slate-500 font-black uppercase">Win Rate</span>
                                <span class="text-xl font-black text-blue-500">${ratio}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center bg-white/5 border border-white/10 px-6 py-3 rounded-3xl">
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">GRL Promedio</span>
                        <span class="text-3xl font-black ${totalGrl > 0 ? 'text-white' : 'text-slate-600'}">${totalGrl}</span>
                    </div>
                </div>

                <div class="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                    ${eq.jugadores.length === 0 ? `
                        <div class="text-center py-10 border-2 border-dashed border-slate-800 rounded-3xl">
                            <p class="text-xs font-bold text-slate-600 uppercase tracking-widest">Sin Jugadores</p>
                        </div>
                    ` : eq.jugadores.map(p => `
                        <div class="glass bg-white/5 p-4 rounded-2xl border-white/5 flex justify-between items-center group">
                            <div class="flex items-center gap-4">
                                <div class="pos-badge pos-${p.pos}">${p.pos}</div>
                                <div>
                                    <p class="text-sm font-black text-white">${p.nombre}</p>
                                    <p class="text-[9px] text-slate-500 font-bold uppercase">VALOR: ${p.valor}M</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right">
                                    <p class="text-xs font-black text-slate-200 ${isManageable ? 'cursor-pointer hover:text-blue-400' : ''} p-1" 
                                       onclick="${isManageable ? `editPlayerGRL(${eq.id}, ${p.id})` : ''}">GRL ${p.grl}</p>
                                </div>
                                ${isManageable ? `<button onclick="deletePlayer(${eq.id}, ${p.id})" class="opacity-20 hover:opacity-100 hover:text-red-500 transition-all font-black text-lg">×</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${isManageable ? `
                    <div class="mt-auto border-t border-white/10 pt-6 space-y-3">
                        <button onclick="addPlayer(${eq.id})" class="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">Añadir Jugador</button>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="registerMatch(${eq.id}, true)" class="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Victoria</button>
                            <button onclick="registerMatch(${eq.id}, false)" class="bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Derrota</button>
                        </div>
                    </div>
                ` : `
                    <div class="mt-auto border-t border-white/5 pt-4 text-center">
                        <p class="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Solo Lectura</p>
                    </div>
                `}
            </div>
        `;
        grid.innerHTML += teamCard;
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', render);
