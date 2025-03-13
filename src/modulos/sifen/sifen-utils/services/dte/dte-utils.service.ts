import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { ClienteView } from '@database/view/cliente.view';
import { ConsultaRucMessageService } from '@modulos/sifen/sifen-utils/services/consultas/consulta-ruc-message.service';
import { ConsultaRucService } from '@modulos/sifen/sifen-utils/services/consultas/consulta-ruc.service';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { SifenUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-util.service';
import qrgen from 'facturacionelectronicapy-qrgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { DEActividadEconomicaInterface } from '../../interfaces/dte/de-actividad-economica.interface';
import { DEClienteInterface } from '../../interfaces/dte/de-cliente.interface';
import { DEEstablecimientoInterface } from '../../interfaces/dte/de-establecimiento.interface';
import { DEParamsInterface } from '../../interfaces/dte/de-params.interface';
import { DETipoOperacionType } from '../../types/dte/de-tipo-operacion.type';

@Injectable()
export class DteUtilsService {

    constructor(
        @InjectRepository(Establecimiento)
        private establecimientoRepo: Repository<Establecimiento>,
        @InjectRepository(ActividadEconomica)
        private actividadEconomicaRepo: Repository<ActividadEconomica>,
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>,
        @InjectRepository(CodigoSeguridadContribuyente)
        private cscRepo: Repository<CodigoSeguridadContribuyente>,
        private consultaRucSrv: ConsultaRucService,
        private sifenUtilsSrv: SifenUtilService
    ){}

    private async getEstablecimientos(codEstablecimiento: number): Promise<DEEstablecimientoInterface[]> {
        const establecimiento = await this.establecimientoRepo.findOneByOrFail({id: codEstablecimiento});
        if (!establecimiento) return [];
        return [{
            codigo: `${establecimiento.id}`.padStart(3, '0'),
            denominacion: establecimiento.denominacion,
            direccion: establecimiento.direccion,
            departamento: establecimiento.codDepartamento,
            departamentoDescripcion: establecimiento.departamento,
            distrito: establecimiento.codDistrito,
            distritoDescripcion: establecimiento.distrito,
            ciudad: establecimiento.codCiudad,
            ciudadDescripcion: establecimiento.ciudad,
            numeroCasa: `${establecimiento.nroCasa}`,
            email: establecimiento.email,
            telefono: establecimiento.telefono
        }];
    }

    private async getActividadesEconomicas(): Promise<DEActividadEconomicaInterface[]> {
        return (await this.actividadEconomicaRepo.find()).map(acti => {
            return {
                codigo: `${acti.id}`,
                descripcion: acti.descripcion
            }
        });
    }

    public async getCliente(idcliente: number): Promise<DEClienteInterface>{
        const cliente = await this.clienteViewRepo.findOneByOrFail({id: idcliente});

        const deCliente: DEClienteInterface = {
            contribuyente: cliente.dvruc != null,
            codigo: `${cliente.id}`.padStart(3, '0'),
            razonSocial: cliente.dvruc != null ? (await this.consultarRazonSocialSifen(cliente.ci) ?? cliente.razonsocial) : cliente.razonsocial,
            tipoOperacion: <DETipoOperacionType> (cliente.idtipocliente ?? 2),
            tipoContribuyente: 1,
            pais: "PRY",
            paisDescripcion: "Paraguay",
            documentoTipo: 1,
            documentoNumero: cliente.ci
        }
        if(cliente.dvruc != null) deCliente.ruc = `${cliente.ci}-${cliente.dvruc}`;
        if(cliente.telefono1) deCliente.telefono = cliente.telefono1;
        if(cliente.email) deCliente.email = cliente.email;
        return deCliente;
    }

    private async consultarRazonSocialSifen(ci: string): Promise<string | null> {
        try{
            const response = await this.consultaRucSrv.consultar(ci);
            if(response.codigo == ConsultaRucMessageService.COD_ENCONTRADO)
                return response.detalleRuc.razonSocial;
            else return null;
        }catch(e){
            console.log('Error al consultar ruc', e);
        }
        return null;
    }

    public async getParams(talonario: TalonarioView): Promise<DEParamsInterface> {
        return {
            version: 150,
            ruc: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RUC}))?.valor ?? '',
            razonSocial: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RAZON_SOCIAL}))?.valor ?? '',
            actividadesEconomicas: await this.getActividadesEconomicas(),
            timbradoNumero: `${talonario.nrotimbrado}`.padStart(8, '0'),
            timbradoFecha: talonario.fechainicio,
            tipoContribuyente: 1,
            tipoRegimen: 8,
            establecimientos: await this.getEstablecimientos(talonario.codestablecimiento)
        }
    }

    public formatDate(date: Date): string{
        const anio = date.getFullYear().toString();
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const dia = date.getDate().toString().padStart(2, '0');
        const hora = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        const segundos = date.getSeconds().toString().padStart(2, '0');
        return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
    }

    public generarCodigoSeguridadAleatorio(): string {
        const min = 1;
        const max = 999999999
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return `${Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)}`.padStart(9, '0');
    }

    public async generarDEFirmado(xml: string): Promise<string>{
        if(!this.sifenUtilsSrv.certDataExists()){
            console.log('SIFEN_CERT_FOLDER y/o SIFEN_CERT_FILENAME indefinidos en variables de entorno');
            return null;
        }

        try{
            return await xmlsign.signXML(
                xml,
                this.sifenUtilsSrv.getCertData().certFullPath,
                this.sifenUtilsSrv.getCertData().certPassword,
                true
            );
        }catch(e){
            console.error("Error al firmar digitalmente la factura", e);
            return null;
        }
    }

    public async generarDEConQR(signedXml: string): Promise<string>{
        try{
            const csc = await this.cscRepo.findOneByOrFail({activo: true});
            return await qrgen.generateQR(signedXml, `${csc.id}`, `${csc.codigoSeguridad}`, this.sifenUtilsSrv.getAmbiente());
        }catch(e){
            console.error("Error al generar y agregar QR a la factura electrónica");
            console.error(e);
            return null;
        }
    }

}
