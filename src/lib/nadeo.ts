interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface TotdMap {
  mapId: string;
  mapUid: string;
  name: string;
  authorAccountId: string;
  authorDisplayName: string;
  goldTime: number;
  silverTime: number;
  bronzeTime: number;
  at: number;
  laps: number;
  thumbnail: string;
  download: string;
  day?: number;
  month?: number;
  year?: number;
}

class NadeoClient {
  private username: string;
  private password: string;
  private tokenEndpoint: string;
  private apiBase: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.username = process.env.NADEO_SERVER_USERNAME || '';
    this.password = process.env.NADEO_SERVER_PASSWORD || '';
    this.tokenEndpoint = 'https://prod.trackmania.core.nadeo.online/v2/authentication/token/basic';
    this.apiBase = process.env.NADEO_API_BASE || 'https://prod.api.nadeolive.com';

    if (!this.username || !this.password) {
      throw new Error('Missing NADEO_SERVER_USERNAME or NADEO_SERVER_PASSWORD environment variables');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessToken != undefined && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'User-Agent': 'NadeoClientSocramdavid davidmarcosg98@gmail.com',
      },
      body: JSON.stringify({ audience: "NadeoLiveServices" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate with Nadeo API: ${response.statusText}`);
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.accessToken;

    return this.accessToken;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    let token = await this.getAccessToken();
    const url = `${this.apiBase}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `nadeo_v1 t=${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nadeo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTodMap(): Promise<any> {
    const parsedResponse: any[] = [];
    const response: any = await this.makeRequest('/api/token/campaign/month?length=1&offset=0&royal=false');
    for (let month of response.monthList) {
        for (let map of month.days) {
            if (map.mapUid == "") continue; // Skip getting details for empty (future) maps
            let parsedMap = await this.getMapDetails(map.mapUid);
            parsedResponse.push({
                ...parsedMap,
                day: map.monthDay,
                month: month.month,
                year: month.year,
            });
        }
    }
    return {data: parsedResponse}
  }

  async getMapDetails(mapId: string): Promise<TotdMap> {
    const response = await this.makeRequest<any>(`/api/token/map/${mapId}`);
    return {
        mapId: response.mapId,
        mapUid: response.uid,
        name: response.name,
        authorAccountId: response.author,
        authorDisplayName: 'Unknown',
        goldTime: response.goldTime,
        silverTime: response.silverTime,
        bronzeTime: response.bronzeTime,
        at: response.authorTime,
        laps: response.nbLaps,
        thumbnail: response.thumbnailUrl,
        download: response.downloadUrl,      
    };
  }

}

export const nadeoClient = new NadeoClient();
export type { TotdMap };
