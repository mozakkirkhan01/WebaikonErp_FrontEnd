// import { Component } from '@angular/core';
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
  selector: 'app-manage-client',
  templateUrl: './manage-client.component.html',
  styleUrls: ['./manage-client.component.css']
})
export class ManageClientComponent {
  dataLoading: boolean = false
  clientList: any = []
  Client: any = {}
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
    this.getStateList();
    this.ClientList();
    this.resetForm();
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
    if (this.formClient) {
      this.formClient.resetForm({
        Status: 1   // default value
      });
    }

    this.Client = {};
    this.Client.Status = 1;

    this.isSubmitted = false;
    this.ClientList();
    
  }


  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }


  @ViewChild('formClient') formClient: NgForm;


  saveClient() {
    this.isSubmitted = true;
    this.formClient.control.markAllAsTouched();
    if (this.formClient.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Client)).toString()
    }
    this.dataLoading = true;
    this.service.saveClient(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Client.ClientId > 0) {
          this.toastr.success("Client Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Client added successfully")
        }


        this.resetForm()


        // ✅ CLOSE MODAL
        const modalEl = document.getElementById('staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        this.dataLoading = false;
        // this.getClientList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  // client list
ClientList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.ClientList(obj).subscribe(
    (response: any) => {
      if (response.Message === ConstantData.SuccessMessage) {
        this.clientList = response.ClientList || [];
        console.log('Client list loaded:', this.clientList);
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    },
    (err) => {
      console.error('ClientList API error:', err);
      this.toastr.error('Error while fetching records');
      this.dataLoading = false;
    }
  );
}


  StateList: any = {};
  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getStateList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StateList = response.StateList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  onStateSelected(stateId: number) {
    const selectedState = this.StateList.find(
      (x: any) => x.StateId === stateId
    );

    if (selectedState) {
      this.Client.StateCode = selectedState.StateCode;
      this.Client.StateName = selectedState.StateName; // optional but useful
    } else {
      this.Client.StateCode = null;
    }
  }

  // delete
    deleteClient(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteClient(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.ClientList()
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
    editClient(obj: any) {
    this.resetForm()
    this.Client = obj
  }


}
