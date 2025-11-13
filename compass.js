const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");

const compassBackground = document.getElementById("compassBackground");
const qiblaMarker = document.getElementById("qiblaMarker");

const kaabaLat = 21.4225 * Math.PI / 180;
const kaabaLng = 39.8262 * Math.PI / 180;

let qiblaBearing = null;

/* تحويلات */
const degToRad = d => d * Math.PI / 180;
const radToDeg = r => r * 180 / Math.PI;

/* حساب القبلة */
function computeQibla(latDeg, lngDeg) {
    const lat = degToRad(latDeg);
    const lng = degToRad(lngDeg);
    const dLng = kaabaLng - lng;

    const y = Math.sin(dLng) * Math.cos(kaabaLat);
    const x = Math.cos(lat) * Math.sin(kaabaLat) -
              Math.sin(lat) * Math.cos(kaabaLat) * Math.cos(dLng);

    return (radToDeg(Math.atan2(y, x)) + 360) % 360;
}

function handleOrientation(event) {
    if (!qiblaBearing) return;

    let heading;

    if (event.webkitCompassHeading != null) {
        heading = event.webkitCompassHeading;
    } else {
        if (event.alpha == null) return;
        heading = (360 - event.alpha);
    }

    heading = (heading + 360) % 360;

    compassBackground.style.transform = `rotate(${-heading}deg)`;

    qiblaMarker.style.transform =
        `translateX(-50%) rotate(${qiblaBearing - heading}deg)`;

    const diff = Math.abs((qiblaBearing - heading + 540) % 360 - 180);

    if (diff < 12) {
        messageEl.textContent = "القبلة في هذا الاتجاه";
    } else {
        messageEl.textContent = "اتجه نحو القبلة";
    }
}

/* طلب الموقع */
navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    qiblaBearing = computeQibla(lat, lng);
    statusEl.textContent = "تم تحديد موقعك.";

    /* طلب إذن الحساسات */
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().then(res => {
            if (res === "granted") {
                window.addEventListener("deviceorientation", handleOrientation);
                statusEl.textContent = "جاهز.";
            } else {
                statusEl.textContent = "تم رفض إذن البوصلة.";
            }
        });
    } else {
        window.addEventListener("deviceorientation", handleOrientation);
        statusEl.textContent = "جاهز.";
    }

}, err => {
    statusEl.textContent = "تعذر تحديد موقعك.";
});
