import { BbddService } from '../bbdd.service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Frontend';
  image: any;
  filenameToLoad: string = '';
  filenameToUpload: string = '';
  imageToUpload: any;

  constructor(private bbddservice: BbddService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileContent = fileReader.result as string;
        this.imageToUpload = fileContent;
      };
      fileReader.readAsDataURL(file);
    }
  }
  getimage() {
    this.bbddservice
      .getImage('ProfilePictures', this.filenameToLoad)
      .subscribe((data) => (this.image = data['data' as keyof typeof data]));
  }
  saveImage() {
    this.bbddservice
      .saveImage(
        'ProfilePictures',
        this.filenameToUpload,
        this.imageToUpload.substring(this.imageToUpload.indexOf(",") + 1)
      )
      .subscribe();
  }
}
