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
    console.log(responseData);
    extractValuesForCurrent(responseData);

    extractValuesForForecast(responseData);
}

function extractValuesForCurrent(data) {
    const currentLocationName = data.location.name;
    const currentLocalTime = data.location.localtime;
    const currentIcon = data.current.condition.icon;
    const currentTempInCelsius = data.current.temp_c;
    const currentCondition = data.current.condition.text;

    const currentForecastData = {
        name: currentLocationName,
        time: currentLocalTime,
        icon: currentIcon,
        temperature: currentTempInCelsius,
        condition: currentCondition,
    };

    updateCurrentUI(currentForecastData);
}

function updateCurrentUI(currentForecastData) {
    const locationName = document.getElementById('currentLocation');
    const localTime = document.getElementById('currentDate');
    const localIcon = document.getElementById('currentIcon');
    const localTempInC = document.getElementById('currentTemp');
    const localCondition = document.getElementById('currentCondition');

    locationName.innerText = currentForecastData.name;
    localTime.innerText = currentForecastData.time;
    localIcon.src = currentForecastData.icon;
    localTempInC.innerText =
        currentForecastData.temperature + unicodeDegreesSymbol;
    localCondition.innerText = currentForecastData.condition;
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

        // Push the forecast data for next day into the array
        nextDaysForecastData.push({
            time: nextDayTime,
            icon: nextDayIcon,
            temperature: nextDayTempInCelsius,
            condition: nextDayCondition,
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
        'Avg ' + data.temperature + unicodeDegreesSymbol;

    const conditionParagraph = document.createElement('p');
    conditionParagraph.classList.add('next_days_condition');
    conditionParagraph.innerText = data.condition;

    nextDaysContainer.appendChild(timeParagraph);
    nextDaysContainer.appendChild(forecastImg);
    nextDaysContainer.appendChild(tempParagraph);
    nextDaysContainer.appendChild(conditionParagraph);

    return nextDaysContainer;
}

function wrongLocationErrorHandler() {
    return alert('Enter correct city name');
}

getWeatherData();
