/*
Project by Lachlan Mackenzie

Weather page based on tutorial by youtuber PortEXE (https://youtu.be/ZPG2wGNj6J4)
*/

// My OpenWeatherMap appId
let appId = "96bf07af02afb8da29c7f861541321fc";

// Only getting results in metric. User can change the results to imperial through preferences window
let units = "metric";

let searchMethod;
let countrySelected = false;

// Add event listner to the input field to allow the user to submit by pressing the enter key (keyCode 13)
document.querySelector("#searchInput").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    document.querySelector("#searchButton").click();
  }
});

// Function to determine what search method needs to be used based on the users input
function getSearchMethod(searchTerm){
  // Check length of the entry. Based on 5 right now as that is the length of American zipcodes. Then try to parse the input into an integer and if the result still matches the input then we know it is a series of integers.
  if (searchTerm.length <= 5 && Number.parseInt(searchTerm) + "" === searchTerm) {
    searchMethod = "zip";
  } else {
    searchMethod = "q";
  }
}

// Function for submiting the search term to the API and sends the result to a JSON for use in the init function.
// There are two versions of the search. The first uses the defaults for the API which doesn't include the country code (USA set as default in API). The second includes the country code from the dropdown menu. This second method is mainly for potcode searches nd is entirely optional when searching by city name.
function searchWeather(searchTerm){
  getSearchMethod(searchTerm);

  // Set country value from the country dropdown menu
  let country = document.querySelector("#countrySelect").value;
  // If no country selected
  if (country == 0) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}`).then(result => {
    return result.json();
    }).then(result => {
      init(result);
    })
  } else {
    // Allows search function including counry code to be used
    countrySelected = true;
  }

  // Search term including the country code
  if (countrySelected) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm},${country}&APPID=${appId}&units=${units}`).then(result => {
    return result.json();
    }).then(result => {
      init(result);
    })
    // Reset flag for next search
    countrySelected = false;
  }
  // 'then' is only run after the previous line is complete. In this case allowing the search results to be fetched from the URL and then ensuring the results are sent to a JSON before the init function is called
}

function init(resultFromServer){
  console.log(resultFromServer);
  // Set background image based on the current weather conditions
  switch (resultFromServer.weather[0].main) {
    case "Clear":
      document.body.style.backgroundImage = 'url("img/clear.jpg")';
      break;

    case "Clouds":
      document.body.style.backgroundImage = 'url("img/cloudy.jpg")';
      break;

    case "Rain":
    case "Drizzle":
    case "Mist":
      document.body.style.backgroundImage = 'url("img/rain.jpg")';
      break;

    case "Thunderstorm":
      document.body.style.backgroundImage = 'url("img/storm.jpg")';
      break;

    case "Snow":
      document.body.style.backgroundImage = 'url("img/snow.jpg")';
      break;

    case "Fog":
      document.body.style.backgroundImage = 'url("img/fog.jpg")';

    default:
      break;
  }

  // Function to be called on to update the wind speed element
  function updateWindSpeedElement(){
    switch (windUnits.value){
      case "ms":
        windSpeedElement.innerHTML = "Winds at " + Math.floor(resultFromServer.wind.speed) + "m/s";
        break;
      case "kph":
        windSpeedElement.innerHTML = "Winds at " + Math.floor(resultFromServer.wind.speed * 3.6) + "km/h";
        break;
      case "mph":
        windSpeedElement.innerHTML = "Winds at " + Math.floor(resultFromServer.wind.speed * 2.237) + "mph";
        break;
    }
  }

  function updateTemperatureElements(){
    switch (tempUnits.value){
      case "metric":
        // Current Temp
        temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp) + '&deg;C';
        // Min Temp
        tempMinElement.innerHTML = 'Min: ' + Math.floor(resultFromServer.main.temp_min) + '&deg;C';
        // Max Temp
        tempMaxElement.innerHTML = 'Max: ' + Math.floor(resultFromServer.main.temp_max) + '&deg;C';
        break;
      case "imperial":
        // Current Temp
        temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp * 1.8 + 32) + '&deg;F';
        // Min Temp
        tempMinElement.innerHTML = 'Min: ' + Math.floor(resultFromServer.main.temp_min * 1.8 + 32) + '&deg;F';
        // Max Temp
        tempMaxElement.innerHTML = 'Max: ' + Math.floor(resultFromServer.main.temp_max * 1.8 + 32) + '&deg;F';
        break;
    }
  }

  // Set element variables
  let weatherDescriptionHeader = document.querySelector("#weatherDescriptionHeader");
  let temperatureElement = document.querySelector("#temperature");
  let humidityElement = document.querySelector("#humidity");
  let cityHeader = document.querySelector("#cityHeader");
  let weatherIcon = document.querySelector("#documentIconImg");
  let tempMinElement = document.querySelector("#tempMin");
  let tempMaxElement = document.querySelector("#tempMax");

  let windUnits = document.querySelector("#windUnits");
  let windSpeedElement = document.querySelector("#windSpeed");
  // Event listener for update the wind speed element whenever the wind units select is changed
  windUnits.addEventListener("change", updateWindSpeedElement);

  let tempUnits = document.querySelector("#tempUnits");
  tempUnits.addEventListener("change", updateTemperatureElements);

  // Set the icon image based on the correct image from OpenWeatherMap
  // https://openweathermap.org/weather-conditions
  weatherIcon.src = 'http://openweathermap.org/img/w/' + resultFromServer.weather[0].icon + '.png';

  let resultDescription = resultFromServer.weather[0].description;

  weatherDescriptionHeader.innerText = resultDescription.charAt(0).toUpperCase() + resultDescription.slice(1);

  updateTemperatureElements();

  updateWindSpeedElement();

  cityHeader.innerHTML = resultFromServer.name;

  humidityElement.innerHTML = "Humidity levels at " + resultFromServer.main.humidity + "%";

  setPostionForWeatherInfo();
}

// Add click event to the search button
document.querySelector("#searchButton").addEventListener("click", () => {
  let searchTerm = document.querySelector("#searchInput").value;
  if (searchTerm) {
    searchWeather(searchTerm);
  }
})

function setPostionForWeatherInfo(){
  let weatherContainer = document.querySelector("#weather-container");
  let weatherContainerHeight = weatherContainer.clientHeight;
  let weatherContainerWidth = weatherContainer.clientWidth;

  weatherContainer.style.left = `calc(50% - ${weatherContainerWidth/2}px)`;
  weatherContainer.style.top = `calc(50% - ${weatherContainerHeight/2.5}px)`;
  weatherContainer.style.visibility = 'visible';
}

// ---- Preferences ----
let prefContainer = document.querySelector("#pref-container");
let prefButton = document.querySelector("#prefButton");
let prefWindowSet = false;
let mainSection = document.querySelector("#main-section");
let prefCloseButton = document.querySelector("#prefClose");
prefButton.addEventListener("click", setPrefWindow);
prefCloseButton.addEventListener("click", setPrefWindow);

function setPrefWindow(){
  if (!prefWindowSet) {
    mainSection.style.opacity = 0.5;
    prefContainer.style.visibility = 'visible';
    prefWindowSet = true;
    mainSection.addEventListener("click", setPrefWindow);
  } else if (prefWindowSet){
    mainSection.style.opacity = 1;
    prefContainer.style.visibility = 'hidden';
    prefWindowSet = false;
    mainSection.removeEventListener("click", setPrefWindow);
  }
}