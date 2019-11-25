const GetBranchName = require('../../Util').GetBranchName;
const EventResponse = require('../EventResponse');

const UrlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const RemoveUrlEmbedding = url => `<${url}>`;

class Push extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: `This event is fired when someone pushes commits to a branch.`,
        });
    }
    embed(data) {
        if (!data.commits || !data.commits.length) return;

        const branch = GetBranchName(data.ref);
        const commits = data.commits;
        const commitCount = commits.length;
        let pretext = commits
            .map(commit => {
                let commitMessage = commit.message.split('\n')[0].replace(UrlRegEx, RemoveUrlEmbedding);
                let author = commit.author.name || data.user_username || data.user_name;
                let sha = commit.id.slice(0, 7);
                return `[\`${sha}\`](${commit.url}) ${commitMessage} [${author}]`;
            })
            .slice(0, 5);
        const description = pretext.join('\n');

        return {
            color: 0x7289da,
            title: `Pushed ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'} to \`${branch}\``,
            url: `${data.project.web_url}/compare/${data.before.slice(0, 7)}...${data.after.slice(0, 7)}`,
            description,
        };
    }
    text(data) {
        if (!data.commits || !data.commits.length) return;

        const actor = data.user_username || data.user_name;
        const branch = GetBranchName(data.ref);
        const commits = data.commits || [];
        const commitCount = commits.length;
        if (!commitCount) return '';
        let msg = `⚡ **${actor}** pushed ${commitCount} ${commitCount !== 1 ? 'commits' : 'commit'} to \`${branch}\``;
        let commitArr = commits
            .map(commit => {
                let commitMessage = commit.message.replace(/\n/g, '\n               ').replace(UrlRegEx, RemoveUrlEmbedding);
                return `        \`${commit.id.slice(0, 7)}\` ${commitMessage} [${commit.author.name || actor}]`;
            })
            .slice(0, 5);
        msg += `\n${commitArr.join('\n')}`;
        msg += `\n<${data.project.web_url}/compare/${data.before.slice(0, 7)}...${data.after.slice(0, 7)}>`;

        return msg;
    }
}

module.exports = Push;
