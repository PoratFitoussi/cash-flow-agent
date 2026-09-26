const { execSync } = require('child_process');
try {
  const output = execSync('npx drizzle-kit push </dev/null', { encoding: 'utf8', stdio: 'pipe' });
  console.log('SUCCESS:', output);
} catch (e) {
  console.log('ERROR STATUS:', e.status);
  console.log('ERROR STDOUT:', e.stdout);
}
