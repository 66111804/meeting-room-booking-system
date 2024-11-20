import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';

import { RootReducerState } from '../store';
import {Store} from '@ngrx/store';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NgbCollapseModule, NgbDropdownModule, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import {HorizontalComponent} from './horizontal/horizontal.component';
import {HorizontalTopbarComponent} from './horizontal-topbar/horizontal-topbar.component';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {VerticalComponent} from './vertical/vertical.component';
import {TwoColumnComponent} from './two-column/two-column.component';
import {TopbarComponent} from './topbar/topbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {FooterComponent} from './footer/footer.component';
import {TwoColumnSidebarComponent} from './two-column-sidebar/two-column-sidebar.component';
import {LanguageService} from '../core/services/language.service';


@Component({
  selector: 'app-layouts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    VerticalComponent, HorizontalComponent, TwoColumnComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [LanguageService],
  templateUrl: './layouts.component.html',
  styleUrl: './layouts.component.scss'
})
export class LayoutsComponent implements OnInit
{
  layoutType!: string;

  constructor(private store: Store<RootReducerState>) { }

  ngOnInit(): void {

    this.store.select('layout').subscribe((data) => {
      console.log(data);
      this.layoutType = data.LAYOUT;
      document.documentElement.setAttribute('data-layout', data.LAYOUT);
      document.documentElement.setAttribute('data-bs-theme', data.LAYOUT_MODE);
      document.documentElement.setAttribute('data-layout-width', data.LAYOUT_WIDTH);
      document.documentElement.setAttribute('data-layout-position', data.LAYOUT_POSITION);
      document.documentElement.setAttribute('data-topbar', data.TOPBAR);
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar', data.SIDEBAR_COLOR) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar-size', data.SIDEBAR_SIZE) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-sidebar-image', data.SIDEBAR_IMAGE) : '';
      data.LAYOUT == "vertical" || data.LAYOUT == "twocolumn" ? document.documentElement.setAttribute('data-layout-style', data.SIDEBAR_VIEW) : '';
      document.documentElement.setAttribute('data-preloader', data.DATA_PRELOADER)
      document.documentElement.setAttribute('data-sidebar-visibility', data.SIDEBAR_VISIBILITY);
    })
  }

  /**
   * Check if the vertical layout is requested
   */
  isVerticalLayoutRequested() {
    return this.layoutType === 'vertical';
  }

  /**
   * Check if the semibox layout is requested
   */
  isSemiboxLayoutRequested() {
    return this.layoutType === 'semibox';
  }

  /**
   * Check if the horizontal layout is requested
   */
  isHorizontalLayoutRequested() {
    return this.layoutType === 'horizontal';
  }

  /**
   * Check if the horizontal layout is requested
   */
  isTwoColumnLayoutRequested() {
    return this.layoutType === 'twocolumn';
  }

}