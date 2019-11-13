let polls = [];

module.exports = (server) => {
    const socketIO = require('socket.io').listen(server, {'transports': ['websocket', 'xhr-polling']});

    socketIO.set('origins', '*:*');

    console.log('\x1b[36m%s\x1b[0m', '[DeckDeckGo-Poll]', 'Socket listening');

    socketIO.sockets.on('connection', (socket) => {

        socket.on('poll', async (req) => {
            if (req && req.poll) {
                const key = await generateUniqueAvailableKey(0);

                if (key >= 0) {
                    socket.join(key);

                    await addPoll(key, req.poll);

                    socket.emit('poll_key', key);
                }
            }
        });

        socket.on('leave', async (req) => {
            if (req && req.key) {
                socket.leave(req.key);
            }
        });
    });
};

function addPoll(key, poll) {
    return new Promise(async (resolve) => {
        if (!polls) {
            polls.push({
                key: key,
                poll: poll
            });

            resolve();
            return;
        }

        const index = polls.findIndex((filteredPoll) => {
            return filteredPoll.key === key;
        });

        if (index === -1) {
            polls.push({
                key: key,
                poll: poll
            });
        } else {
            polls[index].poll = poll;
        }

        resolve();
    });
}

function generateUniqueAvailableKey(loop) {
    return new Promise( async (resolve) => {
        let key = Math.floor(100000 + Math.random() * 900000);

        if (!polls) {
            resolve(key);
            return;
        }

        const index = polls.findIndex((filteredPoll) => {
            return filteredPoll.key === key;
        });

        if (index > -1) {
            // Avoid loop without end
            if (loop >= (900000 - 100000)) {
                resolve(undefined);
                return;
            }

            key = await generateKey(loop + 1);
        }

        resolve(key);
    });
}
