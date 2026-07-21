export interface Province {
  id: number;
  name: string;
  code: string;
}

export type PublicProvince = Province;
export type RankingProvince = Province;

export interface ProvincesResponse {
  data: Province[];
}
