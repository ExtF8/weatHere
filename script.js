const WEATHER_API_KEY = '8c7f3fa8abbc4c0f8df135204240404';

const API_URL = (city) => {
    return `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=4`;
};

const defaultLocation = 'London';
const unicodeDegreesSymbol = '\u00B0';

async function fetchApi(location) {
    const response = await fetch(API_URL(location), {
        origin: 'cors',
    });
    return response;
}

async function getWeatherData() {
    let currentLocation = document.getElementById('searchBox').value;
    let response;
    if (currentLocation.length == 0) {
        currentLocation = defaultLocation;
    }

    try {
        response = await fetchApi(currentLocation);
    } catch (error) {
        console.error('Error fetching weather data: ', error);
    }

    if (!response.ok) {
        document.getElementById('search').value = '';
        wrongLocationErrorHandler();
        response = await fetchApi(defaultLocation);
    }

    const responseData = await response.json();

    extractValuesForCurrent(responseData);

    extractValuesForForecast(responseData);
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
    localTempInC.innerText = currentData.temperature + unicodeDegreesSymbol;
    localCondition.innerText = currentData.condition;

    updateBorderColor(currentData.conditionCode, currentContainer);
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

        updateBorderColor(data.conditionCode, forecastCard);
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
    tempParagraph.innerText = 'Avg ' + data.temperature + unicodeDegreesSymbol;

    const conditionParagraph = document.createElement('p');
    conditionParagraph.classList.add('next_days_condition');
    conditionParagraph.innerText = data.condition;

    nextDaysContainer.appendChild(timeParagraph);
    nextDaysContainer.appendChild(forecastImg);
    nextDaysContainer.appendChild(tempParagraph);
    nextDaysContainer.appendChild(conditionParagraph);

    return nextDaysContainer;
}

function updateBorderColor(conditionCode, container) {
    container.classList.remove('sunny', 'clouds', 'rain', 'snow');

    const cssClass = conditionCodeToClass[conditionCode];
    if (cssClass) {
        container.classList.add(cssClass);
    }
}

const conditionCodeToClass = {
    1000: 'sunny',
    1003: 'clouds',
    1006: 'clouds',
    1009: 'clouds',
    1030: 'clouds',
    1063: 'rain',
    1066: 'snow',
    1069: 'snow',
    1072: 'rain',
    1087: 'rain',
    1114: 'snow',
    1117: 'snow',
    1135: 'clouds',
    1147: 'clouds',
    1150: 'rain',
    1153: 'rain',
    1168: 'rain',
    1171: 'rain',
    1180: 'rain',
    1183: 'rain',
    1186: 'rain',
    1189: 'rain',
    1192: 'rain',
    1195: 'rain',
    1198: 'rain',
    1201: 'rain',
    1204: 'snow',
    1207: 'snow',
    1210: 'snow',
    1213: 'snow',
    1216: 'snow',
    1219: 'snow',
    1222: 'snow',
    1225: 'snow',
    1237: 'snow',
    1240: 'rain',
    1243: 'rain',
    1246: 'rain',
    1249: 'rain',
    1252: 'snow',
    1255: 'snow',
    1258: 'snow',
    1261: 'snow',
    1264: 'snow',
    1273: 'rain',
    1276: 'rain',
    1279: 'snow',
    1282: 'snow',
};

function wrongLocationErrorHandler() {
    return alert('Enter correct city name');
}

getWeatherData();
