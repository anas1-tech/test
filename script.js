const prayerTimesEl = document.getElementById("prayer-times");
const cityNameEl = document.getElementById("city-name");

function detectLocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            getCityName(lat, lng);
            getPrayerTimes(lat, lng);
        },
        error => {
            prayerTimesEl.innerHTML = "فشل تحديد الموقع.";
        },
        { enableHighAccuracy: true }
    );
}

function getCityName(lat, lng) {
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`)
        .then(res => res.json())
        .then(data => {
            cityNameEl.textContent = data.city || data.locality || "غير معروف";
        });
}

function getPrayerTimes(lat, lng) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`)
        .then(res => res.json())
        .then(data => {
            const t = data.data.timings;

            prayerTimesEl.innerHTML = `
                <div class="prayer"><span>الفجر</span><span>${t.Fajr}</span></div>
                <div class="prayer"><span>الشروق</span><span>${t.Sunrise}</span></div>
                <div class="prayer"><span>الظهر</span><span>${t.Dhuhr}</span></div>
                <div class="prayer"><span>العصر</span><span>${t.Asr}</span></div>
                <div class="prayer"><span>المغرب</span><span>${t.Maghrib}</span></div>
                <div class="prayer"><span>العشاء</span><span>${t.Isha}</span></div>`;
        });
}

detectLocation();
