import { Component } from '@angular/core';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-ui',
  standalone: true,
  imports: [
    MatMenuTrigger,
    MatMenu,
    MatButton,
    MatMenuItem
  ],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent {

}
