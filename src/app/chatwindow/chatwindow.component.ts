import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ActivatedRoute } from '@angular/router';
import { usersList } from '../interfaces';
import { SocketService } from '../services/socket.service';
declare var $:any;

@Component({
  selector: 'app-chatwindow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatwindow.component.html',
  styleUrl: './chatwindow.component.scss'
})
export class ChatwindowComponent implements OnInit,AfterViewChecked  {
  @ViewChild('chatBody') private chatBody!: ElementRef;


  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  users: usersList[] = [];
  groups:any[] = []
  selectedUser: usersList | null = null;
  selectedGroup:string = null
  selectedGroupId:any = null
  messages: any[] = [];
  groupMessages:any[] = [];
  newMessage = '';
  groupMessage = '';
  groupTitle:string = ''
  currentUser: string = '';
  socketId: any = null;
  activeTab: string = 'individual';
  searchTerm: string = '';
  selectedUsers = {}
  filteredMembers = [];
  showPhotoOptions: boolean = false;
  selectedOptions: any[] = [];
  spinner:boolean = false;

  constructor(private httpService: HttpService, private route: ActivatedRoute, private socketService: SocketService) {}

  ngOnInit(): void {
    console.log('Component initializing...');
    
    this.route.queryParams.subscribe(params => {
      console.log('Route params:', params);
      this.currentUser = params['userName'] || 'DemoUser'; // Fallback if no username
      console.log('Current user set to:', this.currentUser);
      
      if (!this.socketService.socket) {
        this.socketService.connect(this.currentUser);
        this.socketId = this.socketService.socket;
      }

      this.socketService.socket.emit('joinGroup',this.currentUser)

      // Subscribe to incoming messages
      this.socketService.onMessage(message => {
        console.log('Received message:', message);
        this.messages.push(message);
      });
      this.socketService.recieveGroupMessage(message => {
        console.log('Received message:', message);
        this.groupMessages.push(message.message);
        console.log(this.groupMessages);
        
      });
    });
    
    // Add sample data immediately for testing
    console.log('Adding sample data...');
    // this.addSampleData();
    
    // Try to get users from API after a short delay
    setTimeout(() => {
      if (this.currentUser) {
        this.getUsers(this.currentUser);
      }
    }, 100);
    
    $('#messages-wrapper').animate( { scrollTop: $('#messages-wrapper').prop('scrollHeight') }, 750 );
    this.scrollToBottom();
    console.log('Component initialized with:', {
      activeTab: this.activeTab,
      selectedUser: this.selectedUser,
      selectedGroup: this.selectedGroup,
      usersCount: this.users.length,
      groupsCount: this.groups.length
    });
  }

  // Add sample data for testing
  addSampleData() {
    console.log('Adding sample data...');
    
    // Sample users for testing
    this.users = [
      { userName: 'John Doe', email: 'john@example.com', password: '', socketId: '1' },
      { userName: 'Jane Smith', email: 'jane@example.com', password: '', socketId: '2' },
      { userName: 'Mike Johnson', email: 'mike@example.com', password: '', socketId: '3' },
      { userName: 'Sarah Wilson', email: 'sarah@example.com', password: '', socketId: '4' },
      { userName: 'David Brown', email: 'david@example.com', password: '', socketId: '5' }
    ];
    
    // Sample groups for testing
    this.groups = [
      { groupTitle: 'Team Chat', id: 1 },
      { groupTitle: 'Project Discussion', id: 2 },
      { groupTitle: 'General', id: 3 }
    ];
    
    this.filteredMembers = [...this.users];
    
    // Force change detection
    this.users = [...this.users];
    this.groups = [...this.groups];
    
    // Auto-select first user to show chat
    if (this.users.length > 0 && !this.selectedUser) {
      this.selectUser(this.users[0]);
    }
    
    console.log('Sample data loaded:', {
      users: this.users,
      groups: this.groups,
      filteredMembers: this.filteredMembers,
      selectedUser: this.selectedUser
    });
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
        if (response && response.ok && response.messages && response.messages.length > 0) {
          this.messages = response.messages;
        } else {
          // No messages found - show empty conversation state
          this.messages = [];
          console.log('No messages found - showing empty conversation state');
        }
      },
      error: (error) => {
        console.error('Error getting messages:', error);
        // No messages due to error - show empty conversation state
        this.messages = [];
        console.log('Error getting messages - showing empty conversation state');
      }
    });
  }

  selectGroup(group) {
    console.log(group)
    this.selectedGroup = group.groupTitle;
    this.selectedGroupId = group._id;
    console.log(this.selectedGroup);

    // Get group messages from API
    const body = {
      currentUser: this.currentUser,
      groupId: this.selectedGroupId
    };

    this.httpService.getGroupMessages(body).subscribe({
      next: (response) => {
        console.log(response, "response_from_getGroupMessages");
        if (response && response.ok) {
          this.groupMessages = response.messages;
        } else {
          // No group messages found - show empty conversation state
          this.groupMessages = [];
          console.log('No group messages found - showing empty conversation state');
        }
      },
      error: (error) => {
        console.error('Error getting group messages:', error);
        // No messages due to error - show empty conversation state
        this.groupMessages = [];
        console.log('Error getting group messages - showing empty conversation state');
      }
    });
  }

  // TrackBy methods for performance
  trackByUserId(index: number, user: any): string {
    return user.socketId || user.userName || index.toString();
  }

  trackByGroupId(index: number, group: any): number {
    return group.id || index;
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

  sendMessageFromGroup(){
    if (this.groupMessage.trim()) {
      console.log(this.groupMessage);
      const body = {
        sender: this.currentUser,
        message: this.groupMessage,
        groupId:this.selectedGroupId
      };
      this.socketService.sendGroupMessage(body);
      this.groupMessage = '';
    }
  }

  getUsers(userName: string) {
    console.log('Calling getUsers with:', userName);
    this.httpService.getUsers({ userName }).subscribe({
      next: (response) => {
        console.log('getUsers response:', response);
        if (response && response.ok && response.users && response.users.length > 0) {
          this.users = response.users;
          this.filteredMembers = [...this.users];
          console.log('Users loaded from API:', this.users);
        } else {
          console.log('No users from API, keeping sample data');
          // Keep the sample data if API doesn't return users
        }
      },
      error: (error) => {
        console.error('Error getting users:', error);
        console.log('Keeping sample data due to API error');
        // Keep the sample data if API fails
      }
    });
  }
  
  async changechatmenu(menu: string) {
    this.activeTab = menu;
    console.log(this.activeTab,"activeTab");
    if(menu === 'group'){
      await this.httpService.getGroups({ userName:this.currentUser }).subscribe({
        next: (response) => {
          console.log(response);
          this.groups = response.groups
          for (const ele of this.groups) {
            console.log(ele,"elleee");
          }
        }
      });
    }
  }



  scrollToBottom(): void {
    if (this.chatBody) {
      try {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling chat body:', err);
      }
    }
  }

  openModal(){
    const modal = document.getElementById('createGroupModel');
    console.log(modal);
    // modal.classList.remove('hidden');
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

    console.log(this.groupTitle);
    
    
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

  openSettings(){
    console.log("opensettingsFunctonHIt")
  }
}
