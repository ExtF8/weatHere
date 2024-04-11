const WEATHER_API_KEY = '8c7f3fa8abbc4c0f8df135204240404';

const API_URL = (city) => {
    return `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=4`;
};

const DEFAULT_LOCATION = 'London';
const UNICODE_DEGREES_SYMBOL = '\u00B0';
const JSON_FILE_URL = 'conditionCodeToClass.json';
const HIGH_TEMP_STRING = 'H: ';
const LOW_TEMP_STRING = 'L: ';
const WIND_STRING = 'Wind: ';
const WIND_SPEED_KPH = ' km/h';

document.getElementById('searchBox').addEventListener('change', function () {
    clearErrorValuesHandler();
    getWeatherData();
});

async function fetchApi(location) {
    const response = await fetch(API_URL(location), {
        origin: 'cors',
    });
    return response;
}

async function getWeatherData() {
    showLoadingAnimation();
    let currentLocation = document.getElementById('searchBox').value;
    let response;

    if (currentLocation.length == 0) {
        currentLocation = DEFAULT_LOCATION;
    }

    try {
        response = await fetchApi(currentLocation);
    } catch (error) {
        console.error('Error fetching weather data: ', error);
    }

    if (!response.ok) {
        wrongLocationErrorHandler();
    }

    const responseData = await response.json();

    extractValuesForCurrent(responseData);

    extractValuesForForecast(responseData);

    hideLoadingAnimation();
}

function extractValuesForCurrent(data) {
    const currentLocationName = data.location.name;
    const currentLocalTime = new Date(data.location.localtime);
    const currentIcon = data.current.condition.icon;
    const currentTempInCelsius = data.current.temp_c;
    const currentCondition = data.current.condition.text;
    const conditionCode = data.current.condition.code;
    const windDirection = data.current.wind_dir;
    const windSpeedKph = data.current.wind_kph;

    const formattedDate = formatDate(currentLocalTime, (includeTime = true));

    const currentData = {
        name: currentLocationName,
        time: formattedDate,
        icon: currentIcon,
        temperature: currentTempInCelsius,
        condition: currentCondition,
        conditionCode: conditionCode,
        windDirection: windDirection,
        windSpeedKph: windSpeedKph,
    };

    updateCurrentUI(currentData);
}

function updateCurrentUI(currentData) {
    const currentContainer = document.querySelector('.current_container');
    const locationName = document.getElementById('currentLocation');
    const localTime = document.getElementById('currentDate');
    const localIcon = document.getElementById('currentIcon');
    const localTempInC = document.getElementById('currentTemp');
    const localCondition = document.getElementById('currentCondition');
    const windDirection = document.getElementById('windDirection');
    const windSpeedKph = document.getElementById('windSpeed');

    locationName.innerText = currentData.name;
    localTime.innerText = currentData.time;
    localIcon.src = currentData.icon;
    localTempInC.innerText = currentData.temperature + UNICODE_DEGREES_SYMBOL;
    localCondition.innerText = currentData.condition;
    windDirection.innerText = WIND_STRING + currentData.windDirection;
    windSpeedKph.innerText = currentData.windSpeedKph + WIND_SPEED_KPH;

    updateBorderColor(
        currentData.conditionCode,
        currentContainer,
        currentData.condition
    );
}

function extractValuesForForecast(data) {
    // Array to accumulate forecast data
    const nextDaysForecastData = [];
    const forecastData = data.forecast.forecastday;

    for (let i = 1; i < forecastData.length; i++) {
        const nextDayTime = new Date(forecastData[i].date);
        const nextDayIcon = forecastData[i].day.condition.icon;
        const nextDayHighTempInCelsius = forecastData[i].day.maxtemp_c;
        const nextDayLowTempInCelsius = forecastData[i].day.mintemp_c;
        const nextDayCondition = forecastData[i].day.condition.text;
        const nextDayConditionCode = forecastData[i].day.condition.code;
        const nextDayMaxWind = forecastData[i].day.maxwind_kph;
        const formattedDate = formatDate(nextDayTime, (includeTime = false));

        // Push the forecast data for next day into the array
        nextDaysForecastData.push({
            time: formattedDate,
            icon: nextDayIcon,
            temperatureHigh: nextDayHighTempInCelsius,
            temperatureLow: nextDayLowTempInCelsius,
            condition: nextDayCondition,
            conditionCode: nextDayConditionCode,
            maxWindSpeed: nextDayMaxWind,
        });
    }

    updateForecastUI(nextDaysForecastData);
}

function updateForecastUI(forecastData) {
    const forecastContainer = document.querySelector('.forecast_container');

    forecastContainer.innerHTML = '';

    forecastData.forEach((data) => {
        const forecastCard = createForecastCard(data);
        forecastContainer.appendChild(forecastCard);

        updateBorderColor(data.conditionCode, forecastCard, data.condition);
    });
}

function createForecastCard(data) {
    const nextDaysContainer = document.createElement('div');
    const timeParagraph = document.createElement('p');
    const forecastImg = document.createElement('img');
    const tempContainer = document.createElement('div');
    const highTempParagraph = document.createElement('p');
    const lowTempParagraph = document.createElement('p');
    const conditionParagraph = document.createElement('p');
    const windContainer = document.createElement('div');
    const maxWindSpeed = document.createElement('p');

    nextDaysContainer.classList.add('next_days_container');
    timeParagraph.classList.add('next_days_date');
    forecastImg.classList.add('next_days_icon');
    tempContainer.classList.add('temperature_container_forecast');
    highTempParagraph.classList.add('next_days_temp');
    lowTempParagraph.classList.add('next_days_temp');
    conditionParagraph.classList.add('next_days_condition');
    windContainer.classList.add('wind_container');

    timeParagraph.innerText = data.time;
    forecastImg.src = data.icon;
    highTempParagraph.innerText =
        HIGH_TEMP_STRING + data.temperatureHigh + UNICODE_DEGREES_SYMBOL;
    lowTempParagraph.innerText =
        LOW_TEMP_STRING + data.temperatureLow + UNICODE_DEGREES_SYMBOL;
    conditionParagraph.innerText = data.condition;
    maxWindSpeed.innerText = WIND_STRING + data.maxWindSpeed + WIND_SPEED_KPH;

    tempContainer.appendChild(highTempParagraph);
    tempContainer.appendChild(lowTempParagraph);
    windContainer.appendChild(maxWindSpeed);

    nextDaysContainer.appendChild(timeParagraph);
    nextDaysContainer.appendChild(forecastImg);
    nextDaysContainer.appendChild(tempContainer);
    nextDaysContainer.appendChild(conditionParagraph);
    nextDaysContainer.appendChild(windContainer);

    return nextDaysContainer;
}

async function fetchJsonFile(url) {
    let response;

    try {
        response = await fetch(url);
    } catch (error) {
        console.error('Error fetching json file: ', error);
    }
    const responseData = await response.json();

    return responseData;
}

async function updateBorderColor(conditionCode, container, condition) {
    const conditionCodeToClass = await fetchJsonFile(JSON_FILE_URL);

    container.classList.remove('sunny', 'clouds', 'rain', 'snow', 'clear');

    const cssClass = conditionCodeToClass[conditionCode];

    if (condition == 'Clear') {
        container.classList.add('clear');
    } else if (cssClass) {
        container.classList.add(cssClass);
    }
}

function formatDate(date, includeTime = true) {
    if (includeTime) {
        return date.toLocaleString('en-EU', {
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        });
    } else {
        return date.toLocaleString('en-EU', {
            weekday: 'long',
        });
    }
}

function showLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const cardContainer = document.getElementById('weatherCardContainer');
    const forecastContainer = document.querySelector('.forecast_container');

    cardContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
    loadingIndicator.style.display = 'block';
}

function hideLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const cardContainer = document.getElementById('weatherCardContainer');
    const forecastContainer = document.querySelector('.forecast_container');

    cardContainer.style.display = 'block';
    forecastContainer.style.display = 'flex';
    loadingIndicator.style.display = 'none';
}

function wrongLocationErrorHandler() {
    const searchBox = document.getElementById('searchBox');
    const errorText = document.getElementById('errorText');

    searchBox.classList.add('error');
    errorText.style.visibility = 'visible';
}

function clearErrorValuesHandler() {
    const searchBox = document.getElementById('searchBox');
    const errorText = document.getElementById('errorText');

    searchBox.classList.remove('error');
    errorText.style.visibility = 'hidden';
}

getWeatherData();
