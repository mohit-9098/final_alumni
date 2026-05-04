const fs = require('fs');
const path = require('path');

const routesDir = 'd:\\final_alumni\\server\\routes';
const filesToFix = ['users.js', 'mou.js', 'notices.js', 'events.js', 'jobs.js'];

filesToFix.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find where module.exports is
  const exportIndex = content.indexOf('module.exports = router;');
  if (exportIndex === -1) return;
  
  // Find GET /:id route
  // We look for router.get('/:id',
  const getIndex = content.indexOf("router.get('/:id',");
  if (getIndex === -1) return;
  
  // Actually, we want to find the comment block before it too
  // Let's just find the start of the comment block
  const routeDesc = `// @route   GET /api/${file.replace('.js', '')}/:id`;
  let startIndex = content.indexOf(routeDesc);
  if (startIndex === -1) {
    // try generic
    startIndex = content.lastIndexOf('// @route', getIndex);
  }
  
  if (startIndex === -1 || startIndex > getIndex) {
    startIndex = getIndex;
  }
  
  // Find all routes that should be moved down
  // These are /:id routes (GET, PUT, DELETE, POST, etc.)
  // We can just extract everything from startIndex to exportIndex
  // Wait, no. What if there are routes below /:id that are static?
  // We need to move all /:id and /:id/* routes to the bottom.
  // Actually, just moving ALL static routes (routes not containing ':') ABOVE all dynamic routes.
  
  // Simpler approach: let's just do manual string manipulation for each file
});

console.log('Script ran');
