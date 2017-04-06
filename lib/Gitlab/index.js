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
}

module.exports = new Gitlab();
