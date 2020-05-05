import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { EnvService } from "../env.service";

@Injectable({
  providedIn: "root",
})
export class DiffCompareService {
  //  baseUrl="https://datacatalogqa.lti-mosaic.com/discover/api/";
  // baseUrl="https://discover.mosaic-services-dev.lti-aiq.in/";

  private baseUrl: string;
  private apiUrl: string;
  constructor(private http: HttpClient, private env: EnvService) {
    this.baseUrl = this.env.baseUrl;
  }


  
  getDataSourceVersion(dataSrcId) {
    return this.http
      .get(this.baseUrl + "v1/datasource/" + dataSrcId + "/versions", {
        observe: "response",
      })
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getDataSourceVersionFieldMapping(dataSrcId: string, version: string) {
    return this.http
      .get(
        this.baseUrl +
          "v1/datasource/" +
          dataSrcId +
          "/version/" +
          version +
          "/fieldmapping",
        {
          observe: "response",
        }
      )
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getDataSourceFieldComparison(dataSrcId, versions) {
    return this.http.get(
      this.baseUrl +
        "v1/datasource/" +
        dataSrcId +
        "/compare/" +
        versions["version0"] +
        "/" +
        versions["version1"] +
        "/fieldmapping",
      { observe: "response" }
    );
  }

  
}
