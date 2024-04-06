const WEATHER_API_KEY = '8c7f3fa8abbc4c0f8df135204240404';

const API_URL = (city) => {
    return `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=4`;
};

function setDefaultLocation(location) {
    if (!location || location.trim() === '') {
        return 'London';
    }

    return location;
}

async function getCurrentWeatherInLocation() {
    try {
        let currentLocation = document.getElementById('search').value;
        currentLocation = setDefaultLocation(currentLocation);

        const response = await fetch(API_URL(currentLocation), {
            origin: 'cors',
        });

        if (!response.ok) {
            throw new Error('Network error');
        }

        const responseData = await response.json();

        await getValuesForCurrentDay(responseData);

        await getValuesForForecastDays(responseData);
    } catch (error) {
        console.error('Error fetching weather data: ', error);
    }
}

async function getValuesForCurrentDay(data) {
    try {
        const currentLocationName = await data.location.name;
        const currentLocalTime = await data.location.localtime;
        const currentIcon = await data.current.condition.icon;
        const currentTempInCelsius = await data.current.temp_c.toString();
        const currentCondition = await data.current.condition.text;

        const currentForecastData = {
            name: currentLocationName,
            time: currentLocalTime,
            icon: currentIcon,
            temperature: currentTempInCelsius,
            condition: currentCondition,
        };

        updateUiCurrentForecast(currentForecastData);
    } catch (error) {
        console.error('Error getting values for current location: ', error);
    }
}

function updateUiCurrentForecast(currentForecastData) {
    const locationName = document.getElementById('currentLocation');
    const localTime = document.getElementById('currentDate');
    const localIcon = document.getElementById('currentIcon');
    const localTempInC = document.getElementById('currentTemp');
    const localCondition = document.getElementById('currentCondition');

    locationName.innerText = currentForecastData.name;
    localTime.innerText = currentForecastData.time;
    localIcon.src = currentForecastData.icon;
    localTempInC.innerText = currentForecastData.temperature;
    localCondition.innerText = currentForecastData.condition;
}

async function getValuesForForecastDays(data) {
    try {
        const forecastData = data.forecast.forecastday;
        // Array to accumulate forecast data
        const nextDaysForecastData = [];

        for (let i = 1; i < forecastData.length; i++) {
            const nextDayTime = forecastData[i].date;
            const nextDayIcon = forecastData[i].day.condition.icon;
            const nextDayTempInCelsius =
                forecastData[i].day.avgtemp_c.toString();
            const nextDayCondition = forecastData[i].day.condition.text;

            // Push the forecast data for next day into the array
            nextDaysForecastData.push({
                time: nextDayTime,
                icon: nextDayIcon,
                temperature: nextDayTempInCelsius,
                condition: nextDayCondition,
            });

            updateUiForNextForecast(nextDaysForecastData);
        }
    } catch (error) {
        console.error('Error getting values for current location: ', error);
    }
}

function updateUiForNextForecast(forecastData) {
    const forecastContainer = document.querySelector('.forecast_container');

    forecastContainer.innerHTML = '';

    forecastData.forEach((data) => {
        const nextDaysContainer = document.createElement('div');
        nextDaysContainer.classList.add('next_days_container');

        nextDaysContainer.innerHTML = `
        <p class='next_days_date'>${data.time}</p>
        <img class='next_days_icon' src=${data.icon} />
        <p class='next_days_temp'>${data.temperature}</p>
        <p class='next_days_condition'>${data.condition}</p>
        `;

        forecastContainer.appendChild(nextDaysContainer);
    });
}

getCurrentWeatherInLocation();
