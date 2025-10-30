import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ListaPokemon } from './dto/lista-pokemon.inerface';
import { DetallesPokemon } from './dto/pokemon-detalles.interface';
import { PokemonSpecies } from './dto/pokemon-especies.interface';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ImportarPokemonesService implements OnModuleInit {

  private readonly BASE_URL = 'https://pokeapi.co/api/v2/'

    private readonly logger = new Logger(ImportarPokemonesService.name)

    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        const count = await this.prisma.pokemon.count()
        if (count ===0){
          this.logger.log("No hay pookemones en la bd... importando")
          await this.importar();
          this.logger.log("Importacion completa")
        }else {
          this.logger.log(`se encontraron ${count} pokemones no se importo nada`)
        }
    }

  async importar() {
 try {
      const response = await fetch(`${this.BASE_URL}/pokemon?limit=251&offset=0`)

      if (!response.ok) {
        throw new Error('Ha ocurrido un error')
      }

      const pokemones = (await response.json()) as ListaPokemon;

      const detalles = await Promise.allSettled(
        pokemones.results.map(async ({ url }) => {
          const res = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}`)
          if (!res.ok) {
            throw new Error(`Ha ocurrido un error al consultar el pokemon ${url}`)
          }
          const pokemon = (await res.json()) as DetallesPokemon;

          const { species: { url: speciesUrl } } = pokemon;

          const speciesUrlFixed = speciesUrl.endsWith('/') ? speciesUrl.slice(0, -1) : speciesUrl;
          const speciesApi = await fetch(`${speciesUrlFixed}`)
          if (!speciesApi.ok) {
            throw new Error(`Ha ocurrido un error al consultar la especie del pokemon ${pokemon.id}`)
          }

          const especie = (await speciesApi.json()) as PokemonSpecies;
          return { pokemon, especie };
        })
      );

      const tipos = new Set(detalles.filter(i => i.status === 'fulfilled').flatMap(i => i.value.pokemon.types).map(i => ({
        nombre: i.type.name
      })))


      await this.prisma.tipo_pokemon.createMany({
        data: [...tipos],
        skipDuplicates: true
      });

      (await Promise.all(detalles.filter(i => i.status === 'fulfilled'))).map(({ value }) => this.registrarPokemon(value.pokemon, value.especie))


      // return detalles;

    } catch (error) {

    }

}

  async registrarPokemon(pokemon: DetallesPokemon, especie: PokemonSpecies): Promise<any> {
    const vida = pokemon.stats.find((i) => i.stat.name == 'hp')?.base_stat ?? 0;
    const ataque =
      pokemon.stats.find((i) => i.stat.name == 'attack')?.base_stat ?? 0;
    const ataqueEspecial =
      pokemon.stats.find((i) => i.stat.name == 'special-attack')?.base_stat ??
      0;
    const defensa =
      pokemon.stats.find((i) => i.stat.name == 'defense')?.base_stat ?? 0;
    const defensaEspecial =
      pokemon.stats.find((i) => i.stat.name == 'special-defense')?.base_stat ??
      0;
    const velocidad =
      pokemon.stats.find((i) => i.stat.name == 'speed')?.base_stat ?? 0;

    let descripcion = especie.flavor_text_entries.find(
      (i) => i.version.name == 'omega-ruby' && i.language.name == 'es',
    )?.flavor_text;
    if (!descripcion || descripcion.trim().length == 0) {
      const index = especie.flavor_text_entries.findLastIndex(
        (i) => i.language.name == 'es',
      );
      descripcion = especie.flavor_text_entries[index].flavor_text;
    }

    const imagen =
      pokemon.sprites.other?.['official-artwork'].front_default ??
      pokemon.sprites.front_default;

    try {
      await this.prisma.pokemon.create({
        data: {
          id: pokemon.id,
          nombre: pokemon.name,
          descripcion,
          grunido: pokemon.cries.latest,
          imagen,
          vida,
          velocidad,
          ataqueEspecial,
          defensa,
          ataque,
          defensaEspecial,
          tipoPokemon: {
            connectOrCreate: pokemon.types.map(i => ({
              where: { nombre: i.type.name },
              create: { nombre: i.type.name }
            }))
          }
        }
      })
    } catch (error) {

    }


  }

}
