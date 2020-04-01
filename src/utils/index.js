import * as fs from 'fs';
import api from '../lib/api';

export const saveJson = (data, name) => {
  fs.writeFile(`${name}.json`, JSON.stringify(data), function(err) {
    if (err) throw err;
    console.log(`${name}.json saved!`);
  });
};

export const pad = (num, size) => {
  const s = `000${num}`;
  return s.substr(s.length - size);
};

export const getItemsList = (url, items, resolve, reject) => {
  api
    .get(url)
    .then(response => {
      const retrived = items.concat(response.data.results);
      console.log(retrived);
      if (response.data.next !== null) {
        getItemsList(response.data.next, retrived, resolve, reject);
      } else {
        resolve(retrived);
      }
    })
    .catch(error => {
      console.log(error);
      reject('Something wrong. Please refresh the page and try again.');
    });
};

export const evolutionArrayGenerate = async evolution_chain => {
  const evolution = [];

  const { data } = await api(evolution_chain.chain.species.url);

  if (evolution_chain.chain.evolves_to.length > 0) {
    const { data: data2 } = await api(
      evolution_chain.chain.evolves_to[0].species.url
    );

    evolution.push({
      id: data.id,
      name: data.name,
      img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(
        data.id,
        3
      )}.png`,
    });

    evolution.push({
      id: data2.id,
      name: data2.name,
      minLevel:
        evolution_chain.chain.evolves_to[0].evolution_details[0].min_level,
      img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(
        data2.id,
        3
      )}.png`,
    });
  }

  if (
    evolution_chain.chain.evolves_to.length > 0 &&
    evolution_chain.chain.evolves_to[0].evolves_to.length > 0
  ) {
    const { data: data3 } = await api(
      evolution_chain.chain.evolves_to[0].evolves_to[0].species.url
    );

    evolution.push({
      id: data3.id,
      name: data3.name,
      minLevel:
        evolution_chain.chain.evolves_to[0].evolves_to[0].evolution_details[0]
          .min_level,
      img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(
        data3.id,
        3
      )}.png`,
    });
  }

  return evolution;
};
