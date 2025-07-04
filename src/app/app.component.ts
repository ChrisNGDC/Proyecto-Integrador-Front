
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./components/navbar-component/navbar-component.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DragDropModule } from "@angular/cdk/drag-drop";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent,ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Red-IFTS";
}

