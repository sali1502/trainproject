"use strict"

import { apikey } from "./apikey.js";

// Hämta väderprognos
async function getForecast(lat, long) {
    try {
        let response = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${long}&apikey=${apikey}`);
        return await response.json();
    } catch (error) {
        console.log("Något gick fel: " + error);
    }
}

// Skriv ut väderprognos från koordinater
async function writeForecast(lat, long) {
    try {
        let data = await getForecast(lat, long);

        let weatherEl = document.getElementById("weather");
        weatherEl.innerHTML = "";

        let daily = data.timelines.daily;

        // Skriv ut till DOM
        daily.forEach(day => {

            let dateForm = formatDate(day.time);

            weatherEl.innerHTML += `
            <article>
            <h2>${dateForm}</h2>
            <p>Högst: ${day.values.temperatureMax}&#8451
            <br>Lägst: ${day.values.temperatureMin}&#8451
            </p>
            </article>
            `;
        });

    } catch (error) {
        console.log("Något gick fel" + error);
    }
}

// Formatera datum 
function formatDate(dateString) {
    let date = new Date(dateString);
    let day = date.getDay();
    let weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
    let month = date.getMonth() + 1;
    let days = date.getDate();

    return `${weekdays[day]} ${days}/${month}`;
}

// Sökbar karta
document.addEventListener('DOMContentLoaded', () => {
    let searchInput = document.getElementById('searchInput');
    let searchBtn = document.getElementById('searchBtn');
    let map = L.map('map').setView([59.32, 18.05], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker;

    async function searchLocation(query) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coordinates = [lat, lon];
                map.setView(coordinates, 15);

                if (marker) {
                    marker.setLatLng(coordinates);
                } else {
                    marker = L.marker(coordinates).addTo(map);
                }

                writeForecast(lat, lon);

            } else {
                alert('Platsen kunde inte hittas...');
            }
        } catch (error) {
            console.error('Något gick fel...', error);
        }
    }

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (query.trim() !== "") {
            searchLocation(query);
        } else {
            alert('Skriv in en plats i sökrutan...');
        }
    });
});
