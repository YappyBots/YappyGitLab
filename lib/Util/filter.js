const isFound = (data, item) => data.includes(item) || data.includes(item.split('/')[0]);

module.exports = {
    whitelist: (data = []) => item => (item ? isFound(data, item) : true),
    blacklist: (data = []) => item => (item ? !isFound(data, item) : true),
};
