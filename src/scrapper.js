const axios = require('axios');
const cheerio = require('cheerio');
const JSON = require('JSON');
const fs = require('fs');

class contest{
    constructor(town, dateStart, dateEnd, mandat, type, league, distance)
    {
        this.town = town;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.mandat = mandat;
        this.type = type;
        this.league = league;
        this.distance = distance;
    }

    CSVline(){
        return `${this.dateStart},${this.dateEnd},${this.town},${this.mandat},${this.type},${this.league},${this.distance}`
    }
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// exemple of url to scrapp : 
// https://www.ffta.fr/ws/epreuves?ChxDiscipline=S&ChxTypeChampionnat=&ChxLigue=CR08&ChxDepartement=&ChxClub=&ChxDateDebut=2021-09-18&ChxDateFin=2021-12-31

async function scrappPage(discipline, ligue, dateStart, dateEnd, pageMax) {
    console.log("Initiating scrapping...");
    
   // const url = "https://gamepress.gg/feheroes/heroes" // test url
    
    var countdown = 0

    for(let page = 1; page < pageMax + 1; page++){
        url = `https://www.ffta.fr/ws/epreuves?ChxDiscipline=${discipline}&ChxTypeChampionnat=&ChxLigue=${ligue}&ChxDepartement=&ChxClub=&ChxDateDebut=${dateStart}&ChxDateFin=${dateEnd}&Page=${page}`;
        console.log(`Scrapping url : ${url}`);
        await axios(url)
            .then(response => {
                const html = response.data;

                const $ = cheerio.load(html)
                const contestTable = $('dl.dl-horizontal')
                var truc = String(contestTable);
                fs.writeFile('../ressources/template.txt', truc, (err) => {
                    if (err) throw err;
                })

                contestTable.each(function() {
                    countdown++;
                    var info = 0;
                    const testingdd =$(this).find('dd')//.text();
                    //const testingdd2 =$(this).find('dd').text();

                    console.log('-------------------------------------------------------------------------------')
                    //console.log(testingdd2);
                    testingdd.each(function(){
                        info++
                        
                        console.log(`${info} - ${testingdd}`);
                    })
                    console.log(`nombre d'info : ${info}`)
                })
                



            })
    }
    console.log(`There are ${countdown} contest(s)`)
}

scrappPage("S", "CR08", "2021-09-18","2021-12-31", 1);