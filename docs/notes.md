# Notes

August 2022

Version 2.3 uses an import map in index.html to set the path to three.js. Import maps have an issue
with some browser extensions when these inject ES modules into the page. That was the case with
Apollo Client Devtools in my browser. So that needed to be disabled.

https://github.com/WICG/import-maps/issues/248