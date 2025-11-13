/* ==========================================
   دوال أساسية لكي يعمل حساب اتجاه القبلة
========================================== */

// تحويل درجة إلى راديان
function degToRad(d) {
    return d * Math.PI / 180;
}

// تحويل راديان إلى درجة
function radToDeg(r) {
    return r * 180 / Math.PI;
}

// إحداثيات الكعبة (بالراديان)
const kaabaLat = 21.4225 * Math.PI / 180;
const kaabaLng = 39.8262 * Math.PI / 180;


/* ==========================================
   بقية الكود الأصلي الخاص بالبوصلة
========================================== */

const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");
const toggleBtn = document.getElementById("toggle");

const compassBackground = document.getElementById("compassBackground");
const qiblaMarker = document.getElementById("qiblaMarker");
const needle = document.getElementById("needle");

let qiblaBearing = null;
let running = false;


/* حساب اتجاه القبلة */
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


/* ضبط فرق الزوايا */
function normalizeAngle(a) {
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
}


/* تغيير الرسالة حسب وضع القبلة */
function updateMessage(heading) {
    const diff = Math.abs(normalizeAngle(qiblaBearing - heading));
    if (diff <= 5) {
        messageEl.textContent = "القبلة في هذا الاتجاه";
    } else {
        messageEl.textContent = "اتجه نحو القبلة";
    }
}


/* استقبال دوران الجهاز */
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


/* الحصول على موقع المستخدم */
function getLocation() {
    statusEl.textContent = "جاري تحديد موقعك...";

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        qiblaBearing = computeQiblaBearing(lat, lng);
        statusEl.textContent = "تم تحديد اتجاه القبلة.";

    }, err => {
        statusEl.textContent = "تعذر تحديد الموقع.";
    }, { enableHighAccuracy: true });
}


/* تشغيل البوصلة */
function startCompass() {
    running = true;
    toggleBtn.textContent = "إيقاف";
    toggleBtn.classList.remove("stopped");
    toggleBtn.classList.add("running");

    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(res => {
            if (res === "granted") {
                window.addEventListener("deviceorientation", handleOrientation, true);
            } else {
                statusEl.textContent = "لم يتم السماح بالحساسات.";
            }
        });
    } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}


/* إيقاف البوصلة */
function stopCompass() {
    running = false;
    toggleBtn.textContent = "ابدأ";
    toggleBtn.classList.remove("running");
    toggleBtn.classList.add("stopped");

    window.removeEventListener("deviceorientation", handleOrientation);
    statusEl.textContent = "تم إيقاف البوصلة.";
}


/* زر التشغيل والإيقاف */
toggleBtn.onclick = () => {
    if (!running) {
        getLocation();
        startCompass();
    } else {
        stopCompass();
    }
};
