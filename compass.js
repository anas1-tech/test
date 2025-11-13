const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const toggleBtn = document.getElementById("toggle");

const compassBackground = document.getElementById("compassBackground");
const qiblaMarker = document.getElementById("qiblaMarker");
const needle = document.getElementById("needle");

const kaabaLat = 21.4225 * Math.PI / 180;
const kaabaLng = 39.8262 * Math.PI / 180;

let qiblaBearing = null;
let running = false;

function degToRad(d) { return d * Math.PI / 180; }
function radToDeg(r) { return r * 180 / Math.PI; }

function computeQiblaBearing(latDeg, lngDeg) {
    const lat = degToRad(latDeg);
    const lng = degToRad(lngDeg);
    const dLng = kaabaLng - lng;

    const y = Math.sin(dLng) * Math.cos(kaabaLat);
    const x = Math.cos(lat) * Math.sin(kaabaLat) -
              Math.sin(lat) * Math.cos(kaabaLat) * Math.cos(dLng);

    let brng = radToDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
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
    needle.style.transform = "rotate(0deg)";
    qiblaMarker.style.transform =
        `translateX(-50%) rotate(${qiblaBearing - heading}deg)`;

    updateMessage(heading);
}

function computeQiblaBearing(latDeg, lngDeg) {
    const lat = degToRad(latDeg);
    const lng = degToRad(lngDeg);
    const dLng = kaabaLng - lng;

    const y = Math.sin(dLng) * Math.cos(kaabaLat);
    const x = Math.cos(lat) * Math.sin(kaabaLat) -
              Math.sin(lat) * Math.cos(kaabaLat) * Math.cos(dLng);

    let brng = radToDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
}

function startCompass() {
    running = true;
    toggleBtn.textContent = "إيقاف";
    toggleBtn.classList.remove("stopped");

    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(res => {
            if (res === "granted") {
                window.addEventListener("deviceorientation", handleOrientation, true);
            } else {
                statusEl.textContent = "لم يتم السماح بالوصول للحساسات.";
            }
        });
    } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

function stopCompass() {
    running = false;
    toggleBtn.textContent = "ابدأ";
    toggleBtn.classList.add("stopped");

    window.removeEventListener("deviceorientation", handleOrientation);
    statusEl.textContent = "تم إيقاف البوصلة.";
}

toggleBtn.onclick = () => {
    if (!running) {
        getLocation();
        startCompass();
    } else {
        stopCompass();
    }
};
