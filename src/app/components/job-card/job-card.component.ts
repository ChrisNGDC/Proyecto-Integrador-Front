// job-card.component.ts
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { JobOpportunity } from "../../models/job-opportunity";

@Component({
  selector: "app-job-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./job-card.component.html",
  styleUrls: ["./job-card.component.css"]
})
export class JobCardComponent {
  @Input({ required: true }) job!: JobOpportunity;
 @Output() viewDetails = new EventEmitter<string>();


  
}