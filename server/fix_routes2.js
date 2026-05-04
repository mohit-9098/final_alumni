const fs = require('fs');
const path = require('path');

const routesDir = 'd:\\final_alumni\\server\\routes';
const files = ['mou.js', 'notices.js', 'events.js', 'jobs.js'];

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find where GET /:id is
  const idIndex = content.indexOf('// @route   GET /api/' + file.replace('.js', '') + '/:id');
  if (idIndex === -1) return;
  
  // Find where GET /stats or GET /my-posted or GET /my-notices etc are
  const staticRoutes = [];
  
  const extractAndRemove = (searchStr) => {
    const idx = content.indexOf(searchStr);
    if (idx !== -1 && idx > idIndex) { // only if it's defined after /:id
      // Find the end of this route. It usually ends with `});\n` followed by `\n// @route` or `module.exports`
      let endIdx = content.indexOf('// @route', idx + 10);
      if (endIdx === -1) endIdx = content.indexOf('module.exports', idx + 10);
      
      if (endIdx !== -1) {
        const routeContent = content.substring(idx, endIdx);
        content = content.slice(0, idx) + content.slice(endIdx);
        return routeContent;
      }
    }
    return null;
  };

  const statsRoute = extractAndRemove(`// @route   GET /api/${file.replace('.js', '')}/stats`);
  const myEventsRoute = extractAndRemove(`// @route   GET /api/${file.replace('.js', '')}/my-events`);
  const myNoticesRoute = extractAndRemove(`// @route   GET /api/${file.replace('.js', '')}/my-notices`);
  const myPostedRoute = extractAndRemove(`// @route   GET /api/${file.replace('.js', '')}/my-posted`);
  
  let routesToInsert = '';
  if (statsRoute) routesToInsert += statsRoute + '\n';
  if (myEventsRoute) routesToInsert += myEventsRoute + '\n';
  if (myNoticesRoute) routesToInsert += myNoticesRoute + '\n';
  if (myPostedRoute) routesToInsert += myPostedRoute + '\n';
  
  if (routesToInsert) {
    // Insert them right before /:id
    const newIdIndex = content.indexOf('// @route   GET /api/' + file.replace('.js', '') + '/:id');
    content = content.slice(0, newIdIndex) + routesToInsert + content.slice(newIdIndex);
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});
