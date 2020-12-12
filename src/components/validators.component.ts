import {Binding, Component, CoreBindings, inject} from "@loopback/core";
import {RestTags} from "@loopback/rest";
import {DefaultCrudRepository} from "@loopback/repository";
import {difference} from 'lodash';
import { ValidationError} from 'ajv';
import {ApplicationWithServices} from "@loopback/service-proxy";

export class ValidatorsComponent implements Component {
    bindings: Array<Binding> = []

    constructor(
        @inject(CoreBindings.APPLICATION_INSTANCE)
        private app: ApplicationWithServices) {
        this.bindings = this.validators();
    }

    validators() {
        return [
            Binding
                .bind('ajv.keywords.exists')
                .to({
                    name: 'exists',
                    validate: async ([model, field] : Array<any>, value: any) => {
                        const values = Array.isArray(value) ? value: [value];
                        const repository = this.app.getSync<DefaultCrudRepository<any, any>>(`repositories.${model}Repository`);
                        const rows: any= repository.find({
                            where: {
                                or: values.map(v => ({[field]: v}))
                            }
                        })
                        if(rows.length !== value.length) {
                            const valuesNotExist = difference(values, rows.map((r:any) => r[field]))
                            const errors = valuesNotExist.map(
                                v => ({message: `The value ${v} for ${model} not exists`})
                            )
                            throw new ValidationError(errors as any);
                        }
                         return true;
                    },
                    async: true
                })
                .tag(RestTags.AJV_KEYWORD)
        ];
    }
}