module.exports = {
    connection: 'test',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'integer'
        },
        desc: {
            type: 'text'
        },
        value: {
            type: 'integer'
        },
        longFieldName: {
            type: 'string'
        },
        ping: function() {
            return 'pong';
        }
    }
};