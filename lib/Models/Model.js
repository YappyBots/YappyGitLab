const bookshelf = require('.');
const _ = require('lodash');

module.exports = class Model extends bookshelf.Model {
    static find(id, withRelated) {
        return this.forge({
            id,
        }).fetch({
            require: false,
            withRelated,
        });
    }

    parse(attrs) {
        const clone = _.mapKeys(attrs, function(value, key) {
            return _.camelCase(key);
        });

        if (this.casts)
            Object.keys(this.casts).forEach(key => {
                const type = this.casts[key];
                const val = clone[key];

                if (type === 'boolean' && val !== undefined) {
                    clone[key] = !(val === 'false' || val == 0);
                }

                if (type === 'array') {
                    try {
                        clone[key] = JSON.parse(val) || [];
                    } catch (err) {
                        clone[key] = [];
                    }
                }
            });

        return clone;
    }

    format(attrs) {
        const clone = attrs;

        if (this.casts)
            Object.keys(this.casts).forEach(key => {
                const type = this.casts[key];
                const val = clone[key];

                if (type === 'boolean' && val !== undefined) {
                    clone[key] = Number(val === true || val === 'true');
                }

                if (type === 'array' && val) {
                    clone[key] = JSON.stringify(val);
                }
            });

        return _.mapKeys(attrs, function(value, key) {
            return _.snakeCase(key);
        });
    }
};
