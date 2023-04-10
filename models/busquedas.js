import fs from 'fs';

import axios, {isCancel, AxiosError} from 'axios';
//API's
//https://www.mapbox.com/
//https://docs.mapbox.com/api/search/geocoding/
class Busquedas{
    historial = [];
    dbPath = './db/database.json';
    constructor() {
        this.leerDB();
    }

    get historialCapitalizado(){
        //capitalizar cada palabra

        return this.historial.map(lugar=>{
            let palabras = lugar.split(' ');
            palabras = palabras.map(p=>p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        });
    }

    get paramsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'proximity' : 'ip',
            'language' : 'es'
        }
    }


    get paramsWeather(){
        return {
            appid : process.env.OPENWHEATHER_KEY,
            units : 'metric',
            lang: 'es' 
        }
    }

    async ciudad(lugar = ''){
        
        
        try{
            //Petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });
            const resp = await instance.get();
            // const resp = await axios.get("https://api.mapbox.com/geocoding/v5/mapbox.places/LORETO.json?proximity=ip&language=es&access_token=pk.eyJ1IjoiaWVtbWFudWVsdm0iLCJhIjoiY2xnYTJ6ZDI0MHBvMDNncWwyY2U2b2NmNyJ9.G2ugiwHQvBPTp1VgdX9Bqw");
            // console.log(resp.data.features);
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));
            return []; // retornar los lugares
        }catch(error){
            return [];
        }
    }

    async climaLugar(lat, lon){
        try{
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWeather, lat, lon}
            });

            const resp = await instance.get();
            //console.log(resp);
            //resp.data
            const {weather, main} = resp.data;

            
        
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        }catch(error){
            console.log(error);
        }
    }
    agregarHistorial(lugar = ''){
        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return;
        }
        this.historial = this.historial.splice(0,5);
        //TODO: prevenir duplicados
        this.historial.unshift(lugar.toLocaleLowerCase());
        //grabar en DB
        this.guardarDB();

    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }
    leerDB(){
        if(!fs.existsSync(this.dbPath)) return;

        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});


        const data = JSON.parse(info);


        this.historial = data.historial;

    }

}
    

export default {
    Busquedas
}