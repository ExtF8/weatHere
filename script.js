/**
 * Weather API key.
 *
 * @type { string }
 */
const WEATHER_API_KEY = '8c7f3fa8abbc4c0f8df135204240404';

/**
 * Function to generate the API URL based on the city.
 *
 * @param { string } city - The city for which to fetch weather data.
 * @returns { string } The API URL.
 */
const API_URL = (city) => {
    return `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=3`;
};

/**
 * Default location if no location is provided.
 *
 * @type { string }
 */
const DEFAULT_LOCATION = 'London';

/**
 * Unicode symbol for degrees.
 *
 * @type { string }
 */
const UNICODE_DEGREES_SYMBOL = '\u00B0';

/**
 * URL of the JSON file containing condition code to CSS class mappings.
 *
 * @type { string }
 */
const JSON_FILE_URL = 'conditionCodeToClass.json';

/**
 * String prefix for high temperature.
 *
 * @type { string }
 */
const HIGH_TEMP_STRING = 'H: ';

/**
 * String prefix for low temperature.
 *
 * @type { string }
 */
const LOW_TEMP_STRING = 'L: ';

/**
 * String prefix for wind.
 *
 * @type { string }
 */
const WIND_STRING = 'Wind: ';

/**
 * String suffix for wind speed in meters per second.
 *
 * @type { string }
 */
const WIND_SPEED_MPS = ' m/s';

/**
 * Conversion factor from kilometers per hour to meters per second.
 *
 * @type { number }
 */
const KPH_IN_MPS = 3.6;

/**
 * Event listener for the search box change event.
 *
 */
document.getElementById('searchBox').addEventListener('change', function () {
    clearErrorValuesHandler();
    getWeatherData();
});

/**
 * Fetches the weather data from the API.
 *
 * @param { string } location - The location for which to fetch weather data.
 * @returns { Promise<Response> } A Promise that resolves with the API response.
 * @throws { Error } If there is an error fetching the data.
 */
async function fetchApi(location) {
    const response = await fetch(API_URL(location), {
        origin: 'cors',
    });
    return response;
}

/**
 * Retrieves and updates the weather data based on the user's input location.
 *
 * @throws {Error} If there is an error fetching the data or if the response is not successful.
 */
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

/**
 * Extracts the current weather values from the API response.
 *
 * @param { Object } data - The API response data.
 */
function extractValuesForCurrent(data) {
    const currentLocationName = data.location.name;
    const currentLocalTime = new Date(data.location.localtime);
    const currentIcon = data.current.condition.icon;
    const currentTempInCelsius = data.current.temp_c;
    const currentCondition = data.current.condition.text;
    const conditionCode = data.current.condition.code;
    const windDirection = data.current.wind_dir;
    const windSpeedKph = convertKMHtoMS(data.current.wind_kph);

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

/**
 * Updates the UI with the current weather data.
 *
 * @param { Object } currentData - The current weather data.
 */
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
    windSpeedKph.innerText = currentData.windSpeedKph + WIND_SPEED_MPS;

    updateBorderColor(
        currentData.conditionCode,
        currentContainer,
        currentData.condition
    );
}

/**
 * Extracts the forecast weather values from the API response.
 *
 * @param { Object } data - The API response data.
 */
function extractValuesForForecast(data) {
    // Array to accumulate forecast data
    const nextDaysForecastData = [];
    const forecastData = data.forecast.forecastday;

    for (let i = 0; i < forecastData.length; i++) {
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

/**
 * Updates the UI with the forecast weather data.
 *
 * @param { Array<Object> } forecastData - An array of forecast weather data objects.
 */
function updateForecastUI(forecastData) {
    const forecastContainer = document.querySelector('.forecast_container');

    forecastContainer.innerHTML = '';

    forecastData.forEach((data) => {
        const forecastCard = createForecastCard(data);
        forecastContainer.appendChild(forecastCard);

        updateBorderColor(data.conditionCode, forecastCard, data.condition);
    });
}

/**
 * Creates a forecast card element.
 *
 * @param { Object } data - The forecast weather data.
 * @returns { HTMLElement } The forecast card element.
 */
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

    let windSpeed = convertKMHtoMS(data.maxWindSpeed);

    timeParagraph.innerText = data.time;
    forecastImg.src = data.icon;
    highTempParagraph.innerText =
        HIGH_TEMP_STRING + data.temperatureHigh + UNICODE_DEGREES_SYMBOL;
    lowTempParagraph.innerText =
        LOW_TEMP_STRING + data.temperatureLow + UNICODE_DEGREES_SYMBOL;
    conditionParagraph.innerText = data.condition;
    maxWindSpeed.innerText = WIND_STRING + windSpeed + WIND_SPEED_MPS;

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

/**
 * Fetches a JSON file from the given URL.
 *
 * @param { string } url - The URL of the JSON file.
 * @returns { Promise<Object> } A Promise that resolves with the parsed JSON data.
 * @throws { Error } If there is an error fetching or parsing the JSON file.
 */
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

/**
 * Updates the border color of a container based on the condition code or weather condition.
 * If the weather condition is clear during nighttime, the container border will be set to 'clear'.
 * @param { string } conditionCode - The condition code.
 * @param { HTMLElement } container - The container element.
 * @param { string } condition - The condition.
 */
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

/**
 * Formats a date object into a string.
 *
 * @param { Date } date - The date object to format.
 * @param { boolean } [includeTime=true] - Whether to include the time in the formatted string.
 * @returns { string } The formatted date string.
 */
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

/**
 * Converts a wind speed from kilometers per hour to meters per second.
 *
 * @param { number } kph - The wind speed in kilometers per hour.
 * @returns { string } The wind speed in meters per second.
 */
function convertKMHtoMS(kph) {
    const metersPerSecond = (kph / KPH_IN_MPS).toFixed(0);
    return metersPerSecond;
}

/**
 * Shows the loading animation and hides the weather card and forecast container.
 *
 */
function showLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const cardContainer = document.getElementById('weatherCardContainer');
    const forecastContainer = document.querySelector('.forecast_container');

    cardContainer.style.display = 'none';
    forecastContainer.style.display = 'none';
    loadingIndicator.style.display = 'block';
}

/**
 * Hides the loading animation and shows the weather card and forecast container.
 *
 */
function hideLoadingAnimation() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const cardContainer = document.getElementById('weatherCardContainer');
    const forecastContainer = document.querySelector('.forecast_container');

    cardContainer.style.display = 'flex';
    cardContainer.style.flexDirection = 'column';
    forecastContainer.style.display = 'flex';
    loadingIndicator.style.display = 'none';
}

/**
 * Handles the error when the location is not found.
 *
 */
function wrongLocationErrorHandler() {
    const searchBox = document.getElementById('searchBox');
    const errorText = document.getElementById('errorText');

    searchBox.classList.add('error');
    errorText.style.visibility = 'visible';
}

/**
 * Clears the error values and removes the error styling from the search box.
 *
 */
function clearErrorValuesHandler() {
    const searchBox = document.getElementById('searchBox');
    const errorText = document.getElementById('errorText');

    searchBox.classList.remove('error');
    errorText.style.visibility = 'hidden';
}

// Initial call to fetch and display weather data
getWeatherData();
