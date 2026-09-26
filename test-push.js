const { execSync } = require('child_process');
try {
  const output = execSync('npx drizzle-kit push', { encoding: 'utf8', stdio: 'pipe' });
  console.log('SUCCESS:', output);
} catch (e) {
  console.log('ERROR:', e.stdout);
}
