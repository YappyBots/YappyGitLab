const urlRegex = /^(https?:\/\/|git@)?([\da-z\.-]+\.[a-z\.]{2,7})\/?/; // eslint-disable-line no-useless-escape

const getUrl = (str) => urlRegex.exec(str);
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
module.exports = (str) => {
  if (!str || typeof str !== 'string' || !str.length) return {};

  const url = getUrl(str);
  const domain = url && url[2];
  const parsed = regex.exec(str.replace(urlRegex, ''));

  const repo = parsed && `${parsed[1]}/${parsed[3]}`;

  return parsed ? {
    repo,
    host: domain,
    isGitlab: !domain || domain === 'gitlab.com',
    repository: repo,
    owner: parsed[1],
    group: parsed[2],
    name: parsed[3],
  } : {};
};
