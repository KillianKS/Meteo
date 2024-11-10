const container = document.querySelector('.container');
const inputPart = document.querySelector('.input-part');
const input = document.querySelector('.input');
const btn = document.querySelector('.btn-location');
const btn2 = document.querySelector('.btn-search');
const degrees = document.querySelector('.degrees');
const weather = document.querySelector('.weather');
const daytime = document.querySelector('.daytime');
const img = document.querySelector('img');
const city = document.querySelector('.city');


const key2 = 'd790cae0c10443ffb1f134221240811'; // WeatherAPI
const key = '28a46ed081fa271f6e1f3b7415825368'; // OpenWeather


getWeatherByCity('Paris', false);

btn.addEventListener('click', () => {
    btn.textContent = 'Chargement ...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert('Vous devez activer la géolocalisation !');
    }
});

btn2.addEventListener('click', () => {
    const ville = input.value.trim();
    input.value = "";
    
    if (ville) {
        getWeatherByCity(ville, true);
    } else {
        alert('Veuillez entrer une ville.');
    }
});

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    getWeatherData(apiUrl, displayWeather, false);
}

function getWeatherByCity(city, isWeatherAPI = true) {
    const apiUrl = isWeatherAPI
        ? `https://api.weatherapi.com/v1/forecast.json?key=${key2}&q=${city}&days=3&aqi=no&alerts=no`
        : `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`;
    getWeatherData(apiUrl, displayWeather, isWeatherAPI);
}


function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}


function getWeatherData(apiUrl, displayCallback, isWeatherAPI) {
    axios.get(apiUrl)
        .then(response => response.data)
        .then(data => displayCallback(data, true, isWeatherAPI))
        .catch(error => {
            console.error("Error fetching data:", error);
            alert("Erreur lors de la récupération des données météo.");
        });
}

function getUTCTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return [date.getHours(), date.getMinutes()];
}


function displayWeather(data, isCurrentWeather = true, isWeatherAPI = true) {
    btn.textContent = 'Geolocate Me';
    console.log(data);
    if (isWeatherAPI) {
        const temperature = isCurrentWeather
            ? data.current?.temp_c
            : data.forecast?.forecastday[0]?.day.avgtemp_c;

        degrees.textContent = temperature !== undefined ? Math.floor(temperature) + '°C' : "N/A";
        city.textContent = `${data.location?.name}, ${data.location?.country}`;
        weather.textContent = data.current?.condition?.text;
        const [hours, minutes] = getUTCTime(data.location?.localtime_epoch);
        const daynight = (hours >= 18 || hours <= 6) ? "Night" : "Day";
        daytime.textContent = `${hours}:${minutes} | ${daynight}`;
        img.src = data.current?.condition?.icon
            ? `https:${data.current?.condition?.icon}`
            : 'assets/clouds.png';

        const existingForecastContainer = document.querySelector('.forecast');
        if (existingForecastContainer) {
            existingForecastContainer.remove();
        }    
        const forecastContainer = document.createElement('div');
        forecastContainer.classList.add('forecast');
        console.log(data);
        console.log(data.forecast);
        data.forecast.forecastday.slice(0, 3).forEach(day => {
            
            const forecastAtNoon = day.hour.find(hour => hour.time.includes("12:00"));

            if (forecastAtNoon) {
                const temp = Math.floor(forecastAtNoon.temp_c); 
                const icon = forecastAtNoon.condition.icon;

                const forecastItem = document.createElement('div');
                forecastItem.classList.add('forecast-item');

                const forecastTemp = document.createElement('span');
                forecastTemp.classList.add('forecast-temp');
                forecastTemp.textContent = `${temp}°C`;

                const forecastIcon = document.createElement('img');
                forecastIcon.classList.add('forecast-icon');
                forecastIcon.src = `https:${icon}`; 

                forecastItem.appendChild(forecastIcon);
                forecastItem.appendChild(forecastTemp);
                forecastContainer.appendChild(forecastItem);
            }

        });

        const lastWeatherElement = city.parentElement;
        lastWeatherElement.appendChild(forecastContainer);
    }

    else {
        const existingForecastContainer = document.querySelector('.forecast');
        if (existingForecastContainer) {
            existingForecastContainer.remove();
        }    
        const temperature = isCurrentWeather
            ? data.main?.temp 
            : data.list[0]?.main?.temp;

        degrees.textContent = temperature !== undefined ? Math.floor(temperature) + '°C' : "N/A";
        city.textContent = `${data.name}, ${data.sys?.country}`;
        weather.textContent = data.weather?.[0]?.description;
        const [hours, minutes] = getUTCTime(data.dt);
        const daynight = (hours >= 18 || hours <= 6) ? "Night" : "Day";
        daytime.textContent = `${hours}:${minutes} | ${daynight}`;
        img.src = data.weather?.[0]?.icon
            ? `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}.png`
            : 'assets/clouds.png';

        
    }
}
