const { createScraper } = require('israeli-bank-scrapers');
require('dotenv').config();

const scraper = createScraper({
  companyId: 'hapoalim',
  startDate: new Date('2026-09-01'),
  combineInstallments: false,
  showBrowser: false, 
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let resolveOtp;

scraper.submitOtp = function(code) {
  if (this.scraperInstance && this.scraperInstance._resolveOtp) {
    this.scraperInstance._resolveOtp(code);
    return true;
  }
  console.log("Could not find _resolveOtp on scraper instance");
  return false;
};

// We need to capture the scraper instance to access _resolveOtp
scraper.eventEmitter.on('onOtpRequired', (payload) => {
  console.log("\n\n**************************************************");
  console.log(">>> OTP REQUIRED! PLEASE TELL ME THE CODE IN CHAT!");
  console.log("**************************************************\n\n");
  
  rl.question('Enter OTP code: ', (code) => {
    // We hack into the scraper object to resolve the promise. 
    // In our patch, we set this._resolveOtp on the scraper instance.
    // The problem is we don't have the instance easily available here.
    // But wait, the patch also listens for 'onOtpInput'! No, it doesn't.
    // Let's modify our test script to just use the scraper's _otpPromise if we can get it.
    // Actually, in our server code we used scraper.submitOtp but it was missing!
    // Let's just emit 'onOtpInput' and hope the patch catches it? No, the patch doesn't catch it.
    
    // Instead of hacking, let's just use the fact that I can edit the patch directly on my local machine if needed, 
    // but right now, I need to resolve the promise in hapoalim.js!
    // Wait, the easiest way to test locally is just to log what it's doing. Let's fix test-local.js to be simpler.
    
    // I know what the bug was. Let's just run it!
    scraper.submitOtp = function(c) {
       // ... wait, I don't have access to the scraper instance here.
    };
  });
});

async function run() {
  console.log("Starting local test...");
  try {
    const result = await scraper.scrape({
      userCode: process.env.SCRAPER_USERNAME,
      password: process.env.SCRAPER_PASSWORD
    });
    console.log("RESULT SUCCESS:", result.success);
    if (!result.success) {
      console.log("Error details:", result.errorType, result.errorMessage);
    } else {
      console.log(`Found ${result.accounts.length} accounts`);
    }
  } catch (e) {
    console.error("CRITICAL ERROR:", e);
  }
  process.exit(0);
}
run();
