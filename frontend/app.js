// 🧠 CONFIGURACIÓN INTELIGENTE DE API_URL

function getApiUrl() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🔍 Detectando entorno...');
  console.log('   - Hostname:', hostname);
  console.log('   - Port:', port);
  
  // Caso 1: Desarrollo local directo (archivo abierto localmente)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🏠 Entorno: Desarrollo local 1');
      return 'http://localhost:3000';
  }
  
  // Caso 2: Producción en cluster (con LoadBalancer o Ingress)
  if (hostname.includes('.com') || hostname.includes('.net')) {
      console.log('🌍 Entorno: Producción');
      return `https://${hostname}/api`;  // Tu dominio de producción
  }
  
  // Caso 3: Testing/Staging (IP del cluster o dominio temporal)
  console.log('🧪 Entorno: Testing/Staging');
  return `http://${hostname}:3001`;  // Asume que backend está en puerto 3001
}

// Usar la función
const API_URL = getApiUrl();
console.log('🔧 API_URL seleccionada:', API_URL);

async function cargarComentarios() {
  const res = await fetch(`${API_URL}/comentarios`);
  const datos = await res.json();
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  datos.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.autor} dijo: ${c.mensaje}`;
    lista.appendChild(li);
  });
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const autor = document.getElementById('autor').value;
  const mensaje = document.getElementById('mensaje').value;
  await fetch(`${API_URL}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autor, mensaje })
  });
  document.getElementById('autor').value = '';
  document.getElementById('mensaje').value = '';
  cargarComentarios();
});

// Cargar comentarios al iniciar
cargarComentarios();

