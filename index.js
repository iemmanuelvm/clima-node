import * as dotenv from 'dotenv'
import inquirerHelpers from './helpers/inquirer.js';
import searchModels from './models/busquedas.js';

const { leerInput, inquirerMenu, pausa, listarLugares } = inquirerHelpers;
const { Busquedas } = searchModels;
dotenv.config()
//console.log(process.env.MAPBOX_KEY);
const main = async() => {

    let opt;
    const busquedas = new Busquedas();

    do{

        opt = await inquirerMenu();
        
        switch(opt){
            case 1:
                //Mostrar mensajes
                const termino = await leerInput('Ciudad:');
                
                //Buscar lugar
                const lugares = await busquedas.ciudad(termino);

                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                if(id==='0') continue;
                const lugarSel = lugares.find(l=>l.id === id);
                //Guardar en db
                busquedas.agregarHistorial(lugarSel.nombre);
                
                //console.log(lugarSel);

                //Clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

                //console.log(clima);
                //Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:',lugarSel.nombre.green);
                console.log('Latitud:',lugarSel.lat);
                console.log('Longitud',lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Mínima:',clima.min);
                console.log('Máxima:',clima.max);
                console.log('Como esta el clima:', clima.desc.green);
            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i+1}.`.green;
                    console.log(`${idx} ${lugar}`);
                })

            break;
        }



        if (opt!==0) await pausa();

    }while(opt != 0)



}

main();