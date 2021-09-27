const axios = require('axios');
const cheerio = require('cheerio');
const JSON = require('JSON');
const fs = require('fs');



process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



async function scrappPage(discipline, ligue, dateStart, dateEnd, pageMax, isLogTrue = false) {
    console.log("Initiating scrapping...");
    
    fs.writeFile('../ressources/info_concours.csv', "StartDate,EndDate,Lieu,mandat,TypeEpreuve,Departement,Distance,Etat", (err) => {
        if (err) throw err;
    })
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

                    //process datetime
                    var StartDate = ""
                    var EndDate = ""
                    var datetomodify = map_info.get("Date");
                    arrayDate = datetomodify.split(' ');
                    if(arrayDate.length> 3){
                        StartDate = arrayDate[1];
                        EndDate = arrayDate[arrayDate.length-1];
                    } else {
                        StartDate = arrayDate[1]
                        EndDate = arrayDate[1]
                    }
                    map_info.set("DateStart",StartDate)
                    map_info.set("DateEnd", EndDate)

                    //process discipline
                    var discipline = map_info.get("Discipline")
                    slice_discipline = discipline.split('-')
                    new_discipline = slice_discipline[0].trim()
                    console.log(new_discipline)
                    map_info.set("Discipline_simple",new_discipline)
                
                    // write in the file
                    console.log(map_info)    
                    fs.appendFileSync('../ressources/info_concours.csv', `${map_info.get("DateStart")},${map_info.get("DateEnd")},${map_info.get("Lieu")},mandat,${map_info.get("Discipline_simple")}, ${map_info.get("Département")}, distance, ${map_info.get("État")}\n`);
                    //console.log(`nombre d'info : ${nbr_info}`);
                })
            })
    }
    console.log(`There are ${countdown} contest(s)`)
}

scrappPage("S", "CR08", "2021-09-18","2021-12-31", 5);