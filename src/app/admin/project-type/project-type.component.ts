import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;
declare var bootstrap: any;


@Component({
  selector: 'app-project-type',
  templateUrl: './project-type.component.html',
  styleUrls: ['./project-type.component.css']
})
export class ProjectTypeComponent {

    dataLoading: boolean = false
    projectList: any = []
    Project: any = {}
    isSubmitted = false
    StatusList = this.loadData.GetEnumList(Status);
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = false;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
    AllStatusList = Status;
    constructor(
      private service: AppService,
      private toastr: ToastrService,
      private loadData: LoadDataService,
      private localService: LocalService,
      private router: Router
    ) { }
  
    ngOnInit(): void {
      this.staffLogin = this.localService.getEmployeeDetail();
      this.validiateMenu();
      this.ProjectList();
      // this.resetForm();
    }
  
    validiateMenu() {
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
      }
      this.dataLoading = true
      this.service.validiateMenu(obj).subscribe((response: any) => {
        this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
        this.dataLoading = false;
      }, (err => {
        this.toastr.error("Error while fetching records")
        this.dataLoading = false;
      }))
    }
    resetForm() {
      if (this.formProject) {
        this.formProject.resetForm({
          Status: 1   // default value
        });
      }
  
      this.Project = {};
      this.Project.Status = 1;
  
      this.isSubmitted = false;
    }
  
    resetFormEdit() {
      if (this.formProject) {
        this.formProject.resetForm({
          Status: 1   // default value
        });
      }
  
      this.Project = {};
      this.Project.Status = 1;
  
      this.isSubmitted = false;
      this.ProjectList();
      
    }
  
  
    sort(key: any) {
      this.sortKey = key;
      this.reverse = !this.reverse;
    }
  
    onTableDataChange(p: any) {
      this.p = p
    }
  
  
    @ViewChild('formProject') formProject: NgForm;
  
  
    saveProject() {
      this.isSubmitted = true;
      this.formProject.control.markAllAsTouched();
      if (this.formProject.invalid) {
        this.toastr.error("Fill all the required fields !!")
        return
      }
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Project)).toString()
      }
      this.dataLoading = true;
      this.service.saveProject(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.Project.ProjectId > 0) {
            this.toastr.success("Project Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("Project added successfully")
          }
  
  
          this.resetForm()
  
  
          // ✅ CLOSE MODAL
          const modalEl = document.getElementById('staticBackdrop');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance.hide();
          this.dataLoading = false;
          this.ProjectList();
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while submitting data")
        this.dataLoading = false;
      }))
    }
  
    // Project list
  ProjectList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
  
    this.dataLoading = true;
  
    this.service.ProjectList(obj).subscribe(
      (response: any) => {
        if (response.Message === ConstantData.SuccessMessage) {
          this.projectList = response.ProjectList || [];
          console.log('Project list loaded:', this.projectList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        console.error('ProjectList API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }
  

  
    // delete
      deleteProject(obj: any) {
      if (confirm("Are your sure you want to delete this recored")) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString()
        }
        this.dataLoading = true;
        this.service.deleteProject(request).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success("Record Deleted successfully")
            this.ProjectList()
          } else {
            this.toastr.error(response.Message)
        this.dataLoading = false;
      }
        }, (err => {
          this.toastr.error("Error occured while deleteing the recored")
          this.dataLoading = false;
        }))
      }
    }
  
    // edit
      editProject(item: any) {
    this.Project = { ...item }; // clone object

  }

}
