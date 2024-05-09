import 'dotenv/config';

const WINDY_API_KEY = process.env.WINDY_API_KEY;

const requestBody = {
    lat: 56.9677,
    lon: 24.1056,
    model: 'iconEu',
    parameters: ['wind', 'dewpoint', 'rh', 'pressure', 'temp'],
    levels: ['surface', '800h', '300h'],
    key: WINDY_API_KEY,
};

const endpointUrl = 'https://api.windy.com/api/point-forecast/v2';

const requestOptions = {
    method: 'POST',
    headers: {
        'Content-type': 'application/json',
    },
    body: JSON.stringify(requestBody),
};

async function fetchApi() {
    const response = await fetch(endpointUrl, requestOptions);
    return response;
}

async function getWeatherData() {
    let response;

    try {
        response = await fetchApi();
    } catch (error) {
        console.error('Error fetching weather data: ', error);
        return;
    }

    const responseData = await response.json();

    // Check if temperature data is available in the response
    if (responseData && responseData['temp-surface']) {
        // Get temperature data for surface level
        const surfaceTemperatures = responseData['temp-surface'];

        // Get the unit for temperature data at surface level
        const surfaceTemperatureUnit = responseData.units['temp-surface'];

        // Print temperature data for surface level
        console.log('Temperature data for surface level:');
        surfaceTemperatures.forEach((temperature, index) => {
            console.log(
                `Timestamp: ${new Date(
                    responseData.ts[index]
                )}, Temperature: ${temperature} ${surfaceTemperatureUnit}`
            );
        });
    } else {
        console.error('Temperature data is not available in the response');
    }
}

getWeatherData();
