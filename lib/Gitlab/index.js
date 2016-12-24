const GitlabAPI = require('node-gitlab');
const EventHandler = require('./EventHandler');
const GitlabRepoParse = require('./GitlabRepoParser').Parse;

/**
* Github class with custom helper methods, logs in immediatly
*/
class Github {
  constructor() {
    Log.info(`GitLab | Logging in...`);
    this.gitlab = GitlabAPI.createPromise({
      api: 'https://gitlab.com/api/v3',
      privateToken: process.env.GITLAB_TOKEN,
    });
    Log.info(`GitLab | Logged in!`);
    EventHandler.setGitlab(this.gitlab);
  }
  /**
  * Get GitLab repository information
  * @param {String} ownerOrId - Repo's owner or full repository name/url
  * @param {String} [name] - Repo's name, required if ownerOrId is repo's owner
  * @return {Promise}
  */
  async getRepo(ownerOrId, name) {
    let repo = name && GitlabRepoParse(`${ownerOrId}/${name}`);
    let repoId = repo ? repo.repo.replace(/\//g, '%2F') : ownerOrId;
    return this.gitlab.projects.get({ id: repoId });
  }
}

module.exports = new Github();
