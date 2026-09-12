export function MapaHTML(lat: number, lon: number, logo: string, nomeUsuario: string, fotoUrl: string, isDark: boolean): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <style>
        :root { 
            --bg: #ffffff; 
            --text: #1c1c1e; 
            --brd: #f2f2f7; 
            --blue: #007AFF;
            --blue-white: #3788de; 
            --text-sec: #8e8e93; 
            --green: #34C759;
            --shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        body.dark-theme { 
            --bg: #1c1c1e; 
            --text: #f2f2f7; 
            --brd: #2c2c2e; 
            --text-sec: #8e8e93; 
        }
        
        body { margin:0; padding:0; overflow:hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); }
        #map { height:100vh; width:100vw; z-index: 1; transition: filter 0.5s; }
        body.dark-theme #map { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        
        #logo { position:absolute; bottom:20px; left:10px; z-index:1000; pointer-events: none; }
        #logo img { width:60px; height:60px; opacity: 0.9; }
        
        #top-bar { position: absolute; top: 40px; left: 15px; right: 15px; z-index: 2000; display: flex; gap: 8px; }
        #search-container { flex-grow: 1; position: relative; background: var(--bg); border-radius: 12px; box-shadow: var(--shadow); display: flex; align-items: center; padding: 0 12px; height: 40px; border: 1px solid var(--brd); }
        #search-input { width: 100%; border: none; background: transparent; color: var(--text); font-size: 14px; outline: none; }
        #search-results { position: absolute; top: 45px; left: 0; right: 0; background: var(--bg); border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); max-height: 200px; overflow-y: auto; display: none; z-index: 2100; border: 1px solid var(--brd); }
        
        #menu-btn { background: var(--blue-white); color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow); cursor: pointer; font-size: 18px; }
        
        #sidebar { 
            position: fixed; top: 15px; right: 15px; bottom: 15px; width: 280px; 
            background: var(--bg); box-shadow: -5px 0 25px rgba(0,0,0,0.15); z-index: 3000; 
            display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
            border-radius: 25px; overflow: hidden; border: 1px solid var(--brd);
        }
        .hidden { transform: translateX(120%); }

        .sidebar-header { display: flex; flex-direction: column; align-items: center; padding: 30px 20px 20px; border-bottom: 1px solid var(--brd); position: relative; }
        .profile-img-container { width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--blue); overflow: hidden; margin-bottom: 12px; background: #eee; cursor: pointer; }
        .profile-img-container img { width: 100%; height: 100%; object-fit: cover; }
        .sidebar-header h2 { margin: 0; font-size: 16px; font-weight: 800; color: var(--text); text-transform: uppercase; }

        .menuItem { margin: 12px 18px 0; padding: 18px 20px; border-radius: 16px; background: rgba(128,128,128,0.06); cursor: pointer; font-weight: 700; font-size: 15px; transition: 0.2s; border: 1px solid transparent; }
        .menuItem:active { background: rgba(0, 122, 255, 0.1); transform: scale(0.98); border-color: var(--blue); }
        
        #overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 2500; display: none; backdrop-filter: blur(3px); }
        
        .modal-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-height: 75%; background: var(--bg); z-index: 5000; border-radius: 20px; padding: 20px; display: none; flex-direction: column; box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
        .modal-header { display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--brd); padding-bottom: 12px; margin-bottom: 10px; }
        .modal-header h3 { margin: 0; font-size: 18px; }

        .boat-item { 
            padding: 12px 5px; margin-bottom: 5px; background: var(--bg); border-bottom: 1px solid var(--brd);
            display: flex; justify-content: space-between; align-items: center; transition: 0.2s;
        }
        .boat-item:active { background: rgba(128,128,128,0.05); }
        .boat-info-main { display: flex; flex-direction: column; gap: 2px; }
        .boat-id-label { font-size: 9px; color: var(--text-sec); font-weight: 700; letter-spacing: 0.5px; }
        .boat-id-value { font-size: 16px; font-weight: 800; }
        .boat-status-badge { padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; background: rgba(0,122,255,0.1); color: var(--blue); }

        .info-box { background: rgba(128,128,128,0.04); border: 1px solid var(--brd); padding: 14px; border-radius: 12px; margin-bottom: 10px; }
        .info-box small { font-size: 10px; font-weight: 700; color: var(--text-sec); text-transform: uppercase; display: block; margin-bottom: 4px; }
        .info-box span { font-size: 15px; font-weight: 600; }

        #locationBtn, #north { position: absolute; right: 15px; background: var(--bg); border-radius: 10px; box-shadow: var(--shadow); z-index: 1000; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid var(--brd); }
        #locationBtn { bottom: 70px; font-size: 16px; }
        #north { bottom: 25px; font-size: 12px; font-weight: 800; color: #d32f2f; }
        
        .suggestion-item { padding: 12px; border-bottom: 1px solid var(--brd); cursor: pointer; display: flex; justify-content: space-between; font-size: 14px; }
    </style>
    </head>
    <body class="${isDark ? 'dark-theme' : ''}">
        <div id="top-bar">
            <div id="search-container">
                <input type="text" id="search-input" placeholder="Buscar embarcação..." oninput="buscarBarcoSugestoes(this.value)">
                <div id="search-results"></div>
            </div>
            <div id="menu-btn" onclick="abrirMenu()">☰</div>
        </div>

        <div id="overlay" onclick="fecharMenu(); fecharTodosModais();"></div>

        <div id="sidebar" class="hidden">
            <div class="sidebar-header">
                <div style="position:absolute; top:15px; right:15px;" onclick="fecharMenu()">✕</div>
                <div class="profile-img-container" onclick="window.ReactNativeWebView.postMessage('trocarFoto')">
                    <img id="user-photo" src="${fotoUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}">
                </div>
                <h2 id="user-name">${nomeUsuario || 'USUÁRIO'}</h2>
            </div>
            <div class="menuItem" onclick="abrirAvisos()">Avisos Importantes</div>
            <div class="menuItem" onclick="abrirEmbarcacoes()">Minha Frota</div>
            <div class="menuItem" onclick="abrirConfiguracoes()">Configurações</div>
            <div class="menuItem" onclick="abrirSugestoes()">Informações</div>
            <div class="menuItem" onclick="acessarConta()" style="color:#d32f2f; margin-top:12px;">Sair da Conta</div>
            <div style="margin-top: auto; padding: 25px; text-align: center; color:var(--text-sec); font-size: 9px; letter-spacing: 1px; font-weight:700;">
                PROJETO BANZERO - BY IGOR ZWANG
            </div>
        </div>

        <div id="modalEmbarcacoes" class="modal-container">
            <div class="modal-header"><h3>Frota</h3><span onclick="fecharTodosModais()" style="font-size:24px;">&times;</span></div>
            <div id="listaConteudo" style="overflow-y:auto; margin-top:10px; padding-bottom:10px;"></div>
        </div>
        
        <div id="modalAvisos" class="modal-container">
            <div class="modal-header"><h3>Avisos</h3><span onclick="fecharTodosModais()" style="font-size:24px;">&times;</span></div>
            <div style="margin-top:10px;">
                <div class="info-box" style="border-left: 4px solid var(--blue);">
                    <small style="color:var(--blue);">Monitoramento</small>
                    <span>GPS operacional - Coordenadas sendo enviadas normalmente.</span>
                </div>
                <div class="info-box" style="border-left: 4px solid var(--green);">
                    <small style="color:var(--green);">Clima</small>
                    <span>Sem previsão de chuvas na região amazônica.</span>
                </div>
            </div>
        </div>

        <div id="modalConfig" class="modal-container">
            <div class="modal-header"><h3>Ajustes</h3><span onclick="fecharTodosModais()" style="font-size:24px;">&times;</span></div>
            <div style="padding:15px; background:rgba(128,128,128,0.05); border-radius:15px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b style="display:block;">Modo Escuro</b>
                    <small style="color:var(--text-sec);">Altera o visual do mapa e menus</small>
                </div>
                <input type="checkbox" id="theme-toggle" onclick="toggleDark()" style="width:22px; height:22px;" ${isDark ? 'checked' : ''}>
            </div>
        </div>

        <div id="modalContato" class="modal-container">
            <div class="modal-header"><h3>Suporte</h3><span onclick="fecharTodosModais()" style="font-size:24px;">&times;</span></div>
            <div style="margin-top:10px;">
                    <div class="info-box" style="border-left: 4px solid var(--blue); cursor: pointer;">
                        <small style="color:var(--blue);">Instagram</small>
                        <span>@projeto.banzero</span>
                    </div>
                    <div class="info-box" style="border-left: 4px solid var(--green); cursor: pointer;">
                        <small style="color:var(--green);">E-mail</small>
                        <span>projeto.banzero@gmail.com</span>
                    </div>
            </div>
        </div>

        <div id="map"></div>
        <div id="logo"><img src="${logo}"></div>
        <div id="locationBtn">📍</div>
        <div id="north">N</div>

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            var userPos = [${lat}, ${lon}], frota = {}, dadosBarcosCache = [];
            var map = L.map('map', { zoomControl: false, attributionControl: false }).setView(userPos, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker(userPos).addTo(map).bindPopup("Sua Localização");
            
            var boatIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/3176/3176485.png', iconSize: [35, 35], iconAnchor: [17, 17], popupAnchor: [0, -15] });

            function formatarTempo(ts) {
                if (!ts) return "---";
                const agora = Date.now(), dif = Math.floor((agora - ts) / 1000);
                if (dif < 60) return "Agora";
                if (dif < 3600) return Math.floor(dif / 60) + " min atrás";
                return new Date(ts).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
            }

            window.atualizarFrota = function(json) {
                dadosBarcosCache = JSON.parse(json);
                dadosBarcosCache.forEach(function(b) {
                    var p = [b.latitude, b.longitude];
                    var t = formatarTempo(b.timestamp);
                    var c = (Date.now() - b.timestamp > 300000) ? '#d32f2f' : '#34C759';
                    
                    var html = \`
                        <div style="min-width:160px; font-family: sans-serif; padding: 5px;">
                            <b style="font-size:14px; color:var(--blue);">ID: \${b.id}</b><br>
                            <small style="color:\${c}; font-weight:700;">● \${t}</small>
                            <hr style="border:0; border-top:1px solid #eee; margin:8px 0;">
                            <div style="font-size:11px; line-height:1.4;">
                                <b>Latitude:</b> \${b.latitude.toFixed(5) || 0}<br>
                                <b>Longitude:</b> \${b.longitude.toFixed(5) || 0}<br>
                                <b>Sinal:</b> \${b.satelites || 0} 🛰️<br>
                                <b>Velocidade:</b> \${b.velocidade || 0} km/h<br>
                            </div>
                        </div>\`;

                    if (frota[b.id]) {
                        frota[b.id].setLatLng(p).setPopupContent(html);
                    } else {
                        frota[b.id] = L.marker(p, { icon: boatIcon }).addTo(map).bindPopup(html);
                    }
                });
            };

            window.buscarBarcoSugestoes = function(v) {
                const res = document.getElementById("search-results");
                if(!v.trim()){ res.style.display="none"; return; }
                const fits = dadosBarcosCache.filter(b => b.id.toString().includes(v));
                res.innerHTML = fits.map(b => \`<div class="suggestion-item" onclick="focar('\${b.id}',\${b.latitude},\${b.longitude})"><span>#\${b.id}</span> <span>➔</span></div>\`).join('');
                res.style.display = fits.length ? "block" : "none";
            };

            window.focar = function(id, lt, ln) {
                document.getElementById("search-results").style.display="none";
                map.flyTo([lt, ln], 17);
                setTimeout(() => { if(frota[id]) frota[id].openPopup(); }, 800);
            };

            window.abrirMenu = () => { document.getElementById("sidebar").classList.remove("hidden"); document.getElementById("overlay").style.display = "block"; };
            window.fecharMenu = () => { document.getElementById("sidebar").classList.add("hidden"); document.getElementById("overlay").style.display = "none"; };
            window.fecharTodosModais = () => { document.querySelectorAll('.modal-container').forEach(m => m.style.display = 'none'); document.getElementById("overlay").style.display = "none"; };
            
            window.abrirAvisos = () => { fecharMenu(); mostrar("modalAvisos"); };
            window.abrirConfiguracoes = () => { fecharMenu(); mostrar("modalConfig"); };
            window.abrirSugestoes = () => { fecharMenu(); mostrar("modalContato"); };
            window.abrirEmbarcacoes = () => {
                fecharMenu();
                const cont = document.getElementById("listaConteudo");
                cont.innerHTML = dadosBarcosCache.map(b => {
                    const isOnline = (Date.now() - b.timestamp < 300000);
                    const statusTexto = isOnline ? "ATIVO" : "OFFLINE";
                    const statusCor = isOnline ? "var(--green)" : "#d32f2f";
                    return \`
                        <div class="boat-item" onclick="focar('\${b.id}',\${b.latitude},\${b.longitude});fecharTodosModais();">
                            <div class="boat-info-main">
                                <span class="boat-id-label">EMBARCAÇÃO</span>
                                <span class="boat-id-value">#\${b.id}</span>
                                <div style="display:flex; align-items:center; gap:5px; margin-top:2px;">
                                    <div style="width:6px; height:6px; border-radius:50%; background:\${statusCor}"></div>
                                    <span style="font-size:11px; color:\${statusCor}; font-weight:700;">\${statusTexto}</span>
                                </div>
                            </div>
                            <div class="boat-status-badge">RASTREAR ➔</div>
                        </div>\`;
                }).join('') || "<p style='text-align:center; padding:20px; color:#999;'>Nenhum barco na frota.</p>";
                mostrar("modalEmbarcacoes");
            };

            function mostrar(id){ document.getElementById(id).style.display="flex"; document.getElementById("overlay").style.display="block"; }
            
            window.toggleDark = () => {
                const dark = document.body.classList.toggle('dark-theme');
                window.ReactNativeWebView.postMessage(dark ? "temaEscuro" : "temaClaro");
            };

            window.acessarConta = () => window.ReactNativeWebView.postMessage("logout");
            document.getElementById("locationBtn").onclick = () => map.flyTo(userPos, 15);
        </script>
    </body>
</html>
`;
}