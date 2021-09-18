const axios = require('axios');
const cheerio = require('cheerio');
const JSON = require('JSON');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// exemple of url to scrapp : 
// https://www.ffta.fr/ws/epreuves?ChxDiscipline=S&ChxTypeChampionnat=&ChxLigue=CR08&ChxDepartement=&ChxClub=&ChxDateDebut=2021-09-18&ChxDateFin=2021-12-31

async function scrappPage(discipline, ligue, dateStart, dateEnd) {
    console.log("Initiating scrapping...");
    const url = `https://www.ffta.fr/ws/epreuves?ChxDiscipline=${discipline}&ChxTypeChampionnat=&ChxLigue=${ligue}&ChxDepartement=&ChxClub=&ChxDateDebut=${dateStart}&ChxDateFin=${dateEnd}`;
   // const url = "https://gamepress.gg/feheroes/heroes" // test url
    console.log(`Scrapping url : ${url}`);

    await axios(url)
        .then(response => {
            const html = response.data;
            console.log(html)
        })
}

scrappPage("S", "CR08", "2021-09-18","2021-12-31");