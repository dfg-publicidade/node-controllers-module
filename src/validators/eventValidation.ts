import Schema from 'validate';

const validatorCompl: Schema = new Schema({
    title: {
        type: String,
        message: {
            type: 'O campo título deve conter um valor textual',
            required: 'É necessário informar o título do evento'
        }
    },
    start: {
        type: Date,
        required: true,
        message: {
            type: 'O campo início deve conter uma data válida',
            required: 'É necessário informar a data de início'
        }
    },
    end: {
        type: Date,
        required: true,
        message: {
            type: 'O campo término deve conter uma data válida',
            required: 'É necessário informar a data de término'
        }
    }
});

export default (evento: any): any[] => validatorCompl.validate(evento, {
    strip: false
});
