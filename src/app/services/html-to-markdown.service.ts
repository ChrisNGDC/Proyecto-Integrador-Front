import { Injectable } from '@angular/core';
import TurndownService from 'turndown';


@Injectable({
  providedIn: 'root'
})
export class HtmlToMarkdownService {
  turndownService = new TurndownService();

  constructor() {}

  convert(html: string): string {
    return this.turndownService.turndown(html);
  }
}
