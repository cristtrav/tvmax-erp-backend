import { Injectable } from '@nestjs/common';
import { xml2json } from 'xml-js';

@Injectable()
export class DteXmlUtilsService {

    public getCDC(xml: string): string {
        const deJson = JSON.parse(xml2json(xml));
        return deJson.elements[0].elements[1].attributes.Id;
    }

}
