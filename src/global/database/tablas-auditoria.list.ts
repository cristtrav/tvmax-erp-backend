export class TablasAuditoriaList{
    public static GRUPOS = 1;
    public static SERVICIOS = 2;
    public static DEPARTAMENTOS = 3;
    public static DISTRITO = 4;
    public static BARRIO = 5;
    public static TIPODOMICILIO = 6;
    public static COBRADORES = 7;
    public static USUARIOS = 8;

    public static getTableName(idtable: number): string {
        switch (idtable) {
            case TablasAuditoriaList.GRUPOS: return 'grupo';
            case TablasAuditoriaList.SERVICIOS: return 'servicio';
            case TablasAuditoriaList.DEPARTAMENTOS: return 'departamento';
            case TablasAuditoriaList.DISTRITO: return 'distrito';
            case TablasAuditoriaList.BARRIO: return 'barrio';
            case TablasAuditoriaList.TIPODOMICILIO: return 'tipo_domicilio';
            case TablasAuditoriaList.COBRADORES: return 'cobrador';
            case TablasAuditoriaList.USUARIOS: return 'usuario';
            default: return '';
        }
    }
}