const GitlabAPI = require('node-gitlab');
const EventHandler = require('./EventHandler');
const GitlabRepoParse = require('./GitlabRepoParser').Parse;

/**
* Gitlab class with custom helper methods, logs in immediatly if token is found
*/
class Gitlab {
  constructor() {
    Log.info(`GitLab | Logging in...`);
    if (process.env.GITLAB_TOKEN) {
      this.gitlab = GitlabAPI.createPromise({
        api: 'https://gitlab.com/api/v3',
        privateToken: process.env.GITLAB_TOKEN,
      });
      Log.info(`GitLab | Logged in!`);
      EventHandler.setGitlab(this.gitlab);
    } else {
      Log.warn(`GitLab | No token provided! Skipped login.`);
    }
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
    if (!this.gitlab) {
      Log.warn(`GitLab | getRepo: returning sample gitlab project`);
      return Promise.resolve({
        id: 101,
        description: 'awful project',
        default_branch: 'master',
        public: true,
        web_url: 'http://exmaple.com/awful/project',
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
      return this.gitlab.projects.get({ id: repoId });
    }
  }
}

module.exports = new Gitlab();
