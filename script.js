const prayerTimesEl = document.getElementById("prayer-times");
const cityNameEl = document.getElementById("city-name");

// تحديد المدينة تلقائياً حسب موقع المستخدم
function detectLocation() {
    if (!navigator.geolocation) {
        prayerTimesEl.innerHTML = "المتصفح لا يدعم تحديد الموقع.";
        return;
    }

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

// جلب اسم المدينة من خلال API مجاني
function getCityName(lat, lng) {
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`)
        .then(res => res.json())
        .then(data => {
            cityNameEl.textContent = data.city || data.locality || "غير معروف";
        })
        .catch(() => {
            cityNameEl.textContent = "غير معروف";
        });
}

// جلب مواقيت الصلاة من API
function getPrayerTimes(lat, lng) {
    const apiUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`;

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const timings = data.data.timings;

            prayerTimesEl.innerHTML = `
                <div class="prayer"><span>الفجر</span><span>${timings.Fajr}</span></div>
                <div class="prayer"><span>الشروق</span><span>${timings.Sunrise}</span></div>
                <div class="prayer"><span>الظهر</span><span>${timings.Dhuhr}</span></div>
                <div class="prayer"><span>العصر</span><span>${timings.Asr}</span></div>
                <div class="prayer"><span>المغرب</span><span>${timings.Maghrib}</span></div>
                <div class="prayer"><span>العشاء</span><span>${timings.Isha}</span></div>
            `;
        })
        .catch(() => {
            prayerTimesEl.innerHTML = "حدث خطأ أثناء تحميل مواقيت الصلاة.";
        });
}

// تشغيل التحديد تلقائياً
detectLocation();
