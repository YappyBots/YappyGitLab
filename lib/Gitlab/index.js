const EventHandler = require('./EventHandler');
const snekfetch = require('snekfetch');
const Constants = require('./Constants');
const parse = require('./parser');

class GitlabAuthError extends Error {
  constructor(msg) {
    super();

    this.name = 'GitlabAuthError';
    this.message = msg;
  }
}

/**
* Gitlab class with custom helper methods, logs in immediatly if token is found
*/
class Gitlab {
  constructor() {
    Log.info(`GitLab | Logging in...`);
    if (process.env.GITLAB_TOKEN) {
      this.tokenAvailable = true;
      this.token = process.env.GITLAB_TOKEN;
      Log.info(`GitLab | Logged in!`);
      EventHandler.setGitlab(this.gitlab);
    } else {
      Log.warn(`GitLab | No token provided! Skipped login.`);
    }
    this.Constants = Constants;
  }
  /**
  * Get GitLab repository information
  * @param {String} ownerOrId - Repo's owner or full repository name/url
  * @param {String} [name] - Repo's name, required if ownerOrId is repo's owner
  * @return {Promise}
  */
  getRepo(ownerOrId, name) {
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');
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
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId).Issues(params));
  }

  /**
  * Get GitLab repository's specific issue
  * @param {String} ownerOrId       - repo's owner or full repo name/url
  * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
  * @param {String|Number} issue           - repo's issue
  * @return {Promise}
  */
  getProjectIssue(ownerOrId, name, issueID) {
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');
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
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');
    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId).MergeRequests(params));
  }

  /**
  * Get GitLab repository's specific issue
  * @param {String} ownerOrId       - repo's owner or full repo name/url
  * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
  * @param {String|Number} issue           - repo's issue
  * @return {Promise}
  */
  getProjectMergeRequest(ownerOrId, name, issueID) {
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');
    if (typeof issueID === 'string') issueID = parseInt(issueID);

    const repoId = this._getRepoID(ownerOrId, name);

    return this._request(Constants.Endpoints.Project(repoId).MergeRequest(issueID));
  }

  /**
  * Search GitLab organizations
  * @param {String} query       - query
  * @return {Promise}
  */
  searchGroups(query) {
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');

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
    if (!this.tokenAvailable) throw new GitlabAuthError('No Gitlab token provided');

    return this._request(Constants.Endpoints.Group(org).projects);
  }

  _getRepoID(ownerOrId, name) {
    const repo = name && parse(`${ownerOrId}/${name}`);
    return (repo ? repo.repo : ownerOrId).replace(/\//g, '%2F');
  }

  _request(url, params) {
    return snekfetch
    .get(url.toString())
    .send(params || {})
    .set('PRIVATE-TOKEN', this.token);
  }
}

module.exports = new Gitlab();
