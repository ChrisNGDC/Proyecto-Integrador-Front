import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BbddService {

  constructor(private http: HttpClient) { }
  xmlReq = new XMLHttpRequest();
  url = "https://nt876k2q7f.execute-api.us-east-1.amazonaws.com/"
  getImage(foldername: string, filename: string) {
    return this.http.post(`${this.url}/getphoto?folder=${foldername}&image=${filename}`, {})
  }
  saveImage(foldername: string, filename: string, imageData: string) {
    return this.http.post(`${this.url}/savephoto`, JSON.stringify({"folder": foldername, 'name': filename, "data": imageData}));
  }
}
