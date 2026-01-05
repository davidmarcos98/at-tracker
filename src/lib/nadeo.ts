interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface UbiTicketResponse {
  ticket: string;
}

interface PersonalTokenResponse {
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
  atCount: number;
  at: number;
  laps: number;
  thumbnail: string;
  download: string;
  day?: number;
  month?: number;
  year?: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class NadeoClient {
  private userAgent: string;
  private username: string;
  private password: string;
  private tokenEndpoint: string;
  private apiBase: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private personalUsername: string;
  private personalPassword: string;
  private personalUbiTicket: string | null = null;
  private personalUbiTicketExpiresAt: number = 0;
  private personalAccessToken: string | null = null;
  private personalAccessTokenExpiresAt: number = 0;
  
  
  constructor() {
    this.personalUsername = process.env.NADEO_PERSONAL_USERNAME || '';
    this.personalPassword = process.env.NADEO_PERSONAL_PASSWORD || '';
    this.username = process.env.NADEO_SERVER_USERNAME || '';
    this.password = process.env.NADEO_SERVER_PASSWORD || '';
    this.userAgent = process.env.NADEO_USER_AGENT || '';
    this.tokenEndpoint = 'https://prod.trackmania.core.nadeo.online/v2/authentication/token/basic';
    this.apiBase = process.env.NADEO_API_BASE || 'https://prod.api.nadeolive.com';

    if (!this.username || !this.password || !this.userAgent) {
      throw new Error('Missing NADEO_SERVER_USERNAME or NADEO_SERVER_PASSWORD or NADEO_USER_AGENT environment variables');
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
        'User-Agent': this.userAgent,
      },
      body: JSON.stringify({ audience: "NadeoLiveServices" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate with Nadeo API: ${response.statusText}`);
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.accessToken;
    console.log("token : ", data);

    return this.accessToken;
  }

  private async getUbiTicket(): Promise<string> {
    if (this.personalUbiTicket) {
      return this.personalUbiTicket;
    }

    if (!this.personalUsername || !this.personalPassword) {
      throw new Error('Missing NADEO_PERSONAL_USERNAME or NADEO_PERSONAL_PASSWORD environment variables');
    }

    const credentials = Buffer.from(`${this.personalUsername}:${this.personalPassword}`).toString('base64');

    const response = await fetch('https://public-ubiservices.ubi.com/v3/profiles/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Ubi-AppId': '86263886-327a-4328-ac69-527f0d20a237',
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Ubi ticket: ${response.statusText}`);
    }

    const data: UbiTicketResponse = await response.json();
    this.personalUbiTicket = data.ticket;
    this.personalUbiTicketExpiresAt = Date.now() + (55 * 60 * 1000);

    return this.personalUbiTicket;
  }

  private async getAccessTokenPersonal(): Promise<string> {
    if (this.personalAccessToken) {
      return this.personalAccessToken;
    }

    const ubiTicket = await this.getUbiTicket();

    const response = await fetch('https://prod.trackmania.core.nadeo.online/v2/authentication/token/ubiservices', {
      method: 'POST',
      headers: {
        'Authorization': `ubi_v1 t=${ubiTicket}`,
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent,
      },
      body: JSON.stringify({ audience: 'NadeoLiveServices' }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get personal access token: ${response.statusText}`);
    }

    const data: PersonalTokenResponse = await response.json();
    this.personalAccessToken = data.accessToken;

    return this.personalAccessToken;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    let token: string;
    if (process.env.NADEO_PERSONAL_USERNAME) {
        token = await this.getAccessTokenPersonal();
    } else {
        token = await this.getAccessToken();
    }
    const url = `${this.apiBase}${endpoint}`;

    console.log("Request to Nadeo: ", endpoint.split('?')[0]);
    const response = await fetch(url, {
      headers: {
        'Authorization': `nadeo_v1 t=${token}`,
        'Accept': 'application/json',
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Nadeo API error: ${response.status} ${response.statusText}`);
    }

    // add delay to respect Nadeo API rate limits
    await delay(1500);

    return response.json();
  }

  async getTotdMapsCurrentMonth(backwardsMonths: number = 0): Promise<any> {
    const parsedResponse: any[] = [];
    const response: any = await this.makeRequest(`/api/token/campaign/month?length=1&offset=${backwardsMonths}&royal=false`);
    for (let month of response.monthList) {
        console.log(`Getting maps info for month: ${month.month}/${month.year}`);
        let mapsInfo = await this.getMapDetailsMultiple([...month.days.map((map: { mapUid: string; }) => map.mapUid).filter((uid: string) => uid != "")]);
        //let mapsAtCount = await this.getAtCountMultiple([...month.days.map((map: { mapUid: string; }) => ({mapUid: map.mapUid, at: mapsInfo[map.mapUid]?.at})).filter((map: { mapUid: string; }) => map.mapUid != "")]);
        console.log(month.days.length)
        for (let map of month.days) {
            if (map.mapUid == "") {
                console.log(map);
                continue;
            }; // Skip getting details for empty (future) maps
            let parsedMap = mapsInfo[map.mapUid];
            let atCount = await this.getAtCount(map.mapUid, parsedMap.at);
            parsedResponse.push({
                ...parsedMap,
                day: map.monthDay,
                month: month.month,
                year: month.year,
                atCount: atCount,
            });
        }
    }
    console.log(parsedResponse)
    return {data: parsedResponse}
  }

  async getAtCount(mapUid: string, at: number): Promise<number> {
    console.log(`Getting at count for map ${mapUid} at ${at}`);
    const response = await this.makeRequest<any>(`/api/token/leaderboard/group/Personal_Best/map/${mapUid}/surround/1/1?score=${at}&onlyWorld=true`);
    return response.tops[0].top[0].position;
  }

  async getAtCountMultiple(maps: any[]): Promise<{[key: string]: number}> {
    const response = await this.makeRequest<any>(`/api/token/leaderboard/group/map?${maps.map(map => `scores[${map.mapUid}]=${map.at}`).join('&')}`);
    const atCounts: {[key: string]: number} = {};
    response.forEach((map: any) => {
        atCounts[map.uid] = map.zones[0].ranking.position + 1;
    });
    return atCounts;
  }

  async getMapDetailsMultiple(mapIds: string[]): Promise<any> {
    const mapsInfo = await this.makeRequest<any>(`/api/token/map/get-multiple?mapUidList=${mapIds.join(',')}`);

    return mapsInfo.mapList.map((map: { mapId: any; uid: any; name: any; author: any; goldTime: any; silverTime: any; bronzeTime: any; authorTime: any; nbLaps: any; thumbnailUrl: any; downloadUrl: any; }) => ({
        mapId: map.mapId,
        mapUid: map.uid,
        name: map.name,
        authorAccountId: map.author,
        authorDisplayName: 'Unknown',
        goldTime: map.goldTime,
        silverTime: map.silverTime,
        bronzeTime: map.bronzeTime,
        at: map.authorTime,
        laps: map.nbLaps,
        thumbnail: map.thumbnailUrl,
        download: map.downloadUrl,    
    })).reduce((acc: any, map: TotdMap) => {
        acc[map.mapUid] = map;
        return acc;
    }, {});
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
