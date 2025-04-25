import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BbddService {

  constructor(private http: HttpClient) { }
  xmlReq = new XMLHttpRequest();
  url = "https://nt876k2q7f.execute-api.us-east-1.amazonaws.com"
  // Devuelve todas las bases de datos
  getDababases() {
    return this.http.get(`${this.url}/tablas`)
  }
  // Devuelve toda una base de datos segun su nombre
  getDatabase(basename: string) {
    return this.http.get(`${this.url}/tablas/${basename}`)
  }
  // Devuelve el elemento de una base de datos con cierto id
  getElementByIdFromDatabase(basename: string, id: string) {
    return this.http.get(`${this.url}/tablas/${basename}/${id}`)
  }
  // s3key se conforma por la ruta completa de la imagen en el s3: carpeta/nombre-imagen.extencion
  getImage(s3key: string) {
    return this.http.post(`${this.url}/getphoto?s3key=${s3key}`, {})
  }
  // Retorna el codigo de la imagen en formato base64
  saveImage(foldername: string, filename: string, imageData: string) {
    return this.http.post(`${this.url}/savephoto`, JSON.stringify({"folder": foldername, 'name': filename, "data": imageData}));
  }
}
