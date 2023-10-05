/**
 * Filter object by keys
 * @param {Object} obj - Object to filter
 * @param {string[]} allowedKeys - Keys to keep
 * @returns {Object} - Filtered Object
 */
const filterObjByKeys = (obj, ...allowedKeys) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, _]) => allowedKeys.includes(key)),
    );
};

module.exports = filterObjByKeys;
