const urlRegex = /(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})/; // eslint-disable-line no-useless-escape

const getUrl = (str) => urlRegex.exec(str);
const regex = /([^\/\s]+)\/?(?:(\w+))?\/([^\/]+?)$/; // eslint-disable-line no-useless-escape

/**
* Gitlab repository
* @typedef {Object} GitlabParsedRepository
* @property {String} repo full repository name, including owner & group
* @property {String} repository same as .repo
* @property {String} owner repo owner
* @property {String} group repo group, if any
* @property {Array} name: repo name
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

  return parsed ? {
    host: domain,
    isGitlab: domain === 'gitlab.com',
    repo: parsed[0],
    repository: parsed[0],
    owner: parsed[1],
    group: parsed[2],
    name: parsed[3],
  } : {};
};
