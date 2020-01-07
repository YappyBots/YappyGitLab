const regex = /^(?:(?:https?:\/\/|git@)((?:(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*(?:[A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]))(?:\/|:))?([\w\.@\:\/\-~]+?)(\.git)?$/i;

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

    const out = regex.exec(str);

    if (!out) return {};

    const repo = (out[2] && out[2].split('/')) || [];
    const parsed = {
        host: out[1],
        repo: repo.slice(0, 3).join('/'),
    };

    parsed.owner = repo[0];
    parsed.group = repo.length > 2 ? repo.slice(1, repo.length - 2) : null;
    parsed.name = repo[repo.length - 1];
    parsed.isGitlab = parsed.host === 'gitlab.com';

    return parsed;
};

module.exports.getRepo = str => {
    const out = module.exports(str);

    return out && out.repo;
};
