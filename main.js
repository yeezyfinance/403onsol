(function () {
  var gate = document.getElementById("gate");
  var site = document.getElementById("site");
  var tear = document.getElementById("tear");
  var rain = document.getElementById("rain");
  var log = document.getElementById("log-lines");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var started = false;
  var revealed = false;

  var attempts = [
    ["GET /identity", "403"],
    ["GET /permission", "403"],
    ["GET /.hidden/403", "403"],
    ["GET /whoami", "403"],
    ["GET /hood", "403"],
    ["POST /access", "403"],
    ["GET /secret", "403"],
    ["GET /inside", "403"]
  ];

  function paintLog() {
    log.innerHTML = attempts.map(function (row) {
      return "<li><span>" + row[0] + "</span><span class=\"deny\">" + row[1] + " FORBIDDEN</span></li>";
    }).join("");
  }

  function sizeCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function corruptText() {
    var nodes = gate.querySelectorAll("h1, p, address");
    nodes.forEach(function (node) {
      if (!node.dataset.raw) node.dataset.raw = node.textContent;
      var raw = node.dataset.raw;
      var out = "";
      for (var i = 0; i < raw.length; i++) {
        if (raw[i] === " ") out += " ";
        else if (Math.random() < 0.28) out += Math.random() > 0.5 ? "0" : "1";
        else if (Math.random() < 0.08) out += "#$%".charAt(Math.floor(Math.random() * 3));
        else out += raw[i];
      }
      node.textContent = out;
    });
  }

  function drawTears(ctx) {
    var w = tear.clientWidth;
    var h = tear.clientHeight;
    ctx.clearRect(0, 0, w, h);
    var bars = 8 + Math.floor(Math.random() * 6);
    for (var i = 0; i < bars; i++) {
      var y = Math.random() * h;
      var bh = 2 + Math.random() * 18;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
      ctx.fillRect((Math.random() - 0.5) * 40, y, w, bh);
    }
    for (var n = 0; n < 40; n++) {
      ctx.fillStyle = "#fff";
      ctx.font = "12px Courier New, monospace";
      ctx.fillText(Math.random() > 0.5 ? "0" : "1", Math.random() * w, Math.random() * h);
    }
  }

  function startRain() {
    if (reduced) return;
    var ctx = sizeCanvas(rain);
    var cols = Math.floor(rain.clientWidth / 14);
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -40;
    function frame() {
      if (!revealed) return;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, rain.clientWidth, rain.clientHeight);
      ctx.fillStyle = "#f2f2f2";
      ctx.font = "13px Courier New, monospace";
      for (var c = 0; c < drops.length; c++) {
        var ch = Math.random() > 0.5 ? "0" : "1";
        ctx.fillText(ch, c * 14, drops[c] * 16);
        if (drops[c] * 16 > rain.clientHeight && Math.random() > 0.975) drops[c] = 0;
        drops[c] += 0.55;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    document.title = "FORBIDDEN — $403";
    document.body.classList.add("broken");
    gate.classList.add("leave");
    site.hidden = false;
    paintLog();
    startRain();
    loadCa();
    setTimeout(function () {
      gate.remove();
    }, 800);
  }

  function breakGate() {
    if (started) return;
    started = true;
    gate.classList.add("corrupting");
    var ctx = sizeCanvas(tear);
    var ticks = 0;
    var timer = setInterval(function () {
      ticks++;
      corruptText();
      drawTears(ctx);
      if (ticks === 8) gate.classList.add("flash");
      if (ticks > 14) {
        clearInterval(timer);
        reveal();
      }
    }, 90);
  }

  if (reduced) {
    document.body.classList.add("reduced");
    setTimeout(reveal, 900);
  } else {
    setTimeout(breakGate, 2200);
  }

  gate.addEventListener("click", breakGate);

  function loadCa() {
    var button = document.getElementById("ca");
    var wait = document.getElementById("ca-wait");
    var hint = document.getElementById("ca-hint");
    var wrap = document.getElementById("chart-wrap");
    var frame = document.getElementById("chart");
    var link = document.getElementById("chart-link");
    fetch("ca.txt?t=" + Date.now(), { cache: "no-store" })
      .then(function (res) { return res.ok ? res.text() : ""; })
      .then(function (text) {
        var ca = "";
        text.split(/\r?\n/).forEach(function (line) {
          line = line.trim();
          if (!ca && line && line.charAt(0) !== "#") ca = line.split(/\s+/)[0];
        });
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca)) return;
        button.hidden = false;
        button.textContent = ca;
        wait.hidden = true;
        hint.hidden = false;
        button.addEventListener("click", function () {
          var done = function () {
            button.classList.add("copied");
            hint.textContent = "copied";
            setTimeout(function () {
              button.classList.remove("copied");
              hint.textContent = "click to copy";
            }, 1200);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ca).then(done).catch(function () {
              fallbackCopy(ca);
              done();
            });
          } else {
            fallbackCopy(ca);
            done();
          }
        });
        var chart = "https://dexscreener.com/solana/" + ca + "?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15";
        frame.src = chart;
        link.href = "https://dexscreener.com/solana/" + ca;
        wrap.hidden = false;
      })
      .catch(function () {});
  }

  function fallbackCopy(value) {
    var area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (err) {}
    area.remove();
  }

  window.addEventListener("resize", function () {
    if (revealed && !reduced) sizeCanvas(rain);
  });
})();
