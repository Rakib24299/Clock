const canvas = document.getElementById('analogCanvas');
const ctx = canvas.getContext('2d');
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const R = cx - 10;

let isDay = false;
let showAnalog = true;
let calOpen = false;

function getColors() {
  return isDay
    ? { bg: '#ffffff', face: '#f0f4f8', rim: '#b0c4d8', tick: '#334', number: '#223', hour: '#1a1a3e', minute: '#1a1a3e', second: '#e74c3c', center: '#e74c3c', shadow: 'rgba(0,0,0,0.15)' }
    : { bg: '#1a1a2e', face: '#16213e', rim: '#0f3460', tick: '#aac', number: '#dde', hour: '#e0e8ff', minute: '#c0d0ff', second: '#ff6b6b', center: '#ff6b6b', shadow: 'rgba(0,100,255,0.2)' };
}

function drawAnalog() {
  const c = getColors();
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr  = (now.getHours() % 12) + min / 60;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Outer glow / shadow
  ctx.shadowColor = c.shadow;
  ctx.shadowBlur = 20;

  // Clock face
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.fillStyle = c.face;
  ctx.fill();
  ctx.strokeStyle = c.rim;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Tick marks & numbers
  for (let i = 1; i <= 60; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = R - (isMajor ? 18 : 8);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * (R - 4), cy + Math.sin(angle) * (R - 4));
    ctx.strokeStyle = c.tick;
    ctx.lineWidth = isMajor ? 3 : 1;
    ctx.stroke();
  }

  // Hour numbers
  ctx.fillStyle = c.number;
  ctx.font = `bold ${R * 0.13}px Segoe UI`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const nr = R - 34;
    ctx.fillText(i, cx + Math.cos(angle) * nr, cy + Math.sin(angle) * nr);
  }

  // Draw hand helper
  function drawHand(angle, length, width, color, rounded = false) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = rounded ? 'round' : 'butt';
    ctx.stroke();
  }

  // Date box (middle right - round) - Draw BEFORE hands
  const date = now.getDate();
  const boxX = cx + R * 0.55;
  const boxY = cy;
  const boxRadius = 18;
  
  ctx.beginPath();
  ctx.arc(boxX, boxY, boxRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = c.tick;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = c.number;
  ctx.font = `bold ${R * 0.12}px Segoe UI`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(date, boxX, boxY);

  // Temperature box (middle left - round)
  const temp = 35; // Fixed temperature
  const tempX = cx - R * 0.55;
  const tempY = cy;
  
  ctx.beginPath();
  ctx.arc(tempX, tempY, boxRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = c.tick;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = c.number;
  ctx.font = `bold ${R * 0.1}px Segoe UI`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${temp}°C`, tempX, tempY);

  // Hour hand
  drawHand((hr / 12) * 2 * Math.PI - Math.PI / 2, R * 0.5, 7, c.hour, true);
  // Minute hand
  drawHand((min / 60) * 2 * Math.PI - Math.PI / 2, R * 0.72, 4, c.minute, true);
  // Second hand (with tail)
  const secAngle = (sec / 60) * 2 * Math.PI - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(secAngle) * R * 0.2, cy - Math.sin(secAngle) * R * 0.2);
  ctx.lineTo(cx + Math.cos(secAngle) * R * 0.85, cy + Math.sin(secAngle) * R * 0.85);
  ctx.strokeStyle = c.second;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
  ctx.fillStyle = c.second;
  ctx.fill();
}

let is12Hour = false;

function updateDigital() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  let hours = now.getHours();
  let ampm = '';
  if (is12Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  document.getElementById('hoursMinutes').textContent = `${pad(hours)}:${pad(now.getMinutes())}`;
  document.getElementById('seconds').textContent = `:${pad(now.getSeconds())}`;
  document.getElementById('ampmDisplay').textContent = ampm;
  document.getElementById('dateDisplay').textContent =
    now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function toggleAmPm() {
  is12Hour = !is12Hour;
  const btn = document.getElementById('ampmBtn');
  btn.textContent = is12Hour ? '24H' : '12H';
  btn.classList.toggle('on', is12Hour);
}

function tick() {
  if (showAnalog) drawAnalog();
  else updateDigital();
  requestAnimationFrame(tick);
}

function toggleMode() {
  isDay = !isDay;
  document.body.classList.toggle('day', isDay);
  document.getElementById('nightBtn').classList.toggle('active', isDay);
}

function toggleClock() {
  showAnalog = !showAnalog;
  document.getElementById('analogClock').classList.toggle('hidden', !showAnalog);
  document.getElementById('digitalClock').classList.toggle('hidden', showAnalog);
  document.getElementById('digitalBtn').classList.toggle('active', !showAnalog);
}

// Calendar
let calDate = new Date();

function toggleCalendar() {
  calOpen = !calOpen;
  document.getElementById('calendarModal').classList.toggle('hidden', !calOpen);
  document.getElementById('calendarBtn').classList.toggle('active', calOpen);
  if (calOpen) renderCalendar();
}

function changeMonth(dir) {
  calDate.setMonth(calDate.getMonth() + dir);
  renderCalendar();
}

function renderCalendar() {
  const today = new Date();
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  document.getElementById('calTitle').textContent =
    calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  let html = days.map(d => `<div class="day-name">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    html += `<div class="day${isToday ? ' today' : ''}">${d}</div>`;
  }
  document.getElementById('calGrid').innerHTML = html;
  
  // Update calendar title to show current date in white when viewing current month
  const titleEl = document.getElementById('calTitle');
  if (month === today.getMonth() && year === today.getFullYear()) {
    titleEl.style.color = '#fff';
  } else {
    titleEl.style.color = '';
  }
}

tick();
