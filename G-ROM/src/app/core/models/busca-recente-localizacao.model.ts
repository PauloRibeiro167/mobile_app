export interface BuscaRecenteLocalizacao {
  endereco: {
    endereco_imovel: {
      endereco_completo: string;
      endereco_numero: number;
      endereco_complemento: string;
      cep: string;
      bairro: string;
      regional: string;
    };
    endereco_correspondencia: {
      endereco_completo: string;
    };
  };
  localizacao: {
    latitude: string;
    longitude: string;
  };
}