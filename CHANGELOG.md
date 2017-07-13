<a name="1.1.1"></a>
## [1.1.1](https://github.com/YappyBots/YappyGitLab/compare/v1.1.0...v1.1.1) (2017-07-13)


### Bug Fixes

* **discord:** remove CHANNEL_CREATE from disabled events ffs ([b656754](https://github.com/YappyBots/YappyGitLab/commit/b656754))
* **gitlab: events:** fix event handler author icon_url erroring ([9c03f81](https://github.com/YappyBots/YappyGitLab/commit/9c03f81))
* **web:** fix disabledEvents looking for event name rather than shortname ([4dac4aa](https://github.com/YappyBots/YappyGitLab/commit/4dac4aa))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/YappyBots/YappyGitLab/compare/v1.0.3...v1.1.0) (2017-05-22)


### Features

* **gitlab: events:** add ability to ignore branch(es) & user(s) via conf ([6d572c1](https://github.com/YappyBots/YappyGitLab/commit/6d572c1)), closes [#11](https://github.com/YappyBots/YappyGitLab/issues/11) [#12](https://github.com/YappyBots/YappyGitLab/issues/12)



<a name="1.0.3"></a>
## [1.0.3](https://github.com/YappyBots/YappyGitLab/compare/v1.0.2...v1.0.3) (2017-05-17)


### Bug Fixes

* **discord: commands:** conf: add disabled events config to `GL! conf` ([1254653](https://github.com/YappyBots/YappyGitLab/commit/1254653)), closes [#9](https://github.com/YappyBots/YappyGitLab/issues/9)
* **discord: commands:** conf: show name of property in field view ([6441cc2](https://github.com/YappyBots/YappyGitLab/commit/6441cc2)), closes [#10](https://github.com/YappyBots/YappyGitLab/issues/10)
* **discord: commands:** init: fix command to enable embed in success msg ([4f7ea84](https://github.com/YappyBots/YappyGitLab/commit/4f7ea84)), closes [#8](https://github.com/YappyBots/YappyGitLab/issues/8)



<a name="1.0.2"></a>
## [1.0.2](https://github.com/YappyBots/YappyGitLab/compare/v1.0.1...v1.0.2) (2017-05-15)


### Bug Fixes

* **models:** hopefully fix duplicating config items on start ([e3a36b1](https://github.com/YappyBots/YappyGitLab/commit/e3a36b1))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/YappyBots/YappyGitLab/compare/v1.0.0...v1.0.1) (2017-05-14)


### Bug Fixes

* **dependencies:** update mongoose[@4](https://github.com/4).9.9 ([610dfcb](https://github.com/YappyBots/YappyGitLab/commit/610dfcb))
* **snyk:** run `snyk wizard` and fix a few vulnerabilities ([14f7469](https://github.com/YappyBots/YappyGitLab/commit/14f7469))
* **snyk:** run `snyk wizard` once again ([e10173d](https://github.com/YappyBots/YappyGitLab/commit/e10173d))
* **web:** add error handling and log error ([b52f33d](https://github.com/YappyBots/YappyGitLab/commit/b52f33d))
* **web:** fix channels with repo handling, expected `channelId` instead of `channelID` ([5489e09](https://github.com/YappyBots/YappyGitLab/commit/5489e09))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/YappyBots/YappyGitLab/compare/59ccd5e...v1.0.0) (2017-05-13)


### Bug Fixes

* **models: channelconfig:** remove `prefix` item from .validKeys ([7870590](https://github.com/YappyBots/YappyGitLab/commit/7870590))
* package.json & .snyk to reduce vulnerabilities ([59ccd5e](https://github.com/YappyBots/YappyGitLab/commit/59ccd5e))
* **bot:** fix disconnect error log, now using event.code ([61e8e48](https://github.com/YappyBots/YappyGitLab/commit/61e8e48))
* **dependencies:** add discord.js back ([ec00054](https://github.com/YappyBots/YappyGitLab/commit/ec00054))
* **dependencies:** remove express-handlebars ([ef45337](https://github.com/YappyBots/YappyGitLab/commit/ef45337))
* **dependencies:** update dependencies ([308e38a](https://github.com/YappyBots/YappyGitLab/commit/308e38a))
* **dependencies:** update dependencies ([d79db1e](https://github.com/YappyBots/YappyGitLab/commit/d79db1e))
* **dependencies:** update dependencies ([c3ca9b9](https://github.com/YappyBots/YappyGitLab/commit/c3ca9b9))
* **dependencies:** update djs to master (v12.0.0 dev) ([65d8549](https://github.com/YappyBots/YappyGitLab/commit/65d8549))
* **dependencies:** update djs to v11.1.0 (from repo) ([35bd8e8](https://github.com/YappyBots/YappyGitLab/commit/35bd8e8))
* **discord:** st prefix to ([2638b7e](https://github.com/YappyBots/YappyGitLab/commit/2638b7e))
* **discord: commands:** actually fix stats' embed footer icon_url (was iconURL) ([6c39ac1](https://github.com/YappyBots/YappyGitLab/commit/6c39ac1))
* **discord: commands:** fix color on updating embed ([036978d](https://github.com/YappyBots/YappyGitLab/commit/036978d))
* **discord: commands:** fix conf command interpreting '-' as --global ([ed51c20](https://github.com/YappyBots/YappyGitLab/commit/ed51c20)), closes [#3](https://github.com/YappyBots/YappyGitLab/issues/3)
* **discord: commands:** fix pulling update on `update` command ([034b8a5](https://github.com/YappyBots/YappyGitLab/commit/034b8a5))
* **discord: commands:** fix stats' embed iconURL, and change to use footer ([c7b6d27](https://github.com/YappyBots/YappyGitLab/commit/c7b6d27))
* **discord: modules:** fix casual help module requiring prefix + "yappy" + "gitlab", only prefix now ([a2cbc6c](https://github.com/YappyBots/YappyGitLab/commit/a2cbc6c))
* **eslint:** fix unecessary module required ([0795998](https://github.com/YappyBots/YappyGitLab/commit/0795998))
* **gitlab: events:** fix embed colors by transiforming to 0x###### ([f3c8237](https://github.com/YappyBots/YappyGitLab/commit/f3c8237))
* **help:** add quotes to usage in help for command ([dad6137](https://github.com/YappyBots/YappyGitLab/commit/dad6137))
* **models: channelconfig:** add `pipeline` to default disabledEvents in channelConfigSchema ([fc21636](https://github.com/YappyBots/YappyGitLab/commit/fc21636))
* **models: serverconfig:** fix ServerConfig#add setting Collection with .channelId prop of guild ([ac330b1](https://github.com/YappyBots/YappyGitLab/commit/ac330b1)), closes [#6](https://github.com/YappyBots/YappyGitLab/issues/6)
* **mongoose:** add error handling (logging) ([0ac5f12](https://github.com/YappyBots/YappyGitLab/commit/0ac5f12))


### Features

* **commands:** add issue comamnd to search and get issue info ([82fe8ab](https://github.com/YappyBots/YappyGitLab/commit/82fe8ab))
* **conf:** add ServerConf for prefix configuration ([2d6f20e](https://github.com/YappyBots/YappyGitLab/commit/2d6f20e))
* **dependencies:** add express-handlebars & run snyk wizard ([5172c13](https://github.com/YappyBots/YappyGitLab/commit/5172c13))
* **dependencies:** add hbs ([7dd535a](https://github.com/YappyBots/YappyGitLab/commit/7dd535a))
* **discord: commands:** add `invite` command ([6307b74](https://github.com/YappyBots/YappyGitLab/commit/6307b74))
* **discord: commands:** add merge request command ([df60c39](https://github.com/YappyBots/YappyGitLab/commit/df60c39))
* **discord: commands:** add update command ([d34ab21](https://github.com/YappyBots/YappyGitLab/commit/d34ab21)), closes [#5](https://github.com/YappyBots/YappyGitLab/issues/5)
* **discord: commands:** if issue description contains image, add and send with embed ([17ca650](https://github.com/YappyBots/YappyGitLab/commit/17ca650))
* **discord: commands:** if merge request description contains image, add and send with embed ([edc437e](https://github.com/YappyBots/YappyGitLab/commit/edc437e))
* **discord: commands:** send msg to channel when invite is sent to user in invite commmand ([c0466d5](https://github.com/YappyBots/YappyGitLab/commit/c0466d5))
* **gitlab: events:** add note/issue - fired when someone comments on issue ([13fcf70](https://github.com/YappyBots/YappyGitLab/commit/13fcf70))
* **gitlab: events:** add note/mergerequest - fired when someone comments on merge request ([214389e](https://github.com/YappyBots/YappyGitLab/commit/214389e))
* **gitlab: events:** add note/snippet - fired when someone comments on snippet ([692178b](https://github.com/YappyBots/YappyGitLab/commit/692178b))
* **gitlab: events:** add wiki_page/create - fired when wiki page is created ([de4dd33](https://github.com/YappyBots/YappyGitLab/commit/de4dd33))
* **gitlab: events:** add wiki_page/delete - fired when wiki page is deleted ([37908f7](https://github.com/YappyBots/YappyGitLab/commit/37908f7))
* **gitlab: events:** add wiki_page/update - fired when wiki page is updated ([34870e8](https://github.com/YappyBots/YappyGitLab/commit/34870e8))
* **middleware:** add UnhandledError middleware to handle unhandled errors ([abca414](https://github.com/YappyBots/YappyGitLab/commit/abca414))
* **modules:** add modules for message middlware ([46f2407](https://github.com/YappyBots/YappyGitLab/commit/46f2407))
* **modules:** create module CasualHelp for detecting need of help with ApiAI and responding ([5211eaa](https://github.com/YappyBots/YappyGitLab/commit/5211eaa))
* **web:** add nice-looking landing page with bot stats ([8534bab](https://github.com/YappyBots/YappyGitLab/commit/8534bab))
* **web:** add online status color circle, move screenshot img to right ([577af2c](https://github.com/YappyBots/YappyGitLab/commit/577af2c))


### Performance Improvements

* **bot:** add message sweeping & cache options to decrease mem usage ([93d1900](https://github.com/YappyBots/YappyGitLab/commit/93d1900))
* **command:** remove `async` from init command ([6dcd12c](https://github.com/YappyBots/YappyGitLab/commit/6dcd12c))
* **gitlab: emitting:** only generate event embed & text once per webhook ([4ce70dd](https://github.com/YappyBots/YappyGitLab/commit/4ce70dd))
* **gitlab: events:** update issue/* & note/commit - remove string creation on embed descriptions ([360d7b8](https://github.com/YappyBots/YappyGitLab/commit/360d7b8))



