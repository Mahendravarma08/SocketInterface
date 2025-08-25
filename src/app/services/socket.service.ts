// import { Injectable } from '@angular/core';
// import { Socket, io } from 'socket.io-client';
// import { environment } from '../../environments/environment.development';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class SocketService {

//   socket:Socket | undefined

//   constructor() {
//   }


//   connect(username:string){
//     if(!this.socket){
//       this.socket = io(environment.apiUrl,{
//         query : {username}
//       })
//     }
//   }

//   sendMesssage(message:any){
//     this.socket?.emit('send-message',message)
//   }
// }

import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: Socket | undefined;
  isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();

  constructor() { }

  connect(username: string) {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        query: { username }
      });
      this.socket.on('connect', () => {
        this.isConnectedSubject.next(true);
      });
    }
  }

  sendMessage(message: any) {
    if (this.socket) {
      this.socket.emit('send-message', message);
    }
  }

  sendGroupMessage(message: any) {
    console.log(this.socket, "this.socket")
    if (this.socket) {
      // this.socket.emit('send-message', message);
      this.socket.emit('sendGroupMessage',message, message.groupId);
    }
  }

  // Add a method to listen for incoming messages
  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  recieveGroupMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('messageReceived', callback);
    }
  }

}

