const EventResponse = require('../EventResponse');

class Unkown extends EventResponse {
    constructor(...args) {
        super(...args, {
            description: `This response is shown whenever an event fired isn't found.`,
        });
    }
    embed(data, eventName, actionName) {
        const action = actionName ? `/${actionName}` : '';
        return {
            color: 'danger',
            title: `Repository sent unknown event: \`${eventName}${action}\``,
            description: `This most likely means the developers have not gotten to styling this event.\nYou may want to disable this event if you don't want it with \`GL! conf filter events disable ${eventName}${action}\``,
        };
    }
    text(data, eventName, actionName) {
        const action = actionName ? `/${actionName}` : '';
        return [
            `🛑 An unknown event has been emitted.`,
            'This most likely means the developers have not gotten to styling this event.',
            `The event in question was \`${eventName}${action}\``,
        ].join('\n');
    }
}

module.exports = Unkown;
