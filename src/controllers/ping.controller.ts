import {inject} from '@loopback/core';
import {ClassDecoratorFactory, MetadataInspector} from '@loopback/metadata';
import {get, Request, ResponseObject, RestBindings} from '@loopback/rest';
import {CategoryRepository} from "../repositories";
import {repository} from "@loopback/repository";

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

interface MyClassMetaData {
  name: string;
}

function myClassDecorator(spec: MyClassMetaData): ClassDecorator {
  const factory = new ClassDecoratorFactory<MyClassMetaData>(
    'meta-data-my-class-decorator',
    spec
  )
  return factory.create();
}


/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request,
              @repository(CategoryRepository) private categoryRepo: CategoryRepository

              ) { }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack 1111',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @get('/teste')
  async index() {
    let _id = Math.random().toString(36).substring(7);
    await this.categoryRepo.create({
      id: _id,
      name: 'minha primeira categoria',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return this.categoryRepo.find()
  }
}

// const metada = MetadataInspector.getClassMetadata<MyClassMetaData>(
//   'meta-data-my-class-decorator',
//   PingController
// )
