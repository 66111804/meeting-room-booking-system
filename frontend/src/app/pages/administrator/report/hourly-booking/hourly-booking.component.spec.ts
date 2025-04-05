import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyBookingComponent } from './hourly-booking.component';

describe('HourlyBookingComponent', () => {
  let component: HourlyBookingComponent;
  let fixture: ComponentFixture<HourlyBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourlyBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourlyBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
