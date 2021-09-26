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


async function scrappPage(discipline, ligue, dateStart, dateEnd, pageMax, isLogTrue = false) {
    console.log("Initiating scrapping...");
    
    
    var countdown = 0

    for(let page = 1; page < pageMax + 1; page++){
        url = `https://www.ffta.fr/ws/epreuves?ChxDiscipline=${discipline}&ChxTypeChampionnat=&ChxLigue=${ligue}&ChxDepartement=&ChxClub=&ChxDateDebut=${dateStart}&ChxDateFin=${dateEnd}&Page=${page}`;
        console.log(`Scrapping url : ${url}`);
        await axios(url)
            .then(response => {
                const html = response.data;

                const $ = cheerio.load(html)
                const contestTable = $('dl.dl-horizontal')
                /*
                var truc = String(contestTable);
                fs.writeFile('../ressources/split.txt', "", (err) => { //reset the file
                    if (err) throw err;
                })
                fs.writeFile('../ressources/template.txt', truc, (err) => {
                    if (err) throw err;
                })
                */
               const map_info = new Map();

                contestTable.each(function() {
                    countdown++;
                    var nbr_info = 0;
                    const categorie_info =$(this).find('dd');
                    const categories =$(this).find('dt');
                
                    let categorie = [];

                    console.log('-------------------------------------------------------------------------------');
                    
                    categories.each(function(){
                        const each_categorie = $(this).text().toString().slice(0,-2);
                        categorie.push(each_categorie);
                    });
                   
 
                    categorie_info.each(function(){
                        
                        const info = $(this).text().toString();
                        var info_trim = (info.trim());
                        if(isLogTrue){
                            console.log(`${categorie[nbr_info]} : ${info_trim}`);      
                        }       

                        map_info.set(categorie[nbr_info],info_trim );
                        
                        nbr_info++;
                    })
                    console.log(map_info)
                    console.log(`nombre d'info : ${nbr_info}`);
                })
            })
    }
    console.log(`There are ${countdown} contest(s)`)
}

scrappPage("S", "CR08", "2021-09-18","2021-12-31", 1);