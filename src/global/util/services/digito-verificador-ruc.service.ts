import { Injectable } from '@nestjs/common';

@Injectable()
export class DigitoVerificadorRucService {

    generar(ci: string, pBaseMax: number = 11){

        //let p_rucStr = p_ruc.toString(); // convertimos el parametro a una cadena
        let vCaracter = "";
        let vNumeroAl = "";

        let k = 2; // factor de chequeo, empieza en 2 (dos)
        let vTotal = 0; // acumulador
        let vNumeroAux;
        let vResto;
        let vDigito;

        /* cambia la ultima letra por ascii en caso de que la cedula termine en letra */
        for (let i = 0; i < ci.length; i++) {
            vCaracter = ci.toUpperCase().substring(i, i + 1);
            let vCaracterAscii = vCaracter.charCodeAt(0);
            if (vCaracterAscii >= 48 && vCaracterAscii <= 57) { // de 0 a 9
                vNumeroAl += vCaracter;
            } else {
                vNumeroAl += vCaracterAscii;
            }
        }
        //console.log("RUCN: " + vNumeroAl);
        for (let i = vNumeroAl.length; i > 0; i--) {
            if (k > pBaseMax) {
                k = 2;
            }
            let digito = vNumeroAl.substring(i - 1, i);
            vNumeroAux = parseInt(digito);
            vTotal += vNumeroAux * k;

            k++;
        }

        vResto = vTotal % 11; // % modulus operator
        if (vResto > 1) {
            vDigito = 11 - vResto;
        } else {
            vDigito = 0;
        }

        //console.log("DVN: " + vDigito);
        return vDigito;
    }

}
