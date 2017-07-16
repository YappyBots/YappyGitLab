const EventHandler = require('./EventHandler');
const GitlabRepoParse = require('./GitlabRepoParser').Parse;
const snekfetch = require('snekfetch');
const Constants = require('./Constants');

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
    const repoId = this._getRepoID(ownerOrId, name);
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getRepo: returning sample gitlab project`);
      return Promise.resolve({
        id: 101,
        description: 'awful project',
        default_branch: 'master',
        public: true,
        web_url: 'http://gitlab.com/awful/project',
        owner: {
          id: 100,
          name: 'Awful',
        },
        name: 'Project',
        name_with_namespace: 'Awful / Project',
        path: 'project',
        path_with_namespace: 'awful/project',
      });
    } else {
      return this._request(Constants.Endpoints.Project(repoId));
    }
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
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getProjectIssues: returning sample merge requests`);
      return Promise.resolve([]);
    } else {
      return this._request(Constants.Endpoints.Project(repoId).Issues(params));
    }
  }

  /**
  * Get GitLab repository's specific issue
  * @param {String} ownerOrId       - repo's owner or full repo name/url
  * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
  * @param {String|Number} issue           - repo's issue
  * @return {Promise}
  */
  getProjectIssue(ownerOrId, name, issueID) {
    if (typeof issueID === 'string') issueID = parseInt(issueID);
    const repoId = this._getRepoID(ownerOrId, name);
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getProjectIssues: returning sample merge request`);
      return Promise.reject('meh');
    } else {
      return this._request(Constants.Endpoints.Project(repoId).Issue(issueID));
    }
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
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getProjectMergeRequests: returning sample issues`);
      return Promise.resolve([]);
    } else {
      return this._request(Constants.Endpoints.Project(repoId).MergeRequests(params));
    }
  }

  /**
  * Get GitLab repository's specific issue
  * @param {String} ownerOrId       - repo's owner or full repo name/url
  * @param {String} [name]          - repo's name, required if ownerOrId is repo's owner
  * @param {String|Number} issue           - repo's issue
  * @return {Promise}
  */
  getProjectMergeRequest(ownerOrId, name, issueID) {
    if (typeof issueID === 'string') issueID = parseInt(issueID);
    const repoId = this._getRepoID(ownerOrId, name);
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getProjectMergeRequests: returning sample issue`);
      return Promise.reject('meh');
    } else {
      return this._request(Constants.Endpoints.Project(repoId).MergeRequest(issueID));
    }
  }

  /**
  * Search GitLab organizations
  * @param {String} query       - query
  * @return {Promise}
  */
  searchGroups(query) {
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | searchGroups: returning sample issue`);
      return Promise.resolve([]);
    } else {
      return this._request(Constants.Endpoints.Group(org), {
        search: query,
      });
    }
  }

  /**
  * Get GitLab organization's public projects
  * @param {String} org       - organization name / id
  * @return {Promise}
  */
  getGroupProjects(org) {
    if (!this.tokenAvailable) {
      Log.warn(`GitLab | getGroupProjects: returning sample issue`);
      return Promise.resolve([]);
    } else {
      return this._request(Constants.Endpoints.Group(org).projects);
    }
  }

  _getRepoID(ownerOrId, name) {
    let repo = name && GitlabRepoParse(`${ownerOrId}/${name}`);
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
