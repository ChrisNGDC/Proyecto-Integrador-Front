import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewsEventsService {

  constructor(private http: HttpClient) { }
  url = "https://w5yeuip47j.execute-api.us-east-1.amazonaws.com"
  imgurl = "https://hq6zblepy5.execute-api.us-east-1.amazonaws.com"
  getNewsAndEvents() {
    return this.http.get(`${this.url}/noticiasYeventos`)
  }
  getNewsAndEventsById(id: string) {
    return this.http.get(`${this.url}/noticiasYeventos/${id}`)
  }
  deleteNewsAndEvents(id: string) {
    return this.http.delete(`${this.url}/noticiasYeventos/${id}`)
  }
  putNewsAndEvents(data: any) {
    return this.http.put(`${this.url}/noticiasYeventos`, data)
  }
  patchNewsAndEvents(id: string, data: any) {
    return this.http.patch(`${this.url}/noticiasYeventos/${id}`, data)
  }
  // s3key se conforma por la ruta completa de la imagen en el s3: carpeta/nombre-imagen.extencion
  getImage(s3key: string) {
    return this.http.get(`${this.imgurl}/images/${s3key}`)
  }
  // Retorna el codigo de la imagen en formato base64
  saveImage(foldername: string, filename: string, imageData: string) {
    return this.http.post(`${this.imgurl}/images`, JSON.stringify({"folder": foldername, 'name': filename, "data": imageData}));
  }
}
