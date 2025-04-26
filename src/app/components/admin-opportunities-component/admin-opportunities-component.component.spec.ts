import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpportunitiesComponentComponent } from './admin-opportunities-component.component';

describe('AdminOpportunitiesComponentComponent', () => {
  let component: AdminOpportunitiesComponentComponent;
  let fixture: ComponentFixture<AdminOpportunitiesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOpportunitiesComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOpportunitiesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
