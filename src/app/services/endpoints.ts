import { environment } from "../../environments/environment.development";

export const API = {
    LOGIN : `${environment.apiUrl}/login`,
    SIGNUP: `${environment.apiUrl}/signup`,
    GET_USERS : `${environment.apiUrl}/getUsers`,
    GET_GROUPS : `${environment.apiUrl}/getGroups`,
    CREATE_GROUP:`${environment.apiUrl}/createGroup`,
    GET_MESSAGES : `${environment.apiUrl}/messages`,
    
}