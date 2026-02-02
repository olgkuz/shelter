import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppConfig } from '../models/app-config.model';
import { API } from '../shared/api';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig = {};

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return firstValueFrom(
      this.http.get<AppConfig>(API.config).pipe(
        tap((cfg) => {
          this.config = cfg || {};
        }),
        catchError(() => of({} as AppConfig))
      )
    ).then((): void => undefined);
  }

  getConfig(): Readonly<AppConfig> {
    return this.config;
  }
}

export function initializeApp(configService: ConfigService): Promise<void> {
  return configService.loadConfig();
}
