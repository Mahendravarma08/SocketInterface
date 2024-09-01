import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { selectedUser, signUp, userLogin } from '../interfaces';
import { API } from './endpoints';

@Injectable({
  providedIn: 'root' // Provide the service globally (adjust if needed)
})
export class HttpService {

  constructor(private http: HttpClient) { }
    httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  // ... methods for making HTTP requests

  login(body: userLogin) {
    
    return this.http.post<any>(API.LOGIN,body,this.httpOptions);
  }
  signUp(body: signUp) {
    return this.http.post<any>(API.SIGNUP,body,this.httpOptions); 
  }

  getUsers(userName:Object){
    return this.http.post<any>(API.GET_USERS,userName,this.httpOptions); 
  }
  getGroups(userName:Object){
    return this.http.post<any>(API.GET_GROUPS,userName,this.httpOptions); 
  }
  createGroup(body:Object){
    return this.http.post<any>(API.CREATE_GROUP,body,this.httpOptions); 
  }

  getMessages(body:selectedUser){
    return this.http.get<any>(`${API.GET_MESSAGES}/${body.currentUser}/${body.selectedUser}`,this.httpOptions); 
  }

  getGroupMessages(body){
    return this.http.get<any>(`${API.GET_GROUPMESSAGES}/${body.currentUser}/${body.groupId}`,this.httpOptions); 
  }
}

