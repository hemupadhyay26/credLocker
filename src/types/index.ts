export interface Credential {
    id: string;
    name: string;
    username: string;
    password: string;
    accountIdentifier?: string;
    createdAt: string;
    lastUpdatedAt: string;
  }
  
  export interface ConfigData {
    [key: string]: Credential[];
  }
