const fuzzySearch = {};

module.exports = fuzzySearch;

module.exports.escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
