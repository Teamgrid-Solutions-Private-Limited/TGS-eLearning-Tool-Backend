 
const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');

 
function buildXapiZip(course, outputDir = path.resolve('uploads', 'exported-zips')) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName   = `${course.slug || course._id}.zip`;
    const outputPath = path.join(outputDir, fileName);
    const output     = fs.createWriteStream(outputPath);
    const archive    = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(outputPath));
    archive.on('error', reject);

    archive.pipe(output);

    
    const templateDir = path.join(__dirname, 'xapiTemplate');
    archive.directory(templateDir, false);          // flatten into root of ZIP
 
    archive.append(JSON.stringify(course, null, 2), { name: 'course.json' });

    
    archive.finalize();
  });
}

module.exports = { buildXapiZip };
