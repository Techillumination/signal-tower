/* =================================================================
   SIGNAL TOWER — index.js
   ================================================================= */

/* ── Live UTC Clock ─────────────────────────────────────── */
(function tickClock() {
  function update() {
    var now = new Date();
    var h = now.getUTCHours();
    var m = String(now.getUTCMinutes()).padStart(2, '0');
    var s = String(now.getUTCSeconds()).padStart(2, '0');
    var timeStr = h + ':' + m + ':' + s + ' UTC';

    var el = document.getElementById('utcClock');
    if (el) el.textContent = timeStr;

    var elMobile = document.getElementById('utcClockMobile');
    if (elMobile) elMobile.textContent = timeStr;
  }
  update();
  setInterval(update, 1000);
})();

/* ── Device Type ─────────────────────────────────────────── */
/* MUST be outside everything so handleSignal() can use it */
function getDeviceType() {
  var ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

/* ── City (filled by IP fetch after 7s) ─────────────────── */
var userCity = 'Unknown';

/* ── Signal form ─────────────────────────────────────────── */
function handleSignal() {
  var input = document.getElementById('emailInput');
  var hint  = document.getElementById('formHint');
  var val   = input ? input.value.trim() : '';

  /* Validate */
  if (!val || val.indexOf('@') === -1) {
    if (!input) return;
    input.style.transition = 'none';
    input.style.transform  = 'translateX(-5px)';
    setTimeout(function () { input.style.transform = 'translateX(4px)'; }, 70);
    setTimeout(function () {
      input.style.transform = 'translateX(0)';
      input.style.transition = '';
    }, 140);
    input.focus();
    return;
  }

  /* Collect data */
  var now = new Date();
  var payload = {
    email:     val,
    city:      userCity,
    device:    getDeviceType(),
    date:      now.toLocaleDateString('en-IN'),
    time:      now.toUTCString().slice(17, 25) + ' UTC',
    timestamp: now.toISOString(),
    source:    document.referrer || 'direct'
  };

  /* Send to Google Sheet */
  fetch('https://script.google.com/macros/s/AKfycbyA_opjiWEkUb3d54VIpcbfVSS7WgPugwv2YXM_2QTnVooZFG85D9kt2KhzbCc9JINW/exec', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  /* Success UI */
  if (input) {
    input.value = '';
    input.placeholder = "You're on the list.";
    input.disabled = true;
    input.style.opacity = '.4';
  }
  if (hint) {
    hint.style.opacity = '0';
    setTimeout(function () {
      hint.textContent = '-- Signal Established --';
      hint.style.opacity = '1';
    }, 380);
  }
}

/* ── Enter key ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('emailInput');
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSignal();
    });
  }
});

/* ── System Status Animation ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var status = document.getElementById('systemStatus');
  if (!status) return;

  var dots = 1;
  var dotAnimation = setInterval(function () {
    status.textContent = 'System Activate' + '.'.repeat(dots);
    dots++;
    if (dots > 4) dots = 1;
  }, 500);

  setTimeout(function () {
    clearInterval(dotAnimation);
    status.textContent = 'High traffic window';
  }, 4000);

  setTimeout(function () {
    fetch('https://ipapi.co/json/')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        userCity = data.city || data.region || 'Unknown';
        status.textContent = '- Signal stronger ' + userCity + ' -';
      })
      .catch(function () {
        status.textContent = '- Signal stronger -';
      });
  }, 7000);

}); /* closes DOMContentLoaded */
