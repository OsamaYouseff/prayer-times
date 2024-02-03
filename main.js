// "use strict";
//// DOM variables
let cityInput = document.getElementById("city-input");
let countryInput = document.getElementById("country-input");
let searchBtn = document.getElementById("search-btn");
let nextPrayerName = document.getElementById("next-prayer");
let remindedTime = document.getElementById("reminded-time");

//// DOM containers
let date = document.getElementById("date");
let day = document.getElementById("day");
let time = document.getElementById("time");
let prayerContainer = document.getElementById("prayer-container");
let prayerTimesAndNames = [];

///////  Global variables
let defaultCity = "Cairo";
let defaultCountry = "egypt";
let dateNow;

//// some data
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

///// changing forms  functions
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

function lesThan10ForAllTime(fullTime) {
  fullTime = fullTime.split(":");

  fullTime[0] = checkLess10(fullTime[0]);
  fullTime[1] = checkLess10(fullTime[1]);
  fullTime[2] = checkLess10(fullTime[2]);

  return fullTime.join(":");
}

function capitalizeStr(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

function from12HtoTimestamp(time) {
  time = time.split(":");
  time[0] = +time[0];
  time[1] = +time[1];
  if (time[2] !== undefined) {
    time[2] = +time[2];
    let timestamp = (time[0] * 60 * 60 + time[1] * 60 + time[2]) * 1000;
    time = timestamp;
  } else {
    let timestamp = (time[0] * 60 * 60 + time[1] * 60) * 1000;
    time = timestamp;
  }
  return time;
}

function fromTimestampTo12h(timestamp) {
  let hours = timestamp / (1000 * 60 * 60);
  let mins = (hours % 1) * 60;
  let seconds = (mins % 1) * 60;

  hours = Math.trunc(hours);
  mins = Math.trunc(mins);
  seconds = Math.trunc(seconds);

  let timeIn12h = `${hours}:${mins}:${seconds}`;

  return timeIn12h;
}

function organizeInputs(city, country) {
  city = capitalizeStr(city);
  country = country.toLowerCase();
  return [city, country];
}

///// getting time functions

(function setFullDate() {
  let dateToday = new Date();

  let dayInNumbers = checkLess10(dateToday.getDate());
  let monthInNumbers = checkLess10(dateToday.getMonth() + 1);
  let yearNow = checkLess10(dateToday.getFullYear());
  date.innerHTML = `${dayInNumbers} / ${monthInNumbers} / ${yearNow}`;

  dateNow = `${dayInNumbers}-${monthInNumbers}-${yearNow}`;

  let dayNow = daysOfWeek[dateToday.getDay()];

  day.innerHTML = dayNow;

  // let monthNow = months[dateToday.getMonth()];
  // console.log(monthNow);
})();

function getTimeNow(need12h) {
  var currentDate = new Date();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var seconds = currentDate.getSeconds();

  if (need12h) {
    // Convert to 12-hour format
    var period = (hours >= 12) ? 'PM' : 'AM';
    hours = (hours % 12) || 12; // Handle midnight (12 AM)
    var formattedTime = hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + ' ' + period;
  } else {
    // Format the time in 24-hour format
    var formattedTime = hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  console.log(formattedTime);
  return formattedTime;
}


function setTimeContainer() {
  timeNow = getTimeNow(true);

  timeNow = timeNow.split(":");
  timeNow[0] = checkLess10(timeNow[0]);
  timeNow = timeNow.join(":");

  time.innerHTML = timeNow;
}
setInterval(setTimeContainer, 1000);

///// logic functions

function createTimeBlock(name, time, num) {
  let TimeBlock = document.createElement("div");
  TimeBlock.classList = `prayer-time ${name} animation-effect `;

  TimeBlock.innerHTML = `<img src="images/icon${num + 1
    }.png" alt="logo-image" /><span class="name">${name}</span><span class="time">${time}</span>`;
  prayerContainer.appendChild(TimeBlock);
}

function compareTimestamp(currentTime, timesArr) {
  for (let i = 0; i < timesArr.length; i++) {
    if (timesArr[i] - currentTime >= 1) {
      return [timesArr[i] - currentTime, i];
    }
  }
}

function getRequest(city, country, date) {
  return axios
    .get(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}&fbclid=IwAR0D1g0U7gW-2c24FU7N7mrGfGbKW-Cp20_mzy7Mk9xIygxmshzQ4fn_pcUhttps://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}&fbclid=IwAR0D1g0U7gW-2c24FU7N7mrGfGbKW-Cp20_mzy7Mk9xIygxmshzQ4fn_pcU`
    )
    .then((times) => {
      //// convert object into an array
      let prayerName = Object.keys(times.data.data.timings);
      let prayerTimes = Object.values(times.data.data.timings);

      //// filter unwanted times
      prayerName.length = 7;
      prayerTimes.length = 7;

      return [prayerName, prayerTimes];
    });
}

function checkRemindedTimeForNextPrayer() {

  let currentTimeStamp = getTimeNow(false);

  //// remove "PM" word from time
  currentTimeStamp = currentTimeStamp.split(" ")[0];

  currentTimeStamp = from12HtoTimestamp(currentTimeStamp);

  ////// get reminded time and next prayer name
  let remindedTimeArr = compareTimestamp(
    currentTimeStamp,
    prayerTimesAndNames[1]
  );


  let remindedTime = fromTimestampTo12h(remindedTimeArr[0]);
  remindedTime = lesThan10ForAllTime(remindedTime);


  let nextPrayerName = prayerTimesAndNames[0][remindedTimeArr[1]];

  return [remindedTime, nextPrayerName];
}

function changeRemindedPrayerTimeContainer() {
  let remindedPrayerTime = checkRemindedTimeForNextPrayer();
  remindedTime.innerHTML = remindedPrayerTime[0];
  nextPrayerName.innerHTML = remindedPrayerTime[1];

  return remindedPrayerTime[1];
}

function setActiveToNextPrayer(prayerName) {
  let prayerNamesInArray = Array.from(
    document.querySelectorAll(".prayer-time")
  );

  for (let i = 0; i < prayerNamesInArray.length; i++) {
    prayerNamesInArray[i].classList.remove("active");
  }
  document.querySelector(`.${prayerName}`).classList.add("active");
}

function getNextDayDate(currentDate) {
  currentDate = currentDate.split("-");
  currentDate[0] = `${Number(currentDate[0]) + 1}`;
  return currentDate.join("-");
}

function addFajrTimeForNextDay(city, country, nextDayDate) {
  getRequest(city, country, nextDayDate).then((date) => {
    let fajrTime = date[1][0];

    fajrTime = `${fajrTime}`.split(":");
    fajrTime[0] = `${Number(fajrTime[0]) + 24}`;
    fajrTime = fajrTime.join(":");

    fajrTime = from12HtoTimestamp(fajrTime);

    prayerTimesAndNames[0].push("Fajr");
    prayerTimesAndNames[1].push(fajrTime);
  });
}

function changeStatus() {
  (function filterSunshineAndSunset() {
    let filteredArrNames = [];
    let filteredArrTimes = [];
    for (let i = 0; i < prayerTimesAndNames[0].length; i++) {
      if (i === 1 || i === 4) {
        continue;
      }
      filteredArrNames.push(prayerTimesAndNames[0][i]);
    }
    for (let i = 0; i < prayerTimesAndNames[1].length; i++) {
      if (i === 1 || i === 4) {
        continue;
      }
      filteredArrTimes.push(prayerTimesAndNames[1][i]);
    }
    prayerTimesAndNames = [filteredArrNames, filteredArrTimes];

    filteredArrNames = [];
    filteredArrTimes = [];
  })();

  for (let j = 0; j < prayerTimesAndNames[1].length; j++) {
    prayerTimesAndNames[1][j] = from12HtoTimestamp(prayerTimesAndNames[1][j]);
  }

  addFajrTimeForNextDay(defaultCity, defaultCountry, getNextDayDate(dateNow));
}

function liveUpdate() {
  changeRemindedPrayerTimeContainer();
  let prayerName = changeRemindedPrayerTimeContainer();
  setActiveToNextPrayer(prayerName);
}

async function getTimes(city, country, date) {
  await getRequest(city, country, date)
    .then((times) => {
      let prayerName = times[0];
      let prayerTimes = times[1];

      prayerTimesAndNames[0] = prayerName;
      prayerTimesAndNames[1] = prayerTimes;

      prayerTimes = prayerTimes.map((time) => {
        return from24hTo12h(time);
      });


      prayerContainer.innerHTML = "";



      for (let i = 0; i < prayerName.length; i++) {
        createTimeBlock(prayerName[i], prayerTimes[i], i);
      }


      document.getElementById("city").innerHTML = organizeInputs(
        cityInput.value,
        countryInput.value
      )[0];

      //// after get Api data change content of the page depending on data from api request
      changeStatus();

      ///// live update time for next prayer and name of next prayer
      setInterval(liveUpdate, 1000);
    })
    .catch((error) => {
      console.log(error);
      cityInput.value = "";
      countryInput.value = "";
      alert("You Enter city or country doesn't exist try Again ");
    })
    .finally(() => {
      cityInput.value = "";
      countryInput.value = "";
    });
}

getTimes(defaultCity, defaultCountry, dateNow);

searchBtn.addEventListener("click", () => {
  if (cityInput.value === "" || countryInput.value === "") {
    alert("You have to Fill all inputs with correct data");
  } else {
    let organizedInputs = organizeInputs(cityInput.value, countryInput.value);
    let city = organizedInputs[0];
    let country = organizedInputs[1];
    getTimes(city, country, dateNow);
  }
});
