import api from '../../lib/api';

import * as fs from 'fs';

import {
  saveJson,
  pad,
  evolutionArrayGenerate,
  getItemsList,
} from '../../utils';
import { chunks } from '../../helpers';

class GenerateController {
  async getColors(req, res) {
    try {
      const {
        data: { results },
      } = await api('pokemon-color');

      const colors = results.map(item => item.name);

      saveJson(colors, 'db-colors');

      return res.json(colors);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getColorsDash(req, res) {
    try {
      let colorsDash = {};

      const pokemons = JSON.parse(
        fs.readFileSync('db-pokemons-complete.json', 'utf8')
      );

      pokemons.forEach(pokemon => {
        colorsDash = {
          ...colorsDash,
          [pokemon.color]: colorsDash[pokemon.color]
            ? (colorsDash[pokemon.color] += 1)
            : 1,
        };
      });

      saveJson(colorsDash, 'db-colorsDash');

      return res.json(colorsDash);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getHabitats(req, res) {
    try {
      const {
        data: { results },
      } = await api('pokemon-habitat');

      const habitats = results.map(item => item.name);

      saveJson(habitats, 'db-habitats');

      return res.json(habitats);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getHabitatsDash(req, res) {
    try {
      let habitatsDash = {};

      const pokemons = JSON.parse(
        fs.readFileSync('db-pokemons-complete.json', 'utf8')
      );

      pokemons.forEach(pokemon => {
        habitatsDash = {
          ...habitatsDash,
          [pokemon.habitat]: habitatsDash[pokemon.habitat]
            ? (habitatsDash[pokemon.habitat] += 1)
            : 1,
        };
      });

      saveJson(habitatsDash, 'db-habitatsDash');

      return res.json(habitatsDash);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getTypes(req, res) {
    try {
      const {
        data: { results },
      } = await api('type');

      const types = results.map(item => item.name);

      saveJson(types, 'db-types');

      return res.json(types);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getTypesDash(req, res) {
    try {
      let typesDash = {};

      const pokemons = JSON.parse(
        fs.readFileSync('db-pokemons-complete.json', 'utf8')
      );

      pokemons.forEach(pokemon => {
        if (pokemon.types.split(',').length > 1) {
          pokemon.types.split(',').forEach(type => {
            typesDash = {
              ...typesDash,
              [type]: typesDash[type] ? (typesDash[type] += 1) : 1,
            };
          });
        } else {
          typesDash = {
            ...typesDash,
            [pokemon.types]: typesDash[pokemon.types]
              ? (typesDash[pokemon.types] += 1)
              : 1,
          };
        }
      });

      saveJson(typesDash, 'db-typesDash');

      return res.json(typesDash);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getPokemons(req, res) {
    try {
      new Promise((resolve, reject) => {
        getItemsList('pokemon?limit=100', [], resolve, reject);
      }).then(async response => {
        saveJson(response, 'db-pokemons');
        return res.json(response);
      });
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getPokemonsComplete(req, res) {
    const fetchDatas = async item => {
      console.log(item.url);
      const { data } = await api(item.url);
      const specie = await api(data.species.url);
      const evolution = await api(specie.data.evolution_chain.url);
      const evolutionArray = await evolutionArrayGenerate(evolution.data);
      const evolves_from_species = !!specie.data.evolves_from_species;

      const id = pad(
        data.species.url
          .replace('https://pokeapi.co/api/v2/pokemon-species/', '')
          .replace('/', ''),
        3
      );

      console.log('id', id);

      return {
        id,
        name: data.name,
        img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(
          id,
          3
        )}.png`,
        weight: data.weight,
        height: data.height,
        base_experience: data.base_experience,
        color: specie.data.color ? specie.data.color.name : null,
        evolves_from_species,
        types:
          data.types[0].type.name +
          (data.types[1] ? ',' + data.types[1].type.name : ''),
        species: data.species,
        habitat: specie.data.habitat
          ? specie.data.habitat.name
          : 'without-habitat',
        evolution: evolutionArray,
        stats: data.stats,
      };
    };

    const pokemons = JSON.parse(fs.readFileSync('db-pokemons.json', 'utf8'));

    const t0 = Date.now();
    chunks(pokemons, fetchDatas, 50).then(response => {
      const t1 = Date.now();
      console.log(`Fetch time: ${t1 - t0} ms`);
      saveJson(
        response.filter(pokemon => pokemon.evolves_from_species === false),
        'db-pokemons-complete'
      );
      res.json(response);
    });
  }

  async joinAllData(req, res) {
    const colors = JSON.parse(fs.readFileSync('db-colorsDash.json', 'utf8'));
    const types = JSON.parse(fs.readFileSync('db-typesDash.json', 'utf8'));
    const habitats = JSON.parse(
      fs.readFileSync('db-habitatsDash.json', 'utf8')
    );
    const pokemons = JSON.parse(
      fs.readFileSync('db-pokemons-complete.json', 'utf8')
    );

    saveJson({ colors, types, habitats, pokemons }, 'db');

    return res.json({ join: 'success' });
  }
}

export default new GenerateController();
