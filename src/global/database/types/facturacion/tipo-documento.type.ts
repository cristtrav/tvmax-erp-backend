export const TIPO_DOCUMENTO = ['FAC', 'NCR', 'NDE'] as const;
export type TipoDocumentoType = typeof TIPO_DOCUMENTO[number];