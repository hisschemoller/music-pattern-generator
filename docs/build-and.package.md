# Build and package

## Run locally in browser

A script in package.json starts Node.js and runs a simple Express app to serve the app in the browser on http://localhost:3008

```json
"scripts": {
  "start": "node server.js",
}
```

## Run locally in app

NW.js (http://docs.nwjs.io) is used to package the app as a standalone application.

The SDK version of NW has the Chrome developer tools, so that's used for development. The advantage of NW over Electron is that it has the option `--disable-raf-throttling` which allows requestAnimationFrame to run when the app is in the background, hidden by other windows. Due to a [bug](https://github.com/electron/electron/issues/9567) in Chromium this doesn't work in Electron.

NW can be installed as a development dependency. A script in package.json can run the project locally:

```json
{
  "scripts": {
    "start-nw": "nw --disable-raf-throttling",
  },
  "devDependencies": {
    "nw": "0.36.4-sdk"
  }
}
```

## Package as app for Mac

1. Download the Mac OS X 64-bit release from https://nwjs.io/downloads/ and unzip the download.
2. Package all the files in the `/src` directory into a zip file and rename it `app.nw`.
3. Put `app.nw` inside the downloaded Mac release, in `nwjs.app/Contents/Resources/`. (right click on `nwjs.app` and choose 'Show Package Contents' to open it)
4. To add the app icons, copy `/assets/icons/mac/icons.icns` and paste it into `nwjs.app/Contents/Resources/` as well. Rename the file to `app.icns` so it will replace the existing default icons.
5. Also overwrite `nwjs.app/Contents/Resources/documents.icns` with the `icons.icns` file.

The file `nwjs.app` is now an executable that runs the app. Copy and rename it to `MusicPatternGenerator.app`. Doubleclick the app to run it.

## Create an installer dmg file for Mac

1. On a Mac, create a new folder named `mpg-installer`.
2. Copy the app into the folder.
3. Start Disk Utility.
4. Go to File > New Image > Image from Folder... and choose the new folder.
5. Set the name to `music-pattern-generator_${version}.dmg`
6. Choose a destination folder where to save the installer.
7. Click the "Save" button.

### Create the template

1. Start Disk Utility.
2. Go to File > New Image > Blank Image...
3. Set the file name of the the image to `InstallerTemplate.dmg`.
4. Choose a destination folder where to save the installer.
5. Name the image 'InstallerTemplate'.
6. Select a size that's enough for the size of the app, 320MB.
7. Lease the other fields as they are.
8. Click 'Save' to create the dmg file.
9. Doubleclick `InstallerTemplate.dmg` to open it. It will show up in finder as a device.
10. In the Finder menu choose View > Show View Options.
11. Customize the look of the folder. Set it to Icon View, larger icons etc.
12. Drag the `music-pattern-generator.app` file into the folder.
13. Organize the icons within the folder.
14. Eject the disk image.

### Build the final DMG

1. Start Disk Utility.
3. Choose Images > Convert... from the menu.
2. Select `InstallerTemplate.dmg` just created.
4. Enter the name of the final image, `music-pattern-generator_${version}.dmg`.
5. Select Compressed as the Image Format.
6. Click 'Save' to create the dmg file.












DMG creation resources:

- https://kb.parallels.com/en/123895
- https://www.renedohmen.nl/blog/2012/04/building-fancy-dmg-images-on-mac-os-x/

## Package for Linux

1. Download a Linux 32 or 64 bit release from https://nwjs.io/downloads/ and unzip the download.
2. Copy all files in the `/src` directory of the project into the root directory on the downloaded package. In my case it's called `nwjs-sdk-v0.37.0-linux-x64`. So your source files and `package.json` manifest file will be in the same directory as the downloaded `nw` file.
3. Copy the `/music-pattern-generator.desktop` file to the root of the downloaded linux package.
4. Copy the `/assets/icons/icon.png` icon to the root of the downloaded linux package.
5. (To create a self-extractable installer script, you can use scripts like `shar` or `makeself`.)
6. (To distribute your app through the package management system, like `apt`, `yum`, `pacman` etc, please follow their official documents to create the packages.)


### Linux .desktop file

In GNOME and other freedesktop.org-compliant desktops, an application gets registered into the desktop's menus through a desktop entry, which is a text file with .desktop extension. This desktop file contains a listing of the configurations for your application.

- The file should have a unique descriptive filename without spaces. I use `music-pattern-generator.desktop`.
- The location should be:
  - `/usr/share/applications directory` to be accessible by everyone or
  - `/.local/share/applications` to be accessible to a single user.

Desktop file resources:

- https://wiki.archlinux.org/index.php/Desktop_entries
- https://developer.gnome.org/integration-guide/stable/desktop-files.html.en
- https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html

### Manually install on Linux

Download a Linux package and copy the source files and manifest file as in steps 1 and 2 of 'Package for Linux' above.

1. Rename the package to music-pattern-generator.
2. Copy the package to the `/opt` directory.
3. Copy the `music-pattern-generator.desktop` file to `/usr/share/applications`.

To copy to the source files directory and the desktop file use the `cp` command with administrator rights in a terminal:

```bash
$ sudo cp -r /path/to/music-pattern-generator /opt
$ sudo cp /path/to/music-pattern-generator.desktop /usr/share/applications
```

You will now be able to find and run the app just like any program you've installed. No restart or anything needed.

### Create a .deb package for Debian and Ubuntu

- http://www.king-foo.com/2011/11/creating-debianubuntu-deb-packages/

## Package as Windows distribution

1. Download a Windows 32 or 64 bit release from https://nwjs.io/downloads/ and unzip the download.
2. Copy all files in the `/src` directory of the project into the root directory on the downloaded package. Your source files and `package.json` manifest file should be in the same directory as the `nw.exe` file.
3. (Icon for nw.exe can be replaced with tools like Resource Hacker, nw-builder and node-winresourcer.)
4. (You can create an installer to deploy all necessary files onto end user’s system. You can use Windows Installer, NSIS or Inno Setup.)

After step 2 nw.exe will run the app.

Resource hacker resources:

- http://www.angusj.com/resourcehacker/
- https://www.howtogeek.com/75983/stupid-geek-tricks-how-to-modify-the-icon-of-an-.exe-file/

### Windows installers

INNO Setup is voted best at https://www.slant.co/topics/4794/versus/~inno-setup_vs_setup-factory_vs_advanced-installer.

- Download Inno Setup from http://www.jrsoftware.org/isdl.php (The current version is innosetup-5.6.1.exe)
- Install Inno Setup as usual for Windows applications.
- Launch Inno Setup.
- In the Welcome window select to "Create a new script file using the Script Wizard".
- The wizard opens with the Application Information screen:
  - The name of the application (Application name), 
  - its version (Application version), 
  - the company (or person) owner (Application publisher) 
  - the website of the application (Application website). 
  - Then click on next.
- Next is the Application Folder screen;
  - keep the destination base folder at "Program Files folder".
  - application folder name "Music Pattern Generator"
- Application Files
  - For "Application main executable file" browse to `nw.exe`.
  - For "Other application files" add the whole downloaded package with the source files and manifest file.
- Application Icons
  - "Start Menu folder name application": "Music Pattern Generator"
- Application Documentation
  - For "License file" choose the project's `/LICENSE` file.
- Setup Languages
  - Choose English, probably?
- Compiler Settings
  - For "Custom compiler output folder" choose some directory where to save the installer to create.
  - For "Compiler output base file name" use "music-pattern-generator_${version}".
- Click 'Finish'.
- Click 'Compile' to create the installer in the selected directory.


INNO Setup resources:

- http://www.jrsoftware.org/isinfo.php
- https://www.supinfo.com/articles/single/7176-create-installer-with-inno-setup

## Resources

- NW.js
  - https://nwjs.io/
  - https://www.npmjs.com/package/nw
  - http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/
  - https://www.sitepoint.com/cross-platform-desktop-app-nw-js/
  - https://strongloop.com/strongblog/creating-desktop-applications-with-node-webkit/
  - https://github.com/nwjs/nw.js/wiki/how-to-package-and-distribute-your-apps
- Linux
  - https://askubuntu.com/questions/27213/what-is-the-linux-equivalent-to-windows-program-files
  - https://stackoverflow.com/questions/40477785/nwjs-how-to-distribute-app-on-linux


