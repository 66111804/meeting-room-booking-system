import {Component, CUSTOM_ELEMENTS_SCHEMA, model, OnInit} from '@angular/core';
import { RoomFeaturesResponse, RoomFeaturesService} from '../../../../core/services/room-features.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {IMAGE_CONFIG, NgClass, NgOptimizedImage} from '@angular/common';
import Swal from 'sweetalert2';
import {Feature} from '../../../../core/services/room-meeting.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    TranslatePipe,
    NgbPagination,
    ReactiveFormsModule,
    NgClass,
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers:[
    {
      provide: IMAGE_CONFIG,
      useValue: {
        placeholderResolution: 40
      }
    },
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent implements OnInit
{
  features: RoomFeaturesResponse;
  page = 1;
  pageSize = 15;
  searchTerm: string = '';
  featureForm: UntypedFormGroup;
  nameSubject: Subject<string> = new Subject<string>();
  constructor(private service:RoomFeaturesService, private modalService:NgbModal,private formBuilder: UntypedFormBuilder,private translate: TranslateService) {
    this.features = {
      features: [],
      total: 0,
      totalPages: 0,
      current: 0
    }
    this.featureForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }
  ngOnInit() {
    document.getElementById('elmLoader')?.classList.add('d-none');
    this.fetchFeatures();

    this.nameSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value) => {
      console.log(value);
      if(value.length > 0)
      {
        this.validateFeatureName(value);
      }else{
        this.featureForm.get('name')?.setErrors({ 'required': true });
      }
    });
  }

  /**
   * Validate feature name
   */
  validateFeatureName(name:string, id:number = 0) {
    this.service.validateFeature(name, id).subscribe(
      {
        next: (data) => {
          console.log(data.valid);
          if (!data.valid) {
            this.featureForm.get('name')?.setErrors({ 'invalid': true });
          }else{
            this.featureForm.get('name')?.setErrors(null);
            // set valid
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      }
    );

  }

  /**
   * Fetch features
   */
  fetchFeatures() {
    this.service.getAll(this.page,this.pageSize).subscribe(
      {
        next: (data) => {
          this.features = data;
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      }
    );
  }
  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    // clear form
    this.featureForm.reset();
    this.editFeature = undefined;
    this.deleteFeature = undefined;
    // open modal
    this.modalService.open(content, { size: 'md', centered: true });
  }

  changePage(){
    this.fetchFeatures();
  }

  onSave(modal: any): void {
    modal.close('Save click');
    // Move focus back to trigger button
    const triggerButton = document.getElementById('triggerButton');
    if (triggerButton) {
      triggerButton.focus();
    }

    this.service.createFeature(this.featureForm.get('name')?.value).subscribe({
      next: (data) => {
        console.log(data);
        this.fetchFeatures();
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }


  nameChangeCreateChange(event: any) {
    this.nameSubject.next(this.featureForm.get('name')?.value);
  }

  deleteId: any;
  deleteFeature: Feature | undefined;
  confirm(content: any, feature:Feature) {
    this.deleteId = feature.id;
    this.deleteFeature = feature;
    this.modalService.open(content, { centered: true });
  }

  deleteData(modal: any){
    modal.close('Close click');
    // Move focus back to trigger button
    const triggerButton = document.getElementById('triggerButton');
    if (triggerButton) {
      triggerButton.focus();
    }

    this.service.deleteFeature(this.deleteId).subscribe({
      next: (data) => {
        this.translate.get(['Feature deleted successfully!','Success']).subscribe((translations: any) => {
          Swal.fire({
            icon: 'success',
            title: translations['Success'],
            text: translations['Feature deleted successfully!'],
            timer: 2000,
            showConfirmButton: true
          }).then();
        });
        this.fetchFeatures();
      },
      error: (error) => {
        console.error('There was an error!', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
          timer: 2000
        }).then();
      }
    });
  }

  editFeature: Feature|undefined;
  edit(content: any, feature:Feature) {
    this.editFeature = feature;
    this.featureForm.get('name')?.setValue(feature.name);
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onUpdate(modal: any) {
    modal.close('Save click');
    // Move focus back to trigger button
    const triggerButton = document.getElementById('triggerButton');
    if (triggerButton) {
      triggerButton.focus();
    }

    this.service.updateFeature(this.editFeature?.id || 0, this.featureForm.get('name')?.value).subscribe({
      next: (data) => {
        this.fetchFeatures();
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }
}
