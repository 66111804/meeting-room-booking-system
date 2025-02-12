import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';


import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { environment } from '../../../environments/environment';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgClass} from '@angular/common';
import {NgbCollapse, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SimplebarAngularModule} from 'simplebar-angular';
import {findActiveMenuItem, isRouteMatching} from '../../shared/utils/sidebar';
import {AuthenticationService} from '../../core/services/auth.service';
import {TokenStorageService} from '../../core/services/token-storage.service';
import {HasRole} from '../../store/Authentication/auth.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass,
    NgbCollapse,
    SimplebarAngularModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent implements OnInit, AfterViewInit
{

  menu: any;
  toggle: any = true;
  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  userPermission: any = [];
  roles: HasRole[] = [];

  constructor(private router: Router,
              public translate: TranslateService,
              private modalService: NgbModal,
              private authService: AuthenticationService,
              private tokenStorageService: TokenStorageService) {
    translate.setDefaultLang('en');

    const permission = this.tokenStorageService.getPermissions();
    console.log({permission});

    this.roles = this.tokenStorageService.getRole();
  }

  ngOnInit(): void {
    // Menu Items
    this.menuItems = MENU;
    // Permission
    // console.log(this.menuItems);
    console.log(this.roles);

    for(let i = 0; i < this.menuItems.length; i++) {

      if(this.menuItems[i].link === '/admin' && !this.isRoleMatched('admin'))
      {
        // Remove the menu item from the list
        this.menuItems.splice(i, 1);
        console.log('Not matched');
      }
      if(this.menuItems[i].subItems){
        const subItems = this.menuItems[i].subItems;
       if(subItems){
         for(let j = 0; j < subItems.length; j++){
           console.log(subItems[j].link);
         }
       }
      }
    }


    // router event
    this.router.events.subscribe((event) => {
      if (document.documentElement.getAttribute('data-layout') != "twocolumn") {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
        }
      }
    });
  }

  isRoleMatched(role: string): boolean {
    console.log({role_match: role, isMatched: this.roles.some((r) => r.name === role)});
    return this.roles.some((r) => r.name === role);
  }
  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 100);
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove("active");
    });
  }

  toggleItem(item: any) {
    this.menuItems.forEach((menuItem: any) => {

      if (menuItem == item) {
        menuItem.isCollapsed = !menuItem.isCollapsed
      } else {
        menuItem.isCollapsed = true
      }
      if (menuItem.subItems) {
        menuItem.subItems.forEach((subItem: any) => {

          if (subItem == item) {
            menuItem.isCollapsed = !menuItem.isCollapsed
            subItem.isCollapsed = !subItem.isCollapsed
          } else {
            subItem.isCollapsed = true
          }
          if (subItem.subItems) {
            subItem.subItems.forEach((childitem: any) => {

              if (childitem == item) {
                childitem.isCollapsed = !childitem.isCollapsed
                subItem.isCollapsed = !subItem.isCollapsed
                menuItem.isCollapsed = !menuItem.isCollapsed
              } else {
                childitem.isCollapsed = true
              }
              if (childitem.subItems) {
                childitem.subItems.forEach((childrenitem: any) => {

                  if (childrenitem == item) {
                    childrenitem.isCollapsed = false
                    childitem.isCollapsed = false
                    subItem.isCollapsed = false
                    menuItem.isCollapsed = false
                  } else {
                    childrenitem.isCollapsed = true
                  }
                })
              }
            })
          }
        })
      }
    });
  }

  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    let pathName = window.location.pathname;
    // Check if the application is running in production
    if (environment.production) {
      // Modify pathName for production build
      pathName = pathName.replace('/velzon/angular/default', '');
    }

    // Find the active menu item
    // const active = this.findMenuItem(pathName, this.menuItems)
    const activeItem = findActiveMenuItem(pathName, this.menuItems);
    if(activeItem) {
      this.toggleItem(activeItem)
    }
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        // if (environment.production) {
        //   let path = x.pathname
        //   path = path.replace('/velzon/angular/default', '');
        //   return path === pathName;
        // } else {
        //   return x.pathname === pathName;
        // }

        const itemPath =  environment.production ? x.pathname.replace('/velzon/angular/default', '') : x.pathname;
        return isRouteMatching(pathName, itemPath);
      });

      if (matchingMenuItem) {
        this.toggleItem(activeItem);
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  private findMenuItem(pathname: string, menuItems: any[]): any {
    for (const menuItem of menuItems) {
      if (menuItem.link && menuItem.link === pathname) {
        return menuItem;
      }

      if (menuItem.subItems) {
        const foundItem = this.findMenuItem(pathname, menuItem.subItems);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }
  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover');

    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

  confirmLogout(modal: any) {
    this.modalService.open(modal, { centered: true });
  }

  logout(){
    this.modalService.dismissAll();
    this.authService.logout();

    this.router.navigate(['/login']).then();
  }
}
// Compare this snippet from src/app/layouts/sidebar/sidebar.component.html:
