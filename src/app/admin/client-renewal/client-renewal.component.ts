import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status, RenewalStatus } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;
declare var bootstrap: any;
interface Client {
  ClientId: number;
  ClientCompanyName: string;
}

@Component({
  selector: 'app-client-renewal',
  templateUrl: './client-renewal.component.html',
  styleUrls: ['./client-renewal.component.css']
})
export class ClientRenewalComponent {

  dataLoading: boolean = false
  clientRenewalList: any = []
  ClientRenewal: any = {}
  isSubmitted = false
  StatusList = this.loadData.GetEnumList(Status);
  RenewalStatusList = this.loadData.GetEnumList(RenewalStatus);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  // AllStatusList = Status;
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
    this.ClientRenewalList();
    this.ClientList();
    this.ProjectList();
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
    if (this.formClientRenewal) {
      this.formClientRenewal.resetForm({
        Status: 1   // default value
      });
    }

    this.ClientRenewal = {};
    this.ClientRenewal.Status = 1;

    this.isSubmitted = false;
  }

  resetFormEdit() {
    if (this.formClientRenewal) {
      this.formClientRenewal.resetForm({
        Status: 1   // default value
      });
    }

    this.ClientRenewal = {};
    this.ClientRenewal.Status = 1;

    this.isSubmitted = false;
    this.ClientRenewalList();

  }


  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }


  @ViewChild('formClientRenewal') formClientRenewal: NgForm;


  saveClientRenewal() {
    this.isSubmitted = true;
    this.formClientRenewal.control.markAllAsTouched();
    if (this.formClientRenewal.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.ClientRenewal.CreatedBy = this.staffLogin.StaffLoginId;

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.ClientRenewal)).toString()
    }
    this.dataLoading = true;
    this.service.saveClientRenewal(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.ClientRenewal.ClientRenewalId > 0) {
          this.toastr.success("ClientRenewal Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("ClientRenewal added successfully")
        }


        this.resetForm()


        // ✅ CLOSE MODAL
        const modalEl = document.getElementById('staticBackdrop');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        this.dataLoading = false;
        this.ClientRenewalList();
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  // ClientRenewal list
  ClientRenewalList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;

    this.service.ClientRenewalList(obj).subscribe(
      (response: any) => {
        if (response.Message === ConstantData.SuccessMessage) {
          this.clientRenewalList = response.ClientRenewalList || [];
          console.log('ClientRenewal list loaded:', this.clientRenewalList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        console.error('ClientRenewalList API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }
  clientList: any = [];
  //client list
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
  projectList: any = [];
  //project type list
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
  deleteClientRenewal(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteClientRenewal(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.ClientRenewalList()
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

//edit
  editClientRenewal(item: any) {
    this.ClientRenewal = { ...item }; // clone object

  }
  filteredClientList: Client[] = [];

  filterClient(value: string) {
    if (!value) {
      this.filteredClientList = [];
      this.ClientRenewal.ClientId = null;
      return;
    }

    const filterValue = value.toLowerCase();

    this.filteredClientList = this.clientList.filter(
      (client: Client) =>
        client.ClientCompanyName.toLowerCase().includes(filterValue)
    );
  }


  onClientSelected(event: any) {
    const selectedName = event.option.value;

    const selectedClient = this.clientList.find(
      (x: Client) => x.ClientCompanyName === selectedName
    );

    if (selectedClient) {
      this.ClientRenewal.ClientId = selectedClient.ClientId;
    }
  }
  showAllClients() {
    this.filteredClientList = this.clientList.slice(0, 3); // limit suggestions
  }
  maxDate = new Date(); // today

  getStatusClass(status: number): string {
    switch (status) {
      case RenewalStatus.Pending:
        return 'badge text-bg-warning';   // 🟡 yellow
      case RenewalStatus.Confirm:
        return 'badge text-bg-success';   // 🟢 green
      case RenewalStatus.Cancelled:
        return 'badge text-bg-danger';    // 🔴 red
      default:
        return 'badge text-bg-secondary';
    }
  }
  getStatusText(status: number): string {
    switch (status) {
      case RenewalStatus.Pending:
        return 'Pending';
      case RenewalStatus.Confirm:
        return 'Confirm';
      case RenewalStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }
  formatDate(date: string): string {
    if (!date || date.startsWith('0001-01-01')) {
      return '-';
    }
    return new Date(date).toLocaleDateString('en-GB');
  }




}
