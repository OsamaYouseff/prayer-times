import axios from 'axios';
//// DOM variables
let cityInput = document.getElementById("city-input");
let countryInput = document.getElementById("country-input");
let searchBtn = document.getElementById("search-btn");

//// containers
let date = document.getElementById("date");
let day = document.getElementById("day");
let time = document.getElementById("time");
let prayerContainer = document.getElementById("prayer-container");

//// data

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

///// small functions

function from24hTo12h(time) {
  time = time.split(":");
  let hours = checkLess10(+time[0]);

  if (hours < 12) {
    time = hours + ":" + time[1] + " AM";
  } else if (hours === 12) {
    time = hours + ":" + time[1] + " PM";
  } else if (hours === 24) {
    hours -= 12;
    hours = checkLess10(hours);
    time = hours + ":" + time[1] + " AM";
  } else {
    hours -= 12;
    hours = checkLess10(hours);
    time = hours + ":" + time[1] + " PM";
  }
  return time;
}

function checkLess10(num) {
  return num < 10 ? "0" + num : num;
}

function capitalizeStr(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

///// make user input compatible with response
function organizeInputs(city, country) {
  city = capitalizeStr(city);
  country = country.toLowerCase();
  return [city, country];
}

function createTimeBlock(name, time) {
  let TimeBlock = document.createElement("div");
  TimeBlock.classList = "prayer-time animation-effect";
  TimeBlock.innerHTML = `<span class="name">${name}</span><span class="time">${time}</span>`;
  prayerContainer.appendChild(TimeBlock);
}

(function setFullDate() {
  let dateToday = new Date();

  let dayInNumbers = checkLess10(dateToday.getDate());
  let monthInNumbers = checkLess10(dateToday.getMonth() + 1);
  let yearNow = checkLess10(dateToday.getFullYear());
  date.innerHTML = `${dayInNumbers} / ${monthInNumbers} / ${yearNow}`;

  let dayNow = daysOfWeek[dateToday.getDay()];

  day.innerHTML = dayNow;

  // let monthNow = months[dateToday.getMonth()];
  // console.log(monthNow);
})();

function setTimeClock() {
  //// time
  const now = new Date();
  const desiredTimeZoneOffset = -60;
  const adjustedTime = new Date(
    now.getTime() + desiredTimeZoneOffset * 60 * 1000
  );
  let timeString = adjustedTime.toLocaleTimeString("en-US", { hour12: true });

  //// check if hours less than 10 then but 0
  timeString = timeString.split(":");
  timeString[0] = checkLess10(timeString[0]);
  timeString = timeString.join(":");

  time.innerHTML = timeString;
}
setInterval(setTimeClock, 1000);

//// API function using axios library
function getTimes(city, country) {
  return axios
    .get(
      `https://api.aladhan.com/v1/timingsByCity/06-08-2023?city=${city}&country=${country}&fbclid=IwAR0D1g0U7gW-2c24FU7N7mrGfGbKW-Cp20_mzy7Mk9xIygxmshzQ4fn_pcUhttps://api.aladhan.com/v1/timingsByCity/16-07-2023?city=${city}&country=${country}&fbclid=IwAR0D1g0U7gW-2c24FU7N7mrGfGbKW-Cp20_mzy7Mk9xIygxmshzQ4fn_pcU`
    )
    .then((times) => {
      //// convert object into an array
      let prayerName = Object.keys(times.data.data.timings);
      let prayerTimes = Object.values(times.data.data.timings);

      //// filter unwanted times
      prayerName.length = 7;
      prayerTimes.length = 7;

      ////// convert from 24H to 12H
      prayerTimes = prayerTimes.map((time) => {
        return from24hTo12h(time);
      });

      //// clear prayerContainer to add new time
      prayerContainer.innerHTML = "";
      for (let i = 0; i < prayerName.length; i++) {
        createTimeBlock(prayerName[i], prayerTimes[i]);
      }
    })
    .catch((error) => {
      alert("You Enter city or country doesn't exist try Again ");
      console.log(error);
      cityInput.value = "";
      countryInput.value = "";
    });
}

///// when user click button
searchBtn.addEventListener("click", () => {
  if (cityInput.value === "" || countryInput.value === "") {
    alert("you have to all inputs");
  } else {
    let city = organizeInputs(cityInput.value, countryInput.value)[0];
    let country = organizeInputs(cityInput.value, countryInput.value)[1];
    getTimes(city, country);
  }
});
