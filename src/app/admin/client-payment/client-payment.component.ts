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
import { PaymentMode } from '../../utils/enum';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-client-payment',
  templateUrl: './client-payment.component.html',
  styleUrls: ['./client-payment.component.css']
})
export class ClientPaymentComponent {
  dataLoading: boolean = false
  clientPaymentList: any = []
  ClientPayment: any = {}
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
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  AllStatusList = Status;
  loadDataService: any;
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
    this.ClientPaymentList();
    this.resetForm();
    this.ClientList();
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
    if (this.formClientPayment) {
      this.formClientPayment.resetForm({
        Status: 1   // default value
      });
    }

    this.ClientPayment = {};
    this.ClientPayment.Status = 1;

    this.isSubmitted = false;
    this.ClientPaymentList();

  }
  getPaymentModeName(modeId: number): string {
    return this.PaymentModeList.find(x => x.Key === modeId)?.Value || '';
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }


  @ViewChild('formClientPayment') formClientPayment: NgForm;


  saveClientPayment() {
    this.isSubmitted = true;
    this.formClientPayment.control.markAllAsTouched();
    if (this.formClientPayment.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.ClientPayment)).toString()
    }
    this.dataLoading = true;
    this.service.saveClientPayment(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.ClientPayment.ClientPaymentId > 0) {
          this.toastr.success("ClientPayment Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("ClientPayment added successfully")
        }


        this.resetForm()


        // ✅ CLOSE MODAL
        const modalEl = document.getElementById('staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        this.dataLoading = false;
        // this.getClientPaymentList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  // ClientPayment list
  ClientPaymentList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;

    this.service.ClientPaymentList(obj).subscribe(
      (response: any) => {
        if (response.Message === ConstantData.SuccessMessage) {
          this.clientPaymentList = response.ClientPaymentList || [];
          console.log('ClientPayment list loaded:', this.clientPaymentList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        console.error('ClientPaymentList API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  // delete
  deleteClientPayment(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteClientPayment(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.ClientPaymentList()
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
  editClientPayment(obj: any) {
    this.resetForm()
    this.ClientPayment = obj
  }
    projectList: any = []
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


  clientList: any = []
  singleClient: any = []
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



      clearClientName() {
    // this.ClientPayment.ClientName = '';
    this.ClientPayment.ClientId = null;

    // Restore full list
    this.singleClient = this.clientList.slice();
  }


  //     afterClientSelected(event: any) {
  //   this.ClientPayment.ClientPaymentId = event.option.id;
  //   //this.CakeBooking.CustomerName = event.option.value;
  //   var client = this.ClientList.find(
  //     (x: any) => x.ClientPaymentId == this.ClientPayment.ClientId
  //   );
  //   this.OpdPatient.UHIDNo = Patient.UHIDNo;
  //   this.OpdPatient.MobileNo = Patient.MobileNo;
  //   this.OpdPatient.PatientNameauto = Patient.PatientName;
  //   this.OpdPatient.Age = Patient.Age;
  //   this.OpdPatient.Address = Patient.Address;
  //   this.OpdPatient.AadharNo = Patient.AadharNo;
  //   this.OpdPatient.BloodGroup = Patient.BloodGroup;
  //   console.log(this.OpdPatient.BloodGroup);
  // }

filterPatientList(){
  
}
  filterClientList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.singleClient = this.clientList.filter((option: any) =>
        option.SearchClient.toLowerCase().includes(filterValue)
      );
    } else {
      this.singleClient = this.clientList;
    }
    // this.OpdPatient.PatientId = 0;
  }

  onClientSelected(event: any) {
  const selectedClient = this.clientList.find(
    (    x: { ClientCompanyName: any; }) => x.ClientCompanyName === event.option.value
  );

  if (selectedClient) {
    this.ClientPayment.ClientId = selectedClient.ClientId;
    this.ClientPayment.ClientCompanyName = selectedClient.ClientCompanyName;
  }
}




}
