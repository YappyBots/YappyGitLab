const parseUrl = require('parse-github-url');

const urlRegex = /^(https?:\/\/|git@)?([\da-z\.-]+\.[a-z\.]{2,7})\/?/; // eslint-disable-line no-useless-escape

const getUrl = str => urlRegex.exec(str);
const regex = /^([^\/\s]+)\/?((?:\/?(?:\S+))*)\/([^\/]+?)(?:\.git)?$/; // eslint-disable-line no-useless-escape

/**
 * Gitlab repository
 * @typedef {Object} GitlabParsedRepository
 * @property {String} repo full repository name, including owner & group
 * @property {String} repository same as .repo
 * @property {String} owner repo owner
 * @property {String} group repo group, if any
 * @property {String} name repo name
 */

/**
 * Gitlab repository parser
 * @param  {String} str input
 * @return {GitlabParsedRepository}     output
 */
module.exports = str => {
    if (!str || typeof str !== 'string' || !str.length) return {};

    const parsed = parseUrl(str);

    if (parsed.host === 'github.com') parsed.host = 'gitlab.com';

    parsed.isGitlab = parsed.host === 'gitlab.com';

    return parsed;
};

module.exports.getRepo = str => {
    const out = module.exports(str);

    return out && out.repo;
};