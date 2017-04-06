exports.Errors = {
  NO_TOKEN: 'No token was provided via process.env.GITLAB_TOKEN',
  NO_REPO_CONFIGURED: e => `Repository for this channel hasn't been configured. Please tell the server owner that they need to do \`${e.bot.prefix} conf set repo <user/repo>\`.`,
};

const api = `https://gitlab.com/api/v4`;

exports.Endpoints = {
  projects: `${api}/projects`,
  Project: projectID => {
    if (projectID.repo) projectID = projectID.repo.replace(/\//g, '%2F');
    const base = `${api}/projects/${projectID}`;
    return {
      toString: () => base,
      issues: `${base}/issues`,
      Issue: issueID => `${base}/issues/${issueID}`,
      Issues: (params) => `${base}/issues/${params ? '?' : ''}${Object.keys(params || {}).map(e => `${e}=${params[e]}`).join('&')}`,
    };
  },
};
