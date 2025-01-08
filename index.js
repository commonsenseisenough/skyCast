const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const grantAccessBtn=document.querySelector("[data-grantAccess]");
const searchInput=document.querySelector("[data-searchInput]");


//initially variables need

let oldTab=userTab;
oldTab.classList.add("current-tab");
let API_KEY = "a46e4ac343ff42a8bc1122535241112";
getfromSessionStorage();






function switchTab(newTab){

    if(newTab !== oldTab){
        
        oldTab.classList.remove("current-tab");
        oldTab=newTab;
        oldTab.classList.add("current-tab");
        if(!searchForm.classList.contains("active")){
            //kya search form wala container is invisible,if yes then make it vsiisble
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            //ab main your weather tab m aagya hu,toh weather bhi display krna pdega,so lets check local storage first
            //or cordinates,if v have saved them there.
            searchForm.classList.add("active");
        }
        else{
            //m pehle search wale tab pr tha ab ur weather tab pr h, toh ur weather wali cls active krni h
            searchForm.classList.remove("active");
            // grantAccessContainer.classList.add("active");
            // userInfoContainer.classList.add("active");
            getfromSessionStorage();
        }

    }
}




userTab.addEventListener("click",()=> {
    //passed clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", ()=>{
    
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage(){
    const localCordinates=sessionStorage.getItem("user-cordinates");
    if(!localCordinates){
        //agar local cordinates nhi mile 
        grantAccessContainer.classList.add("active");

    }
    else{
        const coordinates=JSON.parse(localCordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const{lat,lon}=coordinates;
    //makegrant access invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //api call

    try{
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`);
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);

    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.error("Error fetching weather data:", err);

    }

}

async function getCountryCode(countryName) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        const data = await response.json();
        if (data && data[0] && data[0].cca2) {
            return data[0].cca2.toLowerCase(); // Return country code in lowercase
        } else {
            throw new Error("Country code not found");
        }
    } catch (error) {
        console.error("Error fetching country code:", error);
        return null; // Return null if error occurs
    }
}

async function renderWeatherInfo(weatherInfo){
    //firstly we have to fetch the elements
    const cityName=document.querySelector("[data-cityname]");
    const countryIcon=document.querySelector("[data-CountryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const tempr=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windSpeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch value from weatherinfo object and put in ui element

    cityName.innerText=weatherInfo.location.name;
    countryName=weatherInfo.location.country;

    const countryCode = await getCountryCode(countryName);
    if (countryCode) {
        countryIcon.src = `https://flagcdn.com/w320/${countryCode}.png`;
    } else {
        console.error("Country code not found");
    }
    

    // countryIcon.src = `https://flagcdn.com/w320/${weatherInfo.location.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo.current.condition.text;
    weatherIcon.src = weatherInfo.current.condition.icon || "default-icon.png";  // Use a fallback icon
    //+c apne aap ho jayega
    tempr.innerText = weatherInfo.current.temp_c ? `${weatherInfo.current.temp_c}°C` : "N/A";
    windspeed.innerText=`${weatherInfo.current.wind_kph} km/hr`;
    humidity.innerText=`${weatherInfo.current.humidity} %`;
    cloudiness.innerText=`${weatherInfo.current.cloud} %`;




}



function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //hw
        //show an alert for no geolocation support available
        alert("No Geolocation Supported");
        return;
    }
}

function showPosition(position){
    const userCordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }

    sessionStorage.setItem("user-cordinates",JSON.stringify(userCordinates));
    fetchUserWeatherInfo(userCordinates);


}

grantAccessBtn.addEventListener("click",getLocation)


searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    let cityName=searchInput.value;
    if(cityName===""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active"); // Hide Grant Access Container

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);

        // Check if response is valid
        if (!response.ok) {
            throw new Error("Invalid city or country name");
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    } catch (err) {
        // Hide loading screen and ensure error container is shown
        loadingScreen.classList.remove("active");

        // Log the error for debugging purposes
        console.error("Error fetching weather information:", err);

        // Show toast notification for invalid city
        showToast("Unable to fetch weather information. Please check the city name or try again later.");
    }
}

// Function to show the toast popup
function showToast(message) {
    const toast = document.getElementById("toast");
    const searchForm = document.querySelector("[data-searchForm]");

    toast.textContent = message; // Set the message
    toast.className = "toast show"; // Show the toast

    // Position the toast just below the search form
    const searchFormRect = searchForm.getBoundingClientRect();
    toast.style.top = `${searchFormRect.bottom + window.scrollY + 10}px`; // 10px gap below the search form

    // After 3 seconds, hide the toast
    setTimeout(() => {
        toast.className = toast.className.replace("show", ""); // Hide the toast after 3 seconds
    }, 3000);  // 3000 ms = 3 seconds
}




