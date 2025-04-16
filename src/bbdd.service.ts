import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BbddService {

  constructor(private http: HttpClient) { }
  xmlReq = new XMLHttpRequest();
  url = "https://nt876k2q7f.execute-api.us-east-1.amazonaws.com"
  getDababases() {
    return this.http.get(`${this.url}/tablas`)
  }
  getDatabase(basename: string) {
    return this.http.get(`${this.url}/tablas/${basename}`)
  }
  getElementByIdFromDatabase(basename: string, id: string) {
    return this.http.get(`${this.url}/tablas/${basename}/${id}`)
  }
  getImage(s3key: string) {
    return this.http.post(`${this.url}/getphoto?s3key=${s3key}`, {})
  }
  saveImage(foldername: string, filename: string, imageData: string) {
    return this.http.post(`${this.url}/savephoto`, JSON.stringify({"folder": foldername, 'name': filename, "data": imageData}));
  }
}
