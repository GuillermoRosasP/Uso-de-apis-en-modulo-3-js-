// ===============================
// 🧠 Pokédex con detección de tipo/abilidad en la búsqueda
// - Paso 1: Obtener Pokémon según paginación, nombre, tipo o habilidad
// - Paso 2: Mostrar tarjetas con más información
// - Paso 3: Colorear tarjeta por tipo principal
// - Paso 4: Paginación y deshabilitación de botones
// ===============================

// Paso 1: Referencias al DOM
const contenedor = document.getElementById('pokemonContainer');  // Contenedor de tarjetas
const btnPrev   = document.getElementById('Anterior');          // Botón Anterior
const btnNext   = document.getElementById('Siguiente');         // Botón Siguiente
const form      = document.getElementById('searchForm');        // Formulario búsqueda
const input     = document.getElementById('searchInput');       // Input búsqueda

// Paso 2: Variables globales
let offset = 0;                             // Desplazamiento para paginación
const limit = 20;                           // Pokémon por página
const API    = 'https://pokeapi.co/api/v2'; // Base de la API

// Paso 3: Función central para obtener datos según contexto
async function obtenerPokemones(query = '') {
  // No limpiamos aún: necesitamos saber si hay datos o error
  contenedor.innerHTML = 'Cargando…';

  // Helper: intenta fetch y devuelve JSON o lanza
  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  }

  try {
    let detalles = [];

    // 3.1 Intento como tipo
    try {
      const dataType = await fetchJson(`${API}/type/${query.toLowerCase()}`);
      // dataType.pokemon es un array de { pokemon: { name, url } }
      detalles = await Promise.all(
        dataType.pokemon.map(p => fetchJson(p.pokemon.url))
      );
      return detalles;
    } catch {
      // No era un tipo válido: seguimos
    }

    // 3.2 Intento como habilidad
    try {
      const dataAbility = await fetchJson(`${API}/ability/${query.toLowerCase()}`);
      detalles = await Promise.all(
        dataAbility.pokemon.map(p => fetchJson(p.pokemon.url))
      );
      return detalles;
    } catch {
      // Tampoco era habilidad: seguimos
    }

    // 3.3 Intento por nombre o paginación
    if (query) {
      // Nombre o ID
      const single = await fetchJson(`${API}/pokemon/${query.toLowerCase()}`);
      return [ single ];
    } else {
      // Paginación normal
      const pageData = await fetchJson(`${API}/pokemon?limit=${limit}&offset=${offset}`);
      detalles = await Promise.all(
        pageData.results.map(p => fetchJson(p.url))
      );
      return detalles;
    }

  } catch (error) {
    // Si llegamos aquí, ninguna ruta funcionó
    console.error('Error al buscar:', error);
    contenedor.innerHTML = `<p style="color:red;">
      No se encontraron resultados para “${query}”
    </p>`;
    return null; // Indicamos fallo
  }
}

// Paso 4: Crear una tarjeta con info extendida y color por tipo
function crearTarjeta(pokemon) {
  const card = document.createElement('div');                 // Creamos div
  const tipo = pokemon.types[0].type.name;                    // Tipo principal
  card.className = `pokemon-card ${tipo}`;                    // Clase para color

  card.innerHTML = `
    <h3>${pokemon.name.toUpperCase()}</h3>
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
    <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
    <p><strong>Altura:</strong> ${pokemon.height}</p>
    <p><strong>Peso:</strong> ${pokemon.weight}</p>
    <p><strong>Habilidades:</strong> ${pokemon.abilities.map(h => h.ability.name).join(', ')}</p>
  `;
  contenedor.appendChild(card);                                // Insertamos en DOM
}

// Paso 5: Mostrar lista de Pokémon y controlar botones
async function mostrarPokemones(query = '') {
  const lista = await obtenerPokemones(query);               // Obtenemos datos
  if (!Array.isArray(lista)) return;                         // Si hubo error, salimos

  contenedor.innerHTML = '';                                 // Limpiamos contenedor
  lista.forEach(p => crearTarjeta(p));                       // Renderizamos tarjetas

  // Deshabilitar botones solo en modo paginación
  btnPrev.disabled  = offset === 0;
  btnNext.disabled  = lista.length < limit; // Si recibes menos de limit, ya no hay más
}

// Paso 6: Eventos paginación
btnPrev.addEventListener('click', () => {
  if (offset >= limit) {
    offset -= limit;
    mostrarPokemones();
  }
});
btnNext.addEventListener('click', () => {
  offset += limit;
  mostrarPokemones();
});

// Paso 7: Evento búsqueda avanzada
form.addEventListener('submit', e => {
  e.preventDefault();
  const txt = input.value.trim();
  if (!txt) return mostrarPokemones();                      // Vacío = volver a paginar
  mostrarPokemones(txt);                                    // Buscamos nombre, tipo o habilidad
});

// Paso 8: Carga inicial
mostrarPokemones();
