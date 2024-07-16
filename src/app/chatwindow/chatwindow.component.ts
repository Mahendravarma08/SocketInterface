import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { usersList } from '../interfaces';
import { SocketService } from '../services/socket.service';
import { LoginComponent } from '../login/login.component';
import { InstantiateExpr } from '@angular/compiler';
declare var $:any;

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatwindow.component.html',
  styleUrl: './chatwindow.component.scss'
})
export class ChatwindowComponent implements OnInit {


  users: usersList[] = [];
  groups:any[] = []
  selectedUser: usersList | null = null;
  selectedGroup:string = null
  messages: any[] = [];
  newMessage = '';
  groupTitle:string = ''
  currentUser: string = '';
  socketId: any = null;
  activeTab: string = 'individual';
  searchTerm: string = '';
  selectedUsers = {}
  filteredMembers = [];
  showPhotoOptions: boolean = false;
  selectedOptions: any[] = [];
  spinner:boolean = false

  constructor(private httpService: HttpService, private route: ActivatedRoute, private socketService: SocketService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params, "params");
      this.currentUser = params['userName'];
      if (!this.socketService.socket) {
        this.socketService.connect(this.currentUser);
        this.socketId = this.socketService.socket;
      }

      // Subscribe to incoming messages
      this.socketService.onMessage(message => {
        console.log('Received message:', message);
        this.messages.push(message);
      });
    });
    this.getUsers(this.currentUser);
    $('#messages-wrapper').animate( { scrollTop: $('#messages-wrapper').prop('scrollHeight') }, 750 );
    this.scrollToBottom();
  }

  selectUser(user: usersList) {
    this.selectedUser = user;
    console.log(this.selectedUser);

    const body = {
      currentUser: this.currentUser,
      selectedUser: this.selectedUser.userName
    };

    this.httpService.getMessages(body).subscribe({
      next: (response) => {
        console.log(response, "response_from_getMessages");
        if (response && response.ok) {
          this.messages = response.messages;
        }
      }
    });
  }
  selectGroup(groupId) {
    this.selectedGroup = groupId;
    console.log(this.selectedGroup,"selectedGrouyop");
    
    // console.log(this.selectedUser);

    // const body = {
    //   currentUser: this.currentUser,
    //   selectedUser: this.selectedUser.userName
    // };

    // this.httpService.getMessages(body).subscribe({
    //   next: (response) => {
    //     console.log(response, "response_from_getMessages");
    //     if (response && response.ok) {
    //       this.messages = response.messages;
    //     }
    //   }
    // });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      console.log(this.newMessage);
      const body = {
        sender: this.currentUser,
        recipient: this.selectedUser?.userName,
        message: this.newMessage,
        socketId: this.selectedUser?.socketId
      };
      this.messages.push({
        sender: this.currentUser,
        recipient: this.selectedUser?.userName,
        message: this.newMessage
      });
      this.socketService.sendMessage(body);
      this.newMessage = '';
      // this.scrollToBottom();
    }
  }

  getUsers(userName: string) {
    this.httpService.getUsers({ userName }).subscribe({
      next: (response) => {
        console.log(response);
        if (response && response.ok) {
          this.users = response.users;
          this.filteredMembers = [...this.users]
          console.log(this.users);
        }
      }
    });
  }
  
  changechatmenu(menu: string) {
    this.activeTab = menu;
    console.log(this.activeTab,"activeTab");
    if(menu === 'group'){
      this.httpService.getGroups({ userName:this.currentUser }).subscribe({
        next: (response) => {
          console.log(response);
          this.groups = response.groups
        }
      });
    }
    // Your logic to handle menu change
  }

  scrollToBottom(){
    // console.log(this.scroll?.nativeElement?.scrollHeight);
    // this.scroll.nativeElement.scrollTop = this.scroll?.nativeElement.scrollHeight
  }

  openModal(){
    const modal = document.getElementById('my-modal');
    console.log(modal);
    
    const closeButton = document.getElementById('close-modal');
    modal.classList.remove('hidden');
    modal.classList.add('visible');
  }

  filterMembers() {
    this.filteredMembers = this.users.filter(member => 
      member.userName.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  togglePhotoOptions() {
    this.showPhotoOptions = !this.showPhotoOptions;
  }

  editPhoto(event: Event) {
    event.stopPropagation();
    console.log('Edit photo');
    // Add your edit photo logic here
  }

  deletePhoto(event: Event) {
    event.stopPropagation();
    console.log('Delete photo');
    // Add your delete photo logic here
  }

  createGroup() {
    console.log('Save changes');
    const selectedMembers = []
    for (const ele of this.filteredMembers) {
      if(ele['checked'])
        selectedMembers.push(ele.userName)
    }
    selectedMembers.push(this.currentUser)
    
    const body = {
      groupTitle:this.groupTitle,
      members : selectedMembers,
      admin:[this.currentUser]
    }

    this.httpService.createGroup(body).subscribe({
      next: (response) => {
        console.log(response);
        if (response && response.ok) {
          // this.users = response.users;
          // this.filteredMembers = [...this.users]
          // console.log(this.users);
        }
      }
    });

    console.log(body,"body");
  }

  resetGroupDetails(){
    this.groupTitle = ''
    for (const ele of this.filteredMembers) {
      ele['checked'] = false
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterMembers();
  }

  addToGroup(user,event:any){
    console.log(event,"fkjbkjbjk");
    
    console.log(user,"ehgvfvgehgffe")
    this.selectedUsers[user] = user
  }

  toggleSelection(userName: string,index:any) {
    console.log(userName,index,"index");
    this.filteredMembers[index]['checked'] = !this.filteredMembers[index]['checked']
    console.log(this.selectedOptions,this.filteredMembers[index]);
  }
}
