# Build and package

## Run locally in browser

A script in package.json starts Node.js and runs a simple Express app to serve the app in the browser on http://localhost:3008

```json
"scripts": {
  ...
  "start": "node server.js",
  ...
}
```

## Run locally in app

NW.js (http://docs.nwjs.io) is used to package the app as a standalone application.

The SDK version of NW has the Chrome developer tools, so that's used for development. The advantage of NW over Electron is that it has the option `--disable-raf-throttling` which allows requestAnimationFrame to run when the app is in the background, hidden by other windows. Due to a [bug](https://github.com/electron/electron/issues/9567) in Chromium this doesn't work in Electron.

NW can be installed as a development dependency. A script in package.json can run the project locally:

```json
{
  ...
  "scripts": {
    ...
    "start-nw": "nw --disable-raf-throttling",
    ...
  },
  "devDependencies": {
    ...
    "nw": "0.36.4-sdk"
    ...
  }
  ...
}
```

## Package as Mac app

1. Download the Mac OS X 64-bit release from https://nwjs.io/downloads/
2. Package all the files in the `/src` directory into a zip file and rename it `app.nw`.
3. Put `app.nw` inside the downloaded Mac release, in `nwjs.app/Contents/Resources/`. (right click on `nwjs.app` and choose 'Show Package Contents' to open it)
4. To add the app icons, copy `/assets/icons/mac/icons.icns` and paste it into `nwjs.app/Contents/Resources/` as well. Rename the file to `app.icns` so it will replace the existing default icons.
5. Also overwrite `nwjs.app/Contents/Resources/documents.icns` with the `icons.icns` file.

The file `nwjs.app` is now an executable that runs the app. Copy and rename it to `MusicPatternGenerator.app`. Doubleclick the app to run it.


## Resources

- https://nwjs.io/
- https://www.npmjs.com/package/nw
- http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/
- https://www.sitepoint.com/cross-platform-desktop-app-nw-js/
- https://strongloop.com/strongblog/creating-desktop-applications-with-node-webkit/
- https://github.com/nwjs/nw.js/wiki/how-to-package-and-distribute-your-apps

