// TODO: Donner des messages explicites de retours par JOI
// TODO: Passer un paramètre de delay à l'appli
// TODO: "header HSTS" + "HTTPS"
// TODO: ImmutableJS
// TODO: vérifier que le debug fonctionne tjrs en TS

import * as hapi from 'hapi';
import * as Path from 'path';
import * as Inert from 'inert'; // static file and directory handler module for hapi.
import * as Vision from 'vision';
import * as HapiSwagger from 'hapi-swagger';
import * as Pack from 'pjson';
import * as portfinder from 'portfinder';
import * as socketIo from 'socket.io';
import { DB } from './database';
import { initSockets } from './sockets';

(async () => {

    const apiServerPort = await portfinder.getPortPromise({ port: 3000 });

    const apiServer = new hapi.Server({
        port: process.env.PORT || apiServerPort,
        host: '0.0.0.0',
        routes: {
            cors: true,
            // Needed to serve static unicorn photos
            files: {
                relativeTo: Path.join(__dirname, '../resources')
            },
        },
    });

    await apiServer.register([
        Inert,
        Vision, {
            'plugin': HapiSwagger,
            'options': {
                info: {
                    'title': Pack.name + ' API Documentation',
                    'version': Pack.version,
                }
            }
        }
    ]);

    const socketServerPort = await portfinder.getPortPromise({ port: 3100 });

    const socketServer = new hapi.Server({
        host: '0.0.0.0',
        port: process.env.PORT + 1 || socketServerPort,
        routes: { cors: true },
    });

    const io = socketIo(socketServer.listener);

    const db = new DB(io);

    const capacities = require('./data/capacities');
    const unicorns = require('./data/unicorns');

    db.capacities = capacities.getCapacities();
    db.unicorns = unicorns.getUnicorns(apiServer);

    initSockets(db, io);

    // Add routes
    apiServer.route([
        ...unicorns.getRoutes(db),
        ...capacities.getRoutes(db),
    ]);

    try {
        await apiServer.start();
        await socketServer.start();
    } catch (e) {
        console.log(e);
    }

    console.log('API                 running at:', apiServer.info.uri);
    console.log('Socket              running at:', socketServer.info.uri);
    console.log('API documentation available at:', `${apiServer.info.uri}/documentation`);

})();
