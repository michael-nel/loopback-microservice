import {bind, BindingScope, service} from '@loopback/core';
import {rabbitmqSubscribe} from '../decorators/rabbitmq-subscribe.decorator';
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {Message} from 'amqplib';
import {BaseModelSyncService} from "./base-model-sync.service";
import {ResponseEnum} from "../servers";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseModelSyncService {

  constructor(@repository(CategoryRepository) private repo: CategoryRepository,
              @service(ValidatorService) private validator: ValidatorService,) {
    super(validator)
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    routingKey: 'model.category.*',
    queue: 'micro-catalog/sync-videos/category',
  })
  async handler({data, message}: {data: any, message: Message }){
    await this.sync({
      repo: this.repo,
      data,
      message
    })

    return ResponseEnum.NACK;
  }
}
