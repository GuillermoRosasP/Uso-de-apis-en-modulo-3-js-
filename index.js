//console.log("hola m mundo");

const container = document.getElementById('pokemonContainer');

// Descripción: Este archivo contiene la lógica para obtener y 
// mostrar Pokémon utilizando la API de PokeAPI.
( async () => {
   const limit = 20; // Número de Pokémon a obtener
   let offset = 0; // indica con que pokemon se enpezara, y cambie en const por let para poder modificarlo con los botones 
   const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

   //  1) Función para obtener los Pokémon de la API
   async function getPokemons(){
    try{
        const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    }catch(error){
        console.error('error al obtener los pokémons', error);
        return [];
    }
   }

   // 2) Función para obtener la información de cada Pokémon
   async function getPokemonDetails(pokemonUrl) {
    try{
        const response = await fetch(pokemonUrl);
        const data = await response.json();
        return {
            name: data.name,
            image: data.sprites.front_default,
            types: data.types.map(t => t.type.name)
        }
    }catch(error){
        console.error('Error al obtener los detalles del Pokémon', pokemonUrl, error);
        return null;
    }
   }

// 3) Orquestar ambas funciones y los resultados mostrarlos en consola 
const list = await getPokemons();
const details = await Promise.all(
    list.map(pokemon => getPokemonDetails(pokemon.url) )
)

//paso 4 mostramos en html 
details.forEach(pokemon => {
     if (pokemon) {
       const card = document.createElement('div');
       card.className = 'pokemon-card';
       card.innerHTML = `
         <h3>${pokemon.name.toUpperCase()}</h3>
         <img src="${pokemon.image}" alt="${pokemon.name}" />
         <p><strong>Tipo:</strong> ${pokemon.types.join(', ')}</p>
       `;
       container.appendChild(card);
     }
   });


//paso 5 mostramos en consola los resultados
console.log(' ===== Haciendo llamada a la API =====');
details.forEach(pokemon => {
    if(pokemon){
        console.log(`Nombre: ${pokemon.name.toUpperCase()}`);
        console.log(`Imagen: ${pokemon.image}`);
        console.log(`Tipos: ${pokemon.types.join(', ')}`);
        console.log('-------------------');
    }
})
})()








// let CurrentPage = 1; // Página actual
   // const limit = 20; // Número de Pokémon por página
   // pagNum = 1

   // en el html <button>prev</button> <button>next</button>