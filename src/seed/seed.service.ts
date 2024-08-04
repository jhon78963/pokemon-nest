import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segmentss = url.split('/');
      const no = +segmentss[segmentss.length - 2];
      pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed Executed';
    // const insertPromisesArray = [];

    // data.results.forEach(async ({ name, url }) => {
    //   const segmentss = url.split('/');
    //   const no = +segmentss[segmentss.length - 2];
    //   insertPromisesArray.push(this.pokemonModel.create({ name, no }));
    //   await Promise.all(insertPromisesArray);

    //   return 'Seed Executed';
    // });

    return data.results;
  }
}
