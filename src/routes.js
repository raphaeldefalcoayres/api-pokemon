import { Router } from 'express';
import GenerateController from './app/controllers/GenerateController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ api: 'ok' });
});

routes.get('/colors', GenerateController.getColors);
routes.get('/colors-dash', GenerateController.getColorsDash);
routes.get('/habitats', GenerateController.getHabitats);
routes.get('/habitats-dash', GenerateController.getHabitatsDash);
routes.get('/types', GenerateController.getTypes);
routes.get('/types-dash', GenerateController.getTypesDash);
routes.get('/pokemons', GenerateController.getPokemons);
routes.get('/pokemons-complete', GenerateController.getPokemonsComplete);
routes.get('/join', GenerateController.joinAllData);

export default routes;
