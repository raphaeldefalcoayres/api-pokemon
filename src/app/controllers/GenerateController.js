import api from '../../services/api';

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

      const colors = results.map(color => color.name);

      saveJson(colors, 'db-colors');

      return res.json(colors);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getHabitats(req, res) {
    try {
      const {
        data: { results },
      } = await api('pokemon-habitat');

      const habitats = results.map(color => color.name);

      saveJson(habitats, 'db-habitats');

      return res.json(habitats);
    } catch (err) {
      return res.status(400).json({ message: 'error', err });
    }
  }

  async getTypes(req, res) {
    try {
      const {
        data: { results },
      } = await api('type');

      const types = results.map(color => color.name);

      saveJson(types, 'db-types');

      return res.json(types);
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

      return {
        id: data.id,
        name: data.name,
        img: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(
          data.id,
          3
        )}.png`,
        weight: data.weight,
        height: data.height,
        base_experience: data.base_experience,
        color: specie.data.color ? specie.data.color.name : null,
        evolves_from_species,
        types: data.types,
        species: data.species,
        habitat: specie.data.habitat
          ? specie.data.habitat.name
          : 'without-habitat',
        evolution: evolutionArray,
      };
    };

    const pokemons = JSON.parse(fs.readFileSync('db-pokemons.json', 'utf8'));

    const t0 = Date.now();
    chunks(pokemons, fetchDatas, 50).then(response => {
      const t1 = Date.now();
      console.log(`Fetch time: ${t1 - t0} ms`);
      saveJson(response, 'db-pokemons-complete');
      res.json(response);
    });
  }

  async joinAllData(req, res) {
    const colors = JSON.parse(fs.readFileSync('db-colors.json', 'utf8'));
    const types = JSON.parse(fs.readFileSync('db-types.json', 'utf8'));
    const habitats = JSON.parse(fs.readFileSync('db-habitats.json', 'utf8'));
    const pokemons = JSON.parse(
      fs.readFileSync('db-pokemons-complete.json', 'utf8')
    );

    saveJson({ colors, types, habitats, pokemons }, 'db');

    return res.json({ join: success });
  }
}

export default new GenerateController();
