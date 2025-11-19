const cityInput = document.getElementById('city-input');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const weatherSection = document.getElementById('weather-section');
    const countrySection = document.getElementById('country-section');
    const countryLink = document.getElementById('country-link');
    const backButton = document.getElementById('back-button');
    const locationBtn = document.getElementById('location-btn');

    let currentCountryName = '';
    let currentLat = null;
    let currentLon = null;
    let currentLayer = 'temp';


  const weatherVideo = document.getElementById("weather-bg-video");
  const countryVideo = document.getElementById("country-bg-video");

function switchToCountryView() {
  document.body.classList.add('country-view');
  weatherSection.style.display = 'none';
  countrySection.style.display = 'block';
  

  document.getElementById('weather-bg-video').style.display = 'none';
  document.getElementById('country-bg-video').style.display = 'block';
}

function switchToWeatherView() {
  document.body.classList.remove('country-view');
  weatherSection.style.display = 'block';
  countrySection.style.display = 'none';
  
  document.getElementById('weather-bg-video').style.display = 'block';
  document.getElementById('country-bg-video').style.display = 'none';
}

if (countryLink) {
  countryLink.addEventListener('click', function(e) {
    e.preventDefault();
    switchToCountryView();
  });
}

if (backButton) {
  backButton.addEventListener('click', function() {
    switchToWeatherView();
  });
}

  countryLink.addEventListener("click", () => {
    weatherSection.style.display = "none";
    countrySection.classList.add("show");

    weatherVideo.style.display = "none";
    countryVideo.style.display = "block";
  });

  const backBtn = document.getElementById("back-btn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      countrySection.style.display = "none";
      weatherSection.classList.add("show");
      weatherVideo.style.display = "block";
      countryVideo.style.display = "none";
    });
  }

    cityInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        searchWeather();
      }
    });

    countryLink.addEventListener('click', function() {
      if (currentCountryName) {
        showCountryDetails(currentCountryName);
      }
    });

    backButton.addEventListener('click', function() {
      countrySection.classList.remove('show');
      weatherSection.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function searchWeather() {
      const city = cityInput.value.trim();
      
      if (!city) {
        showError('Please enter a city name');
        return;
      }

      hideAll();
      loading.classList.add('show');

      fetch(`https://api.weatherapi.com/v1/forecast.json?key=cc44f9a2485f4c548b690317251211&q=${city}&days=7&aqi=yes&alerts=yes`)
        .then(response => {
          if (!response.ok) {
            throw new Error('City not found');
          }
          return response.json();
        })
        .then(data => {
          displayWeather(data);
          loading.classList.remove('show');
          weatherSection.classList.add('show');
          window.scrollTo({ top: document.querySelector('.weather-section').offsetTop - 20, behavior: 'smooth' });
        })
        .catch(err => {
          loading.classList.remove('show');
          showError('City not found. Please try another city.');
        });
    }

    function searchWeatherByCoords(lat, lon) {
      fetch(`https://api.weatherapi.com/v1/forecast.json?key=cc44f9a2485f4c548b690317251211&q=${lat},${lon}&days=7&aqi=yes&alerts=yes`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Location not found');
          }
          return response.json();
        })
        .then(data => {
          displayWeather(data);
          loading.classList.remove('show');
          weatherSection.classList.add('show');
          window.scrollTo({ top: document.querySelector('.weather-section').offsetTop - 20, behavior: 'smooth' });
        })
        .catch(err => {
          loading.classList.remove('show');
          showError('Unable to fetch weather for your location.');
        });
    }

    function displayWeather(data) {
      const location = data.location;
      const current = data.current;
      const forecast = data.forecast;

      currentLat = location.lat;
      currentLon = location.lon;

      document.getElementById('location-name').textContent = `${location.name}, ${location.region}`;
      document.getElementById('country-name').textContent = location.country;
      currentCountryName = location.country;

      document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
      document.getElementById('temp-value').textContent = `${Math.round(current.temp_c)}°C`;
      document.getElementById('temp-condition').textContent = current.condition.text;

      document.getElementById('feels-like').textContent = `${Math.round(current.feelslike_c)}°C`;
      document.getElementById('humidity').textContent = `${current.humidity}%`;
      document.getElementById('wind-speed').textContent = `${current.wind_kph} km/h`;
      document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
      document.getElementById('visibility').textContent = `${current.vis_km} km`;
      document.getElementById('uv-index').textContent = current.uv;
      document.getElementById('local-time').textContent = location.localtime.split(' ')[1];
      document.getElementById('region').textContent = location.region || 'N/A';
      document.getElementById('timezone').textContent = location.tz_id || 'N/A';
      document.getElementById('lat-lon').textContent = `Lat: ${location.lat}, Lon: ${location.lon}`;
      document.getElementById('last-updated').textContent = current.last_updated;
      document.getElementById('wind-direction').textContent = current.wind_dir || 'N/A';
      

      const existingAlerts = document.querySelectorAll('.alert-banner');
      existingAlerts.forEach(alert => alert.remove());
      
      if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
        const alertHTML = data.alerts.alert.map(alert => `
          <div class="alert-banner">
            <h4>⚠️ Weather Alert</h4>
            <p><strong>${alert.event}</strong></p>
            <p>${alert.headline}</p>
          </div>
        `).join('');
        document.querySelector('.weather-card').insertAdjacentHTML('afterbegin', alertHTML);
      }

      displayForecast(forecast.forecastday);

      displayHourlyForecast(forecast.forecastday[0].hour);

      displayWeatherMap(location.lat, location.lon);

      displayAstronomy(forecast.forecastday[0], current);
    }

    function displayForecast(forecastDays) {
      const container = document.getElementById('forecast-container');
      container.innerHTML = '';

      forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const dayCard = `
          <div class="forecast-day">
            <div class="forecast-date">${dayName}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="forecast-temp">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</div>
            <div class="forecast-condition">${day.day.condition.text}</div>
            <div class="forecast-details">
              <div>💧 ${day.day.daily_chance_of_rain}% rain</div>
              <div>💨 ${Math.round(day.day.maxwind_kph)} km/h</div>
            </div>
          </div>
        `;
        container.innerHTML += dayCard;
      });
    }

    function displayHourlyForecast(hours) {
      const container = document.getElementById('hourly-container');
      container.innerHTML = '';

      hours.forEach(hour => {
        const time = new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        
        const hourCard = `
          <div class="hourly-item">
            <div class="hourly-time">${time}</div>
            <img class="hourly-icon" src="https:${hour.condition.icon}" alt="${hour.condition.text}">
            <div class="hourly-temp">${Math.round(hour.temp_c)}°</div>
            <div style="font-size: 0.8em; color: #888;">💧 ${hour.chance_of_rain}%</div>
          </div>
        `;
        container.innerHTML += hourCard;
      });
    }

    function displayWeatherMap(lat, lon) {
      const mapContainer = document.getElementById('weather-map');

      const zoom = 8;
      const apiKey = '9de243494c0b295cca9337e1e96b00e2'; 
      
      updateMapLayer(lat, lon, currentLayer);

      const layerButtons = document.querySelectorAll('.map-layer-btn');
      layerButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          layerButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentLayer = this.dataset.layer;
          updateMapLayer(lat, lon, currentLayer);
        });
      });
    }

    function updateMapLayer(lat, lon, layer) {
      const mapContainer = document.getElementById('weather-map');
      const zoom = 8;
 
      const layerCodes = {
        'temp': 'temp_new',
        'clouds': 'clouds_new',
        'precipitation': 'precipitation_new',
        'wind': 'wind_new',
        'pressure': 'pressure_new'
      };
      
      const layerCode = layerCodes[layer] || 'temp_new';

      mapContainer.innerHTML = `
        <iframe
          style="width: 100%; height: 100%; border: none;"
          srcdoc='
            <!DOCTYPE html>
            <html>
            <head>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
              <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <script>
                var map = L.map("map").setView([${lat}, ${lon}], ${zoom});
                
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                  attribution: "&copy; OpenStreetMap contributors"
                }).addTo(map);
                
                L.tileLayer("https://tile.openweathermap.org/map/${layerCode}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2", {
                  opacity: 0.6
                }).addTo(map);
                
                L.marker([${lat}, ${lon}]).addTo(map)
                  .bindPopup("Your Location")
                  .openPopup();
              </script>
            </body>
            </html>
          '
        ></iframe>
      `;
    }

    function displayAstronomy(forecastDay, current) {
      const container = document.getElementById('astronomy-grid');
      const astro = forecastDay.astro;
      const aqi = current.air_quality || {};

      container.innerHTML = `
        <div class="astronomy-item">
          <h4>☀️ Sun & Moon</h4>
          <div class="astronomy-detail">
            <span class="astronomy-label">Sunrise</span>
            <span class="astronomy-value">${astro.sunrise}</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Sunset</span>
            <span class="astronomy-value">${astro.sunset}</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Moonrise</span>
            <span class="astronomy-value">${astro.moonrise}</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Moonset</span>
            <span class="astronomy-value">${astro.moonset}</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Moon Phase</span>
            <span class="astronomy-value">${astro.moon_phase}</span>
          </div>
        </div>

        <div class="astronomy-item">
          <h4>🌡️ Temperature Stats</h4>
          <div class="astronomy-detail">
            <span class="astronomy-label">Max Temp</span>
            <span class="astronomy-value">${Math.round(forecastDay.day.maxtemp_c)}°C</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Min Temp</span>
            <span class="astronomy-value">${Math.round(forecastDay.day.mintemp_c)}°C</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Avg Temp</span>
            <span class="astronomy-value">${Math.round(forecastDay.day.avgtemp_c)}°C</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Avg Humidity</span>
            <span class="astronomy-value">${forecastDay.day.avghumidity}%</span>
          </div>
        </div>

        <div class="astronomy-item">
          <h4>🌧️ Precipitation</h4>
          <div class="astronomy-detail">
            <span class="astronomy-label">Total Precipitation</span>
            <span class="astronomy-value">${forecastDay.day.totalprecip_mm} mm</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Chance of Rain</span>
            <span class="astronomy-value">${forecastDay.day.daily_chance_of_rain}%</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">Chance of Snow</span>
            <span class="astronomy-value">${forecastDay.day.daily_chance_of_snow}%</span>
          </div>
        </div>

        ${aqi.pm2_5 ? `
        <div class="astronomy-item">
          <h4>🌫️ Air Quality</h4>
          <div class="astronomy-detail">
            <span class="astronomy-label">PM2.5</span>
            <span class="astronomy-value">${Math.round(aqi.pm2_5)} µg/m³</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">PM10</span>
            <span class="astronomy-value">${Math.round(aqi.pm10)} µg/m³</span>
          </div>
          <div class="astronomy-detail">
            <span class="astronomy-label">US EPA Index</span>
            <span class="astronomy-value">${aqi['us-epa-index'] || 'N/A'}</span>
          </div>
        </div>
        ` : ''}
      `;
    }

    function showCountryDetails(countryName) {
      weatherSection.classList.remove('show');
      countrySection.classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => response.json())
        .then(data => {
          const country = data[0];
          displayCountryInfo(country);
        })
        .catch(err => {
          showError('Could not load country details');
        });
    }

    function displayCountryInfo(country) {
      document.getElementById('country-full-name').textContent = country.name.common;
      document.getElementById('country-flag').innerHTML = `<img src="${country.flags.png}" alt="${country.name.common} flag">`;

      const countryHeader = document.querySelector('.country-header');
      countryHeader.style.setProperty('--flag-url', `url(${country.flags.png})`);
      const headerBefore = document.querySelector('.country-header::before');
      countryHeader.querySelector('::before')?.style.setProperty('background-image', `url(${country.flags.png})`);

      const style = document.createElement('style');
      style.textContent = `
        .country-header::before {
          background-image: url(${country.flags.png}) !important;
        }
      `;
      document.head.appendChild(style);

      const infoGrid = document.getElementById('country-info-grid');
      infoGrid.innerHTML = `
        <div class="country-info-item">
          <p>Capital</p>
          <span>${country.capital ? country.capital[0] : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Population</p>
          <span>${country.population.toLocaleString()}</span>
        </div>
        <div class="country-info-item">
          <p>Region</p>
          <span>${country.region || 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Subregion</p>
          <span>${country.subregion || 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Languages</p>
          <span>${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Currencies</p>
          <span>${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ') : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Area</p>
          <span>${country.area ? country.area.toLocaleString() + ' km²' : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Timezones</p>
          <span>${country.timezones ? country.timezones.join(', ') : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Calling Code</p>
          <span>${country.idd && country.idd.root ? country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '') : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Demonyms</p>
          <span>${country.demonyms && country.demonyms.eng ? `${country.demonyms.eng.m} / ${country.demonyms.eng.f}` : 'N/A'}</span>
        </div>
        <div class="country-info-item">
          <p>Borders</p>
          <span>${country.borders ? country.borders.join(', ') : 'None'}</span>
        </div>
        <div class="country-info-item">
          <p>Gini Index</p>
          <span>${country.gini ? Object.entries(country.gini).map(([year, val]) => `${val} (${year})`).join(', ') : 'N/A'}</span>
        </div>
        
      `;

      if (country.latlng && country.latlng.length === 2) {
        document.getElementById('country-map').innerHTML = `
          <iframe 
            loading="lazy" 
            allowfullscreen 
            src="https://www.openstreetmap.org/export/embed.html?bbox=${country.latlng[1] - 5},${country.latlng[0] - 5},${country.latlng[1] + 5},${country.latlng[0] + 5}&layer=mapnik&marker=${country.latlng[0]},${country.latlng[1]}">
          </iframe>
        `;
      }
    }

    function showError(message) {
      error.textContent = message;
      error.classList.add('show');
      setTimeout(() => {
        error.classList.remove('show');
      }, 3000);
    }

    function hideAll() {
      loading.classList.remove('show');
      error.classList.remove('show');
      weatherSection.classList.remove('show');
      countrySection.classList.remove('show');
    }