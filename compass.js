const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const toggleBtn = document.getElementById("toggle");

const compassBackground = document.getElementById("compassBackground");
const qiblaMarker = document.getElementById("qiblaMarker");
const needle = document.getElementById("needle");

const kaabaLat = 21.4225 * Math.PI / 180;
const kaabaLng = 39.8262 * Math.PI / 180;

let qiblaBearing = null;
let running = false; // افتراضيًا متوقف

function degToRad(d) { return d * Math.PI / 180; }
function radToDeg(r) { return r * 180 / Math.PI; }

function computeQiblaBearing(latDeg, lngDeg) {
    const lat = degToRad(latDeg);
    const lng = degToRad(lngDeg);
    const dLng = kaabaLng - lng;

    const y = Math.sin(dLng) * Math.cos(kaabaLat);
    const x = Math.cos(lat) * Math.sin(kaabaLat) -
              Math.sin(lat) * Math.cos(kaabaLat) * Math.cos(dLng);

    return (radToDeg(Math.atan2(y, x)) + 360) % 360;
}

function normalizeAngle(a) {
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
}

function updateMessage(heading) {
    const diff = Math.abs(normalizeAngle(qiblaBearing - heading));
    if (diff <= 12) {
        messageEl.textContent = "القبلة في هذا الاتجاه";
    } else {
        messageEl.textContent = "اتجه نحو القبلة";
    }
}

function handleOrientation(event) {
    if (!running) return;

    let heading;

    if (event.webkitCompassHeading != null) {
        heading = event.webkitCompassHeading;
    } else {
        const alpha = event.alpha;
        if (alpha == null) return;
        heading = (360 - alpha);
    }

    heading = (heading + 360) % 360;

    compassBackground.style.transform = `rotate(${-heading}deg)`;

    qiblaMarker.style.transform =
        `translateX(-50%) rotate(${qiblaBearing - heading}deg)`;

    updateMessage(heading);
}

function startCompass() {
    running = true;
    toggleBtn.textContent = "إيقاف";
    toggleBtn.classList.remove("stopped");
    toggleBtn.classList.add("running");

    window.addEventListener("deviceorientation", handleOrientation, true);
    statusEl.textContent = "البوصلة تعمل الآن.";
}

function stopCompass() {
    running = false;
    toggleBtn.textContent = "ابدأ";
    toggleBtn.classList.add("stopped");
    toggleBtn.classList.remove("running");

    window.removeEventListener("deviceorientation", handleOrientation);
    statusEl.textContent = "تم إيقاف البوصلة.";
}

function initLocation() {
    statusEl.textContent = "جاري تحديد موقعك...";

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        qiblaBearing = computeQiblaBearing(lat, lng);
        statusEl.textContent = "تم تحديد موقعك.";

    }, err => {
        statusEl.textContent = "تعذر تحديد الموقع.";
    }, { enableHighAccuracy: true });
}

toggleBtn.onclick = () => {
    if (!running) {
        initLocation();
        startCompass();
    } else {
        stopCompass();
    }
};

// تشغيل تلقائي إذا سبق السماح
initLocation();
startCompass();
toggleBtn.classList.add("running");
toggleBtn.textContent = "إيقاف";
