const EventHandler = require('./EventHandler');
const snekfetch = require('snekfetch');
const Constants = require('./Constants');
const parse = require('./parser');

/**
 * Gitlab class with custom helper methods, logs in immediatly if token is found
 */
class Gitlab {
  constructor() {
    EventHandler.setGitlab(this.gitlab);

    this.Constants = Constants;

    Log.info(`GitLab | Set up!`);
  }
  /**
   * Get GitLab repository information
   * @param {String} ownerOrId - Repo's owner or full repository name/url
   * @param {String} [name] - Repo's name, required if ownerOrId is repo's owner
   * @return {Promise}
   */
  getRepo(ownerOrId, name) {
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId));
  }

  /**
   * Get GitLab repository's issues
   * @param {String} ownerOrId       - repo's owner or full repo name/url
   * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
   * @param {Object} [params = {}]   - api params
   * @return {Promise}
   */
  getProjectIssues(ownerOrId, name, params) {
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId).Issues(params));
  }

  /**
   * Get GitLab repository's specific issue
   * @param {String} ownerOrId       - repo's owner or full repo name/url
   * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
   * @param {String|Number} issueID  - repo's issue
   * @return {Promise}
   */
  getProjectIssue(ownerOrId, name, issueID) {
    if (typeof issueID === 'string') issueID = parseInt(issueID);
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId).Issue(issueID));
  }

  /**
   * Get GitLab repository's issues
   * @param {String} ownerOrId       - repo's owner or full repo name/url
   * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
   * @param {Object} [params = {}]   - api params
   * @return {Promise}
   */
  getProjectMergeRequests(ownerOrId, name, params) {
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(
      Constants.Endpoints.Project(repoId).MergeRequests(params)
    );
  }

  /**
   * Get GitLab repository's specific issue
   * @param {String} ownerOrId       - repo's owner or full repo name/url
   * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
   * @param {String|Number} issueID           - repo's issue
   * @return {Promise}
   */
  getProjectMergeRequest(ownerOrId, name, issueID) {
    if (typeof issueID === 'string') issueID = parseInt(issueID);

    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(
      Constants.Endpoints.Project(repoId).MergeRequest(issueID)
    );
  }

  /**
   * Search GitLab organizations
   * @param {String} query       - query
   * @return {Promise}
   */
  searchGroups(query) {
    return this._request(Constants.Endpoints.groups, {
      search: query,
    });
  }

  /**
   * Get GitLab organization's public projects
   * @param {String} org       - organization name / id
   * @return {Promise}
   */
  getGroupProjects(org) {
    return this._request(Constants.Endpoints.Group(org).projects);
  }

  _getRepoID(ownerOrId, name) {
    const data = name && parse(`${ownerOrId}/${name}`);
    return (data ? data.repo : ownerOrId).replace(/\//g, '%2F');
  }

  _request(url, params) {
    return snekfetch.get(url.toString()).send(params || {});
  }
}

module.exports = new Gitlab();
