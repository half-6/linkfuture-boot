'use strict';
/**
 * Module Name: www
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $http = require('http');
module.exports = app => {
  const $logger = $lf.$logger;
  const $server = $http.createServer(app);
  app.$server = $server;
  const $port = normalizePort(process.env.PORT || '3000');

  app.set('port', $port);
  $server.listen($port, () => {
    $logger.warn(`Start application with ${process.env.NODE_ENV} model`);
  });

  $server.on('error', onError);
  $server.on('listening', onListening);

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof $port === 'string' ? `Pipe ${$port}` : `Port ${$port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        $logger.error(`${bind} requires elevated privileges`);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
        break;
      case 'EADDRINUSE':
        $logger.error(`${bind} is already in use`);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = $server.address();
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    $logger.warn(`Listening on ${bind}`);
  }
};
