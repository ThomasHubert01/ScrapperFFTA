const axios = require('axios');
const cheerio = require('cheerio');
const JSON = require('JSON');
const fs = require('fs');



process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



async function scrappPage(discipline, ligue, dateStart, dateEnd, isLogTrue = false) {
    console.log("Initiating scrapping...");
    
    fs.writeFile('../ressources/info_concours.csv', "StartDate,EndDate,Lieu,mandat,TypeEpreuve,Departement,Distance,Etat,Adresse", (err) => {
        if (err) throw err;
    })
    var countdown = 0

    // retrieve the number of page for some parameters
    url_page = `https://www.ffta.fr/ws/epreuves?ChxDiscipline=${discipline}&ChxTypeChampionnat=&ChxLigue=${ligue}&ChxDepartement=&ChxClub=&ChxDateDebut=${dateStart}&ChxDateFin=${dateEnd}`
    

    var page_to_read = 5;
   
    await axios(url_page)
        .then(response => {
            const html_page = response.data;

            const $ = cheerio.load(html_page);
            const PageTable = $('li.pager-item');
            var nbr_page = 0;

            PageTable.each(function(){
                
                nbr_page++
            })

            page_to_read = nbr_page/2;

        })


    for(let page = 1; page < page_to_read+ 1; page++){
        url = `https://www.ffta.fr/ws/epreuves?ChxDiscipline=${discipline}&ChxTypeChampionnat=&ChxLigue=${ligue}&ChxDepartement=&ChxClub=&ChxDateDebut=${dateStart}&ChxDateFin=${dateEnd}&Page=${page}`;
        console.log(`Scrapping url : ${url}`);
        await axios(url)
            .then(response => {
                const html = response.data;

                const $ = cheerio.load(html)
                const contestTable = $('div.result-item')
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
                    let categorie = [];
                    var nbr_info = 0;

                    
                    const categorie_info =$(this).find('dd');
                    const categories =$(this).find('dt');
                    var mandat = "";
                    // search for the mandat
                    const mandat_search =$(this).find('a.results');
                    console.log(mandat_search.text())
                    mandat_search.each(function(){
                        mandat = $(this).attr('href');
                        console.log(mandat);
                    })

                    console.log('-------------------------------------------------------------------------------');
              
                    categories.each(function(){
                        const each_categorie = $(this).text().toString().slice(0,-2);
                        categorie.push(each_categorie);
                    });
                   
 
                    categorie_info.each(function(){
                        
                        const info = $(this).text().toString();
                        var info_trim = (info.trim());
                          

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

                    map_info.set("Discipline_simple",new_discipline)
                
                    //process address
                    var address = "";
                    if(map_info.has("Adresse")){
                        var address_raw = map_info.get("Adresse");
                        address = address_raw.replace(/\s\s+/g, ' ');
                    }
                    

                    

                    if(isLogTrue){
                        console.log(map_info)         
                    }     
                    // write in the file
                    fs.appendFileSync('../ressources/info_concours.csv', `${map_info.get("DateStart")},${map_info.get("DateEnd")},${map_info.get("Lieu")},${mandat}, ${map_info.get("Discipline_simple")}, ${map_info.get("Département")}, distance, ${map_info.get("État")}, ${address}\n`);

                    //console.log(`nombre d'info : ${nbr_info}`);
                })
            })
    }
    console.log(`There are ${countdown} contest(s)`)
}

scrappPage("S", "CR08", "2021-09-18","2021-12-31");