const WEATHER_API_KEY = '8c7f3fa8abbc4c0f8df135204240404';

const API_URL = (city) => {
    return `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=4`;
};

const DEFAULT_LOCATION = 'London';
const UNICODE_DEGREES_SYMBOL = '\u00B0';
const JSON_FILE_URL = 'conditionCodeToClass.json';

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
    const currentLocalTime = data.location.localtime;
    const currentIcon = data.current.condition.icon;
    const currentTempInCelsius = data.current.temp_c;
    const currentCondition = data.current.condition.text;
    const conditionCode = data.current.condition.code;

    const currentData = {
        name: currentLocationName,
        time: currentLocalTime,
        icon: currentIcon,
        temperature: currentTempInCelsius,
        condition: currentCondition,
        conditionCode: conditionCode,
    };

    updateCurrentUI(currentData);
}

function updateCurrentUI(currentData) {
    const locationName = document.getElementById('currentLocation');
    const localTime = document.getElementById('currentDate');
    const localIcon = document.getElementById('currentIcon');
    const localTempInC = document.getElementById('currentTemp');
    const localCondition = document.getElementById('currentCondition');
    const currentContainer = document.querySelector('.current_container');

    locationName.innerText = currentData.name;
    localTime.innerText = currentData.time;
    localIcon.src = currentData.icon;
    localTempInC.innerText = currentData.temperature + UNICODE_DEGREES_SYMBOL;
    localCondition.innerText = currentData.condition;

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
        const nextDayTime = forecastData[i].date;
        const nextDayIcon = forecastData[i].day.condition.icon;
        const nextDayTempInCelsius = forecastData[i].day.avgtemp_c;
        const nextDayCondition = forecastData[i].day.condition.text;
        const nextDayConditionCode = forecastData[i].day.condition.code;

        // Push the forecast data for next day into the array
        nextDaysForecastData.push({
            time: nextDayTime,
            icon: nextDayIcon,
            temperature: nextDayTempInCelsius,
            condition: nextDayCondition,
            conditionCode: nextDayConditionCode,
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
    nextDaysContainer.classList.add('next_days_container');

    const timeParagraph = document.createElement('p');
    timeParagraph.classList.add('next_days_date');
    timeParagraph.innerText = data.time;

    const forecastImg = document.createElement('img');
    forecastImg.classList.add('next_days_icon');
    forecastImg.src = data.icon;

    const tempParagraph = document.createElement('p');
    tempParagraph.classList.add('next_days_temp');
    tempParagraph.innerText =
        'Avg ' + data.temperature + UNICODE_DEGREES_SYMBOL;

    const conditionParagraph = document.createElement('p');
    conditionParagraph.classList.add('next_days_condition');
    conditionParagraph.innerText = data.condition;

    nextDaysContainer.appendChild(timeParagraph);
    nextDaysContainer.appendChild(forecastImg);
    nextDaysContainer.appendChild(tempParagraph);
    nextDaysContainer.appendChild(conditionParagraph);

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
    try {
        const conditionCodeToClass = await fetchJsonFile(JSON_FILE_URL);

        container.classList.remove('sunny', 'clouds', 'rain', 'snow', 'clear');

        const cssClass = conditionCodeToClass[conditionCode];

        if (condition == 'Clear') {
            container.classList.add('clear');
        } else if (cssClass) {
            container.classList.add(cssClass);
        }
    } catch (error) {
        console.error('Error fetching or processing JSON file:', error);
    }
}

function showLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const currentContainer = document.querySelector('.current_container');
    const forecastContainer = document.querySelector('.forecast_container');

    currentContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
    loadingIndicator.style.display = 'block';
}

function hideLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const currentContainer = document.querySelector('.current_container');
    const forecastContainer = document.querySelector('.forecast_container');

    currentContainer.style.display = 'flex';
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
