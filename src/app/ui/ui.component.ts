import {Component} from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-ui',
    imports: [
        NgbDropdownToggle,
        NgbDropdown,
        NgbDropdownMenu,
        NgbDropdownItem
    ],
    templateUrl: './ui.component.html',
    styleUrl: './ui.component.scss'
})
export class UiComponent {
}
