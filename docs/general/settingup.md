# Setting Up

Follow the following steps to set up Yappy with any repo on GitLab.

**Discord**
1. Go to the channel you want events in for a repo
2. Say `GL! init REPO`, where `REPO` can be `username/repo`, a gitlab url.. more usage info at `GL! help init`
  - If the repository is private, make sure you tell Yappy that with `GL! init REPO private`;

**GitLab**
1. Go to the GitLab repo you want to have events for
2. Click Settings > Integrations
3. Set `URL` to https://www.yappybots.ga/gitlab
4. Select the events you want to emit to the channel
5. Click "Add Webhook"

Now you can test the webhook by, in Settings > Integrations, scrolling down to "Webhooks (#)", finding the webhook pointing to the url mentioned above, and clicking the "Test" button on the right.
Keep in mind you will need to have a commit or two in the repo, as it will simulate a push request.
