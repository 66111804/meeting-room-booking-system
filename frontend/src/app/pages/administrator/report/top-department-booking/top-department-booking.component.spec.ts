import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopDepartmentBookingComponent } from './top-department-booking.component';

describe('TopDepartmentBookingComponent', () => {
  let component: TopDepartmentBookingComponent;
  let fixture: ComponentFixture<TopDepartmentBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopDepartmentBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopDepartmentBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
