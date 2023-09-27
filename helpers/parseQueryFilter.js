function getModelPaths(model) {
    return Object.keys(model.schema.paths);
}

function parseFilterQuery(model, query) {
    if (Object.keys(query).length === 0) {
        return {};
    }

    const filteredQuery = {};

    for (const path of getModelPaths(model)) {
        if (query.hasOwnProperty(path)) {
            filteredQuery[path] = query[path];

            if (typeof filteredQuery[path] === "object") {
                for (const [key, value] of Object.entries(
                    filteredQuery[path],
                )) {
                    filteredQuery[path][`$${key}`] = value;
                    delete filteredQuery[path][key];
                }
            }
        }
    }
    return filteredQuery;
}

module.exports = parseFilterQuery;
