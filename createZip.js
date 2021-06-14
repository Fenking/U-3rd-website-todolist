/**
 * Create a zip file
 */
const JSZip = new require('jszip');
// fs-extra returns a promise if callback is not passed
const fse = require('fs-extra');

// following directories are excluded 
const excludeFiles = [/\/\..*/, /\/node_modules/, /\/dist/, /\/venv/, /\/__pycache__/]
    .concat(process.env.WEBAPP_DEV ? [/\/createTemplates.js/] : []);
// includes everything else
const includeFiles = '*';

const makeFilter = (include, exclude) => (include === '*') ?
    (path) => !exclude.some((x) => path.match(x)) :
    (path) => include.some((x) => path.match(x)) && !exclude.some((x) => path.match(x)) ;

const addFileToZip = async (zip, relpath, path) => {
  const stats = await fse.stat(path);
  const buffer = await fse.readFile(path);
  const zippath = relpath[0] === '/' ? relpath.substring(1) : relpath;
  zip.file(zippath, buffer, {binary: false, date: stats.mtime});
};

const addToZip = async (zip, relpath, path, filter) => {
  if (filter(relpath)) {
    const stats = await fse.stat(path);
    if (stats.isFile()) {
      await addFileToZip(zip, relpath, path);
      console.log('[createZip] file added:', path);
    } else if (stats.isDirectory()) {
      const files = await fse.readdir(path);
      await Promise.all(files.map((file) => addToZip(zip, relpath + '/' + file, path + '/' + file, filter)));
      console.log('[createZip] directory added:', path);
    }
  }
};

module.exports = async (req, res) => {
  try {
    const relpath = req.params.dirname || '';
    const path = __dirname + (req.params.dirname ? '/' + req.params.dirname : '');
    const zipfilename = req.params.dirname || 'webapp';
    const filter = makeFilter(includeFiles, excludeFiles);
    const zip = new JSZip();
    await addToZip(zip, relpath, path, filter);
    const content = await zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'});
    res.setHeader('Content-disposition', 'attachment; filename=' + zipfilename + '.zip');
    res.setHeader('Content-type', 'application/zip');
    res.write(content);
    res.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
};
