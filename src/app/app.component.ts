import {Component} from '@angular/core';
import {MapComponent} from "./map/map.component";
import {UiComponent} from "./ui/ui.component";

@Component({
    selector: 'app-root',
    imports: [MapComponent, UiComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Cloudspire';
}
