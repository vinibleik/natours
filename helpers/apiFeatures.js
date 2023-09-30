module.exports = class {
    #query;

    constructor(
        model,
        queryBody = {},
        { sort = "-createdAt", fields = "-__v", page = 1, limit = 100 } = {},
    ) {
        this.model = model;
        this.query = queryBody;
        this.defaultSort = sort;
        this.defaultFields = fields;
        this.defaultPage = page;
        this.defaultLimit = limit;
        this.#query = this.model.find();
    }

    #getModelPaths() {
        return Object.keys(this.model.schema.paths);
    }

    #parseFilterQueryValue(queryValue) {
        if (Array.isArray(queryValue)) {
            queryValue = queryValue.at(-1);
        }

        if (typeof queryValue === "object") {
            for (const [key, value] of Object.entries(queryValue)) {
                queryValue[`$${key}`] = value;
                delete queryValue[key];
            }
        }

        return queryValue;
    }

    #parseFilterQuery() {
        if (Object.keys(this.query).length === 0) {
            return {};
        }

        const filteredQuery = {};

        for (const path of this.#getModelPaths()) {
            if (this.query[path] != null) {
                filteredQuery[path] = this.#parseFilterQueryValue(
                    this.query[path],
                );
            }
        }

        return filteredQuery;
    }

    filter() {
        this.#query = this.#query.find(this.#parseFilterQuery());
        return this;
    }

    findById(id) {
        this.#query = this.model.findById(id);
        return this;
    }

    sort() {
        let sortString = this.query.sort || this.defaultSort;
        sortString = sortString.replaceAll(",", " ");
        this.#query = this.#query.sort(sortString);
        return this;
    }

    select() {
        let fieldsString = this.query.fields || this.defaultFields;
        fieldsString = fieldsString.replaceAll(",", " ");
        this.#query = this.#query.select(fieldsString);
        return this;
    }

    pagination() {
        const page = this.query.page * 1 || this.defaultPage;
        const limit = this.query.limit * 1 || this.defaultLimit;
        const skip = (page - 1) * limit;

        this.#query = this.#query.skip(skip).limit(limit);
        return this;
    }

    all() {
        return this.filter().sort().select().pagination();
    }

    exec() {
        return this.#query.exec();
    }
};
