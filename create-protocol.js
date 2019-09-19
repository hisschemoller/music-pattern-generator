const { mainModule } = process, { error } = console;

function createProtocol(scheme, base, normalize = true) {

  const mimeTypeFor = require('./mime-types'),
    { app, protocol } = require('electron'),
    { URL } = require('url'),
    { readFileSync: read } = require('fs'),
    { _resolveFilename: resolve } = require('module');

  // Should only be called after app:ready fires
  if (!app.isReady())
    return app.on('ready', () => createProtocol(...arguments));

  // Normalize standard URLs to match file protocol format
  normalize = !normalize
    ? url => new URL(url).pathname
    : url => new URL(
      url.replace(/^.*?:[/]*/, `file:///`) // `${scheme}://./`
    ).pathname.replace(/[/]$/, '');

  protocol.registerBufferProtocol(
    scheme,
    (request, respond) => {
      let pathname, filename, data, mimeType;
      try {
        // Get normalized pathname from url
        pathname = normalize(request.url);

        // Resolve absolute filepath relative to mainModule
        filename = resolve(`.${pathname}`, mainModule);

        // Read contents into a buffer
        data = read(filename);

        // Resolve mimeType from extension
        mimeType = mimeTypeFor(filename);

        // Respond with mimeType & data
        respond({ mimeType, data });
      } catch (exception) {
        error(exception, { request, pathname, filename, data, mimeType });
      }
    },
    (exception) =>
      exception && error(`Failed to register ${scheme} protocol`, exception)
  );

}

module.exports = createProtocol;
